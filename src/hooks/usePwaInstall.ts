import { useState, useEffect, useCallback, useRef } from 'react';
import { useBrowserInfo } from './useBrowserInfo';

// Standard BeforeInstallPromptEvent interface
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const browserInfo = useBrowserInfo();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(browserInfo.isStandalone);
  const [isPrompting, setIsPrompting] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  promptRef.current = deferredPrompt;

  useEffect(() => {
    setIsInstalled(browserInfo.isStandalone);
  }, [browserInfo.isStandalone]);

  useEffect(() => {
    // If already installed in standalone mode, no installation needed
    if (browserInfo.isStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent automatic browser mini-infobar on mobile
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      setIsGuideOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [browserInfo.isStandalone]);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'guide' | 'unsupported'> => {
    const activePrompt = promptRef.current;

    // 1. If native Chromium install prompt is ready, trigger it directly
    if (activePrompt) {
      setIsPrompting(true);
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstallable(false);
          setIsInstalled(true);
        }
        return choice.outcome;
      } catch (err) {
        console.warn('Native PWA install prompt failed:', err);
        return 'unsupported';
      } finally {
        setIsPrompting(false);
      }
    }

    // 2. If on iOS Safari or manual browser, open step-by-step installation guide
    if (browserInfo.os === 'iOS' || browserInfo.installMethod === 'ios-share' || browserInfo.installMethod === 'manual-menu') {
      setIsGuideOpen(true);
      return 'guide';
    }

    return 'unsupported';
  }, [browserInfo.os, browserInfo.installMethod]);

  const closeGuide = useCallback(() => {
    setIsGuideOpen(false);
  }, []);

  return {
    isInstallable: isInstallable || (!isInstalled && browserInfo.os === 'iOS'),
    isInstalled,
    isPrompting,
    isGuideOpen,
    browserInfo,
    promptInstall,
    closeGuide,
    setIsGuideOpen,
  };
}
