import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AnnouncementProvider, useAnnouncement } from './announcementContext';
import { useAuth } from '../pages/Auth/useAuth/useAuth';
import { useUserProfileQuery, useUpdateAnnouncementVersionMutation } from '../api/useApiQueries';

jest.mock('../pages/Auth/useAuth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../api/useApiQueries', () => ({
  useUserProfileQuery: jest.fn(),
  useUpdateAnnouncementVersionMutation: jest.fn(),
}));

// Mock AnnouncementModal to simplify context testing
jest.mock('../components/AnnouncementCard/AnnouncementModal', () => () => <div data-testid="mock-modal" />);

describe('announcementContext', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    (useAuth as jest.Mock).mockReturnValue({
      token: 'fake-jwt-token',
    });

    (useUserProfileQuery as jest.Mock).mockReturnValue({
      data: {
        preferences: {
          announcementVersion: 0,
        },
      },
      isLoading: false,
    });

    (useUpdateAnnouncementVersionMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AnnouncementProvider>{children}</AnnouncementProvider>
  );

  it('calculates unseen announcements when user version is 0', () => {
    const { result } = renderHook(() => useAnnouncement(), { wrapper });

    expect(result.current.userAnnouncementVersion).toBe(0);
    expect(result.current.unseenAnnouncements.length).toBeGreaterThan(0);
    expect(result.current.isOpen).toBe(true);
  });

  it('does not open when user version is already latest', () => {
    (useUserProfileQuery as jest.Mock).mockReturnValue({
      data: {
        preferences: {
          announcementVersion: 999,
        },
      },
      isLoading: false,
    });

    const { result } = renderHook(() => useAnnouncement(), { wrapper });

    expect(result.current.userAnnouncementVersion).toBe(999);
    expect(result.current.unseenAnnouncements.length).toBe(0);
    expect(result.current.isOpen).toBe(false);
  });

  it('completes announcements and sends patch mutation with latest version', async () => {
    const { result } = renderHook(() => useAnnouncement(), { wrapper });

    await act(async () => {
      await result.current.completeAnnouncements();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith(result.current.latestAnnouncementVersion);
    expect(localStorage.getItem('announcementVersion')).toBe(String(result.current.latestAnnouncementVersion));
    expect(result.current.isOpen).toBe(false);
  });
});
