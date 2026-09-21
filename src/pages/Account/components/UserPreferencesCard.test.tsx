import { render, screen, fireEvent } from '@testing-library/react';
import UserPreferencesCard from './UserPreferencesCard';
import { useTheme } from '../../../hooks/useTheme';

jest.mock('../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

const mockPromptInstall = jest.fn();

jest.mock('../../../hooks/usePwaInstall', () => ({
  usePwaInstall: () => ({
    isInstallable: true,
    isInstalled: false,
    isPrompting: false,
    isGuideOpen: false,
    browserInfo: {
      name: 'Chrome',
      os: 'Windows',
      version: '120.0',
      isMobile: false,
      isStandalone: false,
      canPromptNativeInstall: true,
      installMethod: 'native-prompt',
      installInstructions: [],
      pushSupported: true,
      pushRequiresPwaFirst: false,
      pushTroubleshooting: [],
    },
    promptInstall: mockPromptInstall,
    closeGuide: jest.fn(),
  }),
}));

jest.mock('../../../hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    isSupported: true,
    permission: 'granted',
    isSubscribed: true,
    isLoading: false,
    error: null,
    subscribe: jest.fn().mockResolvedValue(true),
    unsubscribe: jest.fn().mockResolvedValue(true),
    syncExistingSubscription: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('../../../api/useApiQueries', () => ({
  useUserPreferencesQuery: () => ({
    data: {
      theme: 'light',
      autoSubmitPreset: false,
      emailNotifications: true,
      pushNotifications: true,
    },
    isLoading: false,
  }),
  usePatchUserPreferencesMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

describe('UserPreferencesCard Component', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('renders theme selector and changes theme to system when selected', () => {
    render(<UserPreferencesCard />);

    expect(screen.getByText('Theme Appearance')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();

    const dropdownTrigger = screen.getByRole('button', { name: /Theme Appearance/i });
    fireEvent.click(dropdownTrigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();

    fireEvent.click(screen.getByText('System'));
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('renders PWA install button and triggers promptInstall on click', () => {
    render(<UserPreferencesCard />);

    expect(screen.getByText('Install Application')).toBeInTheDocument();
    const installBtn = screen.getByRole('button', { name: /Install/i });
    expect(installBtn).toBeInTheDocument();

    fireEvent.click(installBtn);
    expect(mockPromptInstall).toHaveBeenCalled();
  });

  it('displays Subscribed badge for push notifications', () => {
    render(<UserPreferencesCard />);

    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('Subscribed')).toBeInTheDocument();
  });
});
