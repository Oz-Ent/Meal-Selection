import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings2 } from 'lucide-react';
import { Card } from '../../../components/Card/Card';
import Checkbox from '../../../components/Checkbox/Checkbox';
import SelectDropdown, { type SelectOption } from '../../../components/Dropdown/SelectDropdown';
import Badge from '../../../components/Badge/Badge';
import { useTheme } from '../../../hooks/useTheme';
import type { Theme } from '../../../context/themeContext';
import { useUserPreferencesQuery, usePatchUserPreferencesMutation } from '../../../api/useApiQueries';
import { usePushNotifications } from '../../../hooks/usePushNotifications';
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
  const { isSupported: isPushSupported, subscribe: subscribePush, unsubscribe: unsubscribePush } = usePushNotifications();

  // Local state for optimistic UI updates
  const [autoSubmit, setAutoSubmit] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(localTheme);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync initial server preferences
  useEffect(() => {
    if (serverPreferences) {
      if (serverPreferences.autoSubmitPreset !== undefined && serverPreferences.autoSubmitPreset !== null) {
        setAutoSubmit(Boolean(serverPreferences.autoSubmitPreset));
      }
      if (serverPreferences.emailNotifications !== undefined && serverPreferences.emailNotifications !== null) {
        setEmailNotifications(Boolean(serverPreferences.emailNotifications));
      }
      if (serverPreferences.pushNotifications !== undefined && serverPreferences.pushNotifications !== null) {
        setPushNotifications(Boolean(serverPreferences.pushNotifications));
      }
      if (serverPreferences.theme) {
        const themeLower = serverPreferences.theme.toLowerCase() as Theme;
        if (themeLower === 'light' || themeLower === 'dark' || themeLower === 'system') {
          setSelectedTheme(themeLower);
          setLocalTheme(themeLower);
        }
      }
    }
  }, [serverPreferences, setLocalTheme]);

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
    setSelectedTheme(newTheme);
    setLocalTheme(newTheme);
    const apiTheme = (newTheme.toUpperCase() as 'LIGHT' | 'DARK' | 'SYSTEM');
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

  return (
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
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">Push Notifications</span>
              {isPushSupported && (
                <Badge variant="success" size="xs" label="Supported" />
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
          />
        </div>
      </div>
    </Card>
  );
}


