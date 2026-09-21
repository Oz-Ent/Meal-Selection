import { useState, useEffect } from 'react';
import {
  type BrowserName,
  type OperatingSystem,
  type IBrowserDetails,
  BROWSER_INSTALL_GUIDES,
} from '../config/browserConfig';

function detectBrowser(): { name: BrowserName; version: string } {
  if (typeof window === 'undefined' || !navigator) {
    return { name: 'Unknown', version: '' };
  }

  const ua = navigator.userAgent;

  // Brave detection
  if ((navigator as unknown as { brave?: { isBrave?: () => Promise<boolean> } }).brave) {
    return { name: 'Brave', version: '' };
  }

  // Samsung Internet
  if (/SamsungBrowser\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/SamsungBrowser\/([0-9.]+)/i);
    return { name: 'Samsung', version: match ? match[1] : '' };
  }

  // Opera / OPR
  if (/OPR\/([0-9.]+)/i.test(ua) || /Opera\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/(?:OPR|Opera)\/([0-9.]+)/i);
    return { name: 'Opera', version: match ? match[1] : '' };
  }

  // Edge (Edg or Edge)
  if (/Edg(?:e)?\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Edg(?:e)?\/([0-9.]+)/i);
    return { name: 'Edge', version: match ? match[1] : '' };
  }

  // Chrome (must check after Edge and Opera because they also include Chrome in UA)
  if (/Chrome\/([0-9.]+)/i.test(ua) && !/Chromium/i.test(ua)) {
    const match = ua.match(/Chrome\/([0-9.]+)/i);
    return { name: 'Chrome', version: match ? match[1] : '' };
  }

  // Firefox
  if (/Firefox\/([0-9.]+)/i.test(ua)) {
    const match = ua.match(/Firefox\/([0-9.]+)/i);
    return { name: 'Firefox', version: match ? match[1] : '' };
  }

  // Safari (must check after Chrome because Chrome UA includes Safari)
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    const match = ua.match(/Version\/([0-9.]+)/i);
    return { name: 'Safari', version: match ? match[1] : '' };
  }

  return { name: 'Unknown', version: '' };
}

function detectOS(): OperatingSystem {
  if (typeof window === 'undefined' || !navigator) {
    return 'Unknown';
  }

  const ua = navigator.userAgent;
  const platform = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || '';

  if (/iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1)) {
    return 'iOS';
  }
  if (/Android/i.test(ua)) {
    return 'Android';
  }
  if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) {
    return 'macOS';
  }
  if (/Win/i.test(platform) || /Windows/i.test(ua)) {
    return 'Windows';
  }
  if (/Linux/i.test(platform) || /Linux/i.test(ua)) {
    return 'Linux';
  }

  return 'Unknown';
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function useBrowserInfo(): IBrowserDetails {
  const [details, setDetails] = useState<IBrowserDetails>(() => {
    const { name, version } = detectBrowser();
    const os = detectOS();
    const isStandalone = checkIsStandalone();
    const isMobile =
      typeof window !== 'undefined' &&
      (window.matchMedia('(max-width: 768px)').matches || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));

    const pushSupported =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;

    // iOS requires iOS 16.4+ AND being installed to Home Screen (standalone) for Web Push
    const pushRequiresPwaFirst = os === 'iOS' && !isStandalone;

    const guide = BROWSER_INSTALL_GUIDES[name] || BROWSER_INSTALL_GUIDES.Unknown;
    const canPromptNativeInstall = guide.installMethod === 'native-prompt';

    const pushTroubleshooting = [
      'Ensure notifications are permitted in your browser site settings.',
      ...(guide.pushQuirks ? [guide.pushQuirks] : []),
    ];

    return {
      name,
      os,
      version,
      isMobile,
      isStandalone,
      canPromptNativeInstall,
      installMethod: guide.installMethod,
      installInstructions: guide.instructions,
      pushSupported,
      pushRequiresPwaFirst,
      pushTroubleshooting,
    };
  });

  useEffect(() => {
    const updateStandalone = () => {
      const isStandalone = checkIsStandalone();
      setDetails((prev) => ({
        ...prev,
        isStandalone,
        pushRequiresPwaFirst: prev.os === 'iOS' && !isStandalone,
      }));
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', updateStandalone);
    return () => mediaQuery.removeEventListener('change', updateStandalone);
  }, []);

  return details;
}
