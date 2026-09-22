import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings2, Smartphone, Download, RefreshCw } from 'lucide-react';
import { Card } from '../../../components/Card/Card';
import Checkbox from '../../../components/Checkbox/Checkbox';
import SelectDropdown, { type SelectOption } from '../../../components/Dropdown/SelectDropdown';
import Badge from '../../../components/Badge/Badge';
import Button from '../../../components/Button/Button';
import { useTheme } from '../../../hooks/useTheme';
import type { Theme } from '../../../context/themeContext';
import { useUserPreferencesQuery, usePatchUserPreferencesMutation } from '../../../api/useApiQueries';
import { usePushNotifications } from '../../../hooks/usePushNotifications';
import { usePwaInstall } from '../../../hooks/usePwaInstall';
import PwaInstallModal from '../../../components/PwaInstallModal/PwaInstallModal';
import type { PatchUserPreferencesRequest } from '../../../api/Services/UserServices';

const themeOptions: SelectOption<Theme>[] = [
  {
    value: 'light',
    label: 'Light',
  },
  {
    value: 'dark',
    label: 'Dark',
  },
  {
    value: 'system',
    label: 'System',
  },
];

export default function UserPreferencesCard() {
  const { theme: localTheme, setTheme: setLocalTheme } = useTheme();
  const { data: serverPreferences } = useUserPreferencesQuery();
  const patchPreferencesMutation = usePatchUserPreferencesMutation();

  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    isSubscribed,
    isLoading: isPushLoading,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
    syncExistingSubscription,
  } = usePushNotifications();

  const {
    isInstalled,
    isPrompting,
    isGuideOpen,
    browserInfo,
    promptInstall,
    closeGuide,
  } = usePwaInstall();

  // Local state for optimistic UI updates
  const [autoSubmit, setAutoSubmit] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(localTheme);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncingPush, setIsSyncingPush] = useState<boolean>(false);
  const hasLoadedInitialServerPreferencesRef = useRef<boolean>(false);

  // Sync initial server preferences once on mount
  useEffect(() => {
    if (serverPreferences && !hasLoadedInitialServerPreferencesRef.current) {
      hasLoadedInitialServerPreferencesRef.current = true;
      if (serverPreferences.autoSubmitPreset !== undefined && serverPreferences.autoSubmitPreset !== null) {
        setAutoSubmit(Boolean(serverPreferences.autoSubmitPreset));
      }
      if (serverPreferences.emailNotifications !== undefined && serverPreferences.emailNotifications !== null) {
        setEmailNotifications(Boolean(serverPreferences.emailNotifications));
      }
      if (serverPreferences.pushNotifications !== undefined && serverPreferences.pushNotifications !== null) {
        setPushNotifications(Boolean(serverPreferences.pushNotifications));
      }
    }
  }, [serverPreferences]);

  // Keep selectedTheme aligned with local theme context
  useEffect(() => {
    setSelectedTheme(localTheme);
  }, [localTheme]);

  // Debounced patch queue
  const pendingChangesRef = useRef<PatchUserPreferencesRequest>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushChanges = useCallback(async () => {
    if (Object.keys(pendingChangesRef.current).length === 0) return;

    const payload = { ...pendingChangesRef.current };
    pendingChangesRef.current = {};
    setIsSaving(true);

    try {
      await patchPreferencesMutation.mutateAsync(payload);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setIsSaving(false);
    }
  }, [patchPreferencesMutation]);

  const queuePreferenceUpdate = useCallback(
    (changes: PatchUserPreferencesRequest) => {
      pendingChangesRef.current = {
        ...pendingChangesRef.current,
        ...changes,
      };

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void flushChanges();
      }, 450);
    },
    [flushChanges]
  );

  // Handlers with instant optimistic UI + debounced network mutation
  const handleThemeChange = (newTheme: Theme) => {
    // 1. Immediately reflects in state, DOM, and localStorage without glitch
    setSelectedTheme(newTheme);
    setLocalTheme(newTheme);
    // 2. Debounced save in background
    const apiTheme = newTheme.toUpperCase() as 'LIGHT' | 'DARK' | 'SYSTEM';
    queuePreferenceUpdate({ theme: apiTheme });
  };

  const handleAutoSubmitToggle = (checked: boolean) => {
    setAutoSubmit(checked);
    queuePreferenceUpdate({ autoSubmitPreset: checked });
  };

  const handleEmailToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    queuePreferenceUpdate({ emailNotifications: checked });
  };

  const handlePushToggle = async (checked: boolean) => {
    setPushNotifications(checked);
    queuePreferenceUpdate({ pushNotifications: checked });

    if (checked && isPushSupported) {
      await subscribePush();
    } else if (!checked && isPushSupported) {
      await unsubscribePush();
    }
  };

  const handleSyncPush = async () => {
    setIsSyncingPush(true);
    try {
      const synced = await syncExistingSubscription();
      if (!synced) {
        await subscribePush();
      }
    } finally {
      setIsSyncingPush(false);
    }
  };

  return (
    <>
      <Card
        header={{
          title: 'App Preferences',
          subtitle: 'Manage your theme, notifications, and automated meal selection',
          icon: <Settings2 size={18} />,
        }}
      >
        <div className="flex flex-col gap-5 py-2 px-2">
          {/* Theme Selection */}
          <div className="flex flex-row sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-text-primary">Theme Appearance</span>
                {isSaving && (
                  <span className="text-[10px] text-text-muted font-medium animate-pulse">Saving...</span>
                )}
              </div>
              <span className="text-xs text-text-secondary">
                Switch between light, dark, or system visual modes
              </span>
            </div>
            <div className="w-40">
              <SelectDropdown<Theme>
                value={selectedTheme}
                onChange={handleThemeChange}
                options={themeOptions}
                aria-label="Theme Appearance"
              />
            </div>
          </div>

          {/* Auto-Submit Default Presets Toggle */}
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-text-primary">Auto-submit Presets</span>
              <span className="text-xs text-text-secondary leading-relaxed">
                Automatically submit default meal preset when weekly selection opens
              </span>
            </div>
            <Checkbox
              variant="toggle"
              checked={autoSubmit}
              onChange={handleAutoSubmitToggle}
            />
          </div>

          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">Email Notifications</span>
              </div>
              <span className="text-xs text-text-secondary leading-relaxed mt-0.5">
                Receive reminder emails when selection opens and menu updates occur
              </span>
            </div>
            <Checkbox
              variant="toggle"
              checked={emailNotifications}
              onChange={handleEmailToggle}
            />
          </div>

          {/* Push Notifications Toggle */}
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text-primary">Push Notifications</span>
                  {isSubscribed ? (
                    <Badge variant="success" size="xs" label="Subscribed" />
                  ) : pushPermission === 'denied' ? (
                    <Badge variant="danger" size="xs" label="Blocked in Browser" />
                  ) : isPushSupported ? (
                    <Badge variant="neutral" size="xs" label="Supported" />
                  ) : (
                    <Badge variant="neutral" size="xs" label="Not Supported" />
                  )}
                </div>
                <span className="text-xs text-text-secondary leading-relaxed mt-0.5">
                  Instant alerts for meal arrival, pickup readiness, and weekly deadlines
                </span>
              </div>
              <Checkbox
                variant="toggle"
                checked={pushNotifications}
                onChange={handlePushToggle}
                disabled={!isPushSupported || isPushLoading}
              />
            </div>

            {/* iOS PWA Requirement note */}
            {browserInfo.pushRequiresPwaFirst && (
              <div className="mt-1 p-2.5 rounded-xl bg-info-light border border-info/20 text-xs text-info-dark flex items-center gap-2">
                <Smartphone size={14} className="shrink-0" />
                <span>On iOS, install Edziban to your Home Screen first to receive push notifications.</span>
              </div>
            )}

            {/* Sync device button if turned on but not yet registered */}
            {pushNotifications && !isSubscribed && isPushSupported && (
              <div className="flex items-center justify-between gap-3 mt-2 pt-4 border-t border-dashed border-border">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-text-primary">Device notifications</span>
                  <span className="text-xs text-text-muted">
                    Enable notifications on this device
                  </span>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleSyncPush}
                  disabled={isSyncingPush || isPushLoading}
                >
                  <RefreshCw size={12} className={`mr-1 ${isSyncingPush ? 'animate-spin' : ''}`} />
                  {isSyncingPush ? 'Syncing...' : 'Register Device'}
                </Button>
              </div>
            )}
          </div>

          {/* PWA App Installation Section */}
          
        { !isInstalled && (
            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-text-primary">Install Application</span>
              <span className="text-xs text-text-secondary leading-relaxed mt-0.5">
                Install Edziban on your device for one-click access
              </span>
            </div>

            <Button
                size="sm"
                variant="outline"
                onClick={() => void promptInstall()}
                disabled={isPrompting}
              >
                <Download size={14} className="mr-1.5" />
                Install
              </Button>
          </div>)}
        </div>
      </Card>

      <PwaInstallModal
        isOpen={isGuideOpen}
        onClose={closeGuide}
        browserInfo={browserInfo}
      />
    </>
  );
}
