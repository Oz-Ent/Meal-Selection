import { useState, useEffect, useCallback } from 'react';
import { VAPID_PUBLIC_KEY } from '../utils/misc/config';
import { notificationService } from '../api/Services/NotificationServices';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Safely retrieves or registers a service worker without hanging indefinitely on ready.
 */
async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser.');
  }

  // 1. If an active registration already exists, use it
  let registration = await navigator.serviceWorker.getRegistration();
  if (registration?.active) {
    return registration;
  }

  // 2. Attempt fallback registration of /push-sw.js if not registered yet
  try {
    registration = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' });
  } catch (regErr) {
    console.warn('Direct SW registration note:', regErr);
  }

  // 3. Race navigator.serviceWorker.ready with a 5-second timeout so it never hangs indefinitely
  const readyPromise = navigator.serviceWorker.ready;
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Service worker readiness timed out after 5s.')), 5000)
  );

  return Promise.race([readyPromise, timeoutPromise]);
}

export function usePushNotifications() {
  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Synchronizes an existing push subscription with the backend database.
   */
  const syncExistingSubscription = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const registration = await getOrRegisterServiceWorker();
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        return false;
      }

      const subJson = subscription.toJSON();
      if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
        await notificationService.subscribe({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        });
        setIsSubscribed(true);
        return true;
      }
    } catch (err) {
      console.warn('Failed to sync existing push subscription:', err);
    }
    return false;
  }, [isSupported]);

  // Check existing push subscription on mount, and sync if permission is already granted
  useEffect(() => {
    if (!isSupported) return;

    let mounted = true;

    getOrRegisterServiceWorker()
      .then((registration) => registration.pushManager.getSubscription())
      .then(async (subscription) => {
        if (mounted) {
          const hasSub = Boolean(subscription);
          setIsSubscribed(hasSub);
          setPermission(Notification.permission);

          // If browser is subscribed and permission is granted, ensure backend has it
          if (hasSub && Notification.permission === 'granted' && subscription) {
            const subJson = subscription.toJSON();
            if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
              try {
                await notificationService.subscribe({
                  endpoint: subJson.endpoint,
                  p256dh: subJson.keys.p256dh,
                  auth: subJson.keys.auth,
                });
              } catch {
                // Non-critical background sync
              }
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Could not inspect push subscription on mount:', err);
      });

    return () => {
      mounted = false;
    };
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported by this browser.');
      return false;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (!VAPID_PUBLIC_KEY) {
        setError('Push notifications are not configured for this environment.');
        return false;
      }

      // 1. Request user permission
      const currentPermission = await Notification.requestPermission();
      setPermission(currentPermission);

      if (currentPermission !== 'granted') {
        setError(
          currentPermission === 'denied'
            ? 'Notification permission was denied. Please allow notifications in your browser settings.'
            : 'Notification permission was dismissed.'
        );
        return false;
      }

      // 2. Get or register service worker
      const registration = await getOrRegisterServiceWorker();
      let subscription = await registration.pushManager.getSubscription();

      // 3. Create new push subscription if none exists
      if (!subscription) {
        const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey as unknown as BufferSource,
        });
      }

      // 4. Send subscription keys to backend
      const subJson = subscription.toJSON();
      if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
        await notificationService.subscribe({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        });
      }

      setIsSubscribed(true);
      setError(null);
      return true;
    } catch (err: unknown) {
      console.error('Error subscribing to push notifications:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to subscribe to push notifications.';
      setError(errMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setError(null);
    setIsLoading(true);

    try {
      const registration = await getOrRegisterServiceWorker();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        try {
          await notificationService.unsubscribe({ endpoint: subscription.endpoint });
        } catch (apiErr) {
          console.warn('Backend push unsubscribe warning:', apiErr);
        }
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch (err: unknown) {
      console.error('Error unsubscribing from push notifications:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to unsubscribe.';
      setError(errMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    syncExistingSubscription,
  };
}
