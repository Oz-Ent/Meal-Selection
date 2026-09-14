import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ANNOUNCEMENT_VERSION,
  type AnnouncementContent,
} from '../config/announcementConfig';
import { useAuth } from '../pages/Auth/useAuth/useAuth';
import {
  useUpdateAnnouncementVersionMutation,
  useUserProfileQuery,
} from '../api/useApiQueries';
import AnnouncementModal from '../components/AnnouncementCard/AnnouncementModal';

export interface AnnouncementItem extends AnnouncementContent {
  version: number;
}

export interface AnnouncementContextType {
  userAnnouncementVersion: number;
  latestAnnouncementVersion: number;
  unseenAnnouncements: AnnouncementItem[];
  isOpen: boolean;
  currentIndex: number;
  currentAnnouncement: AnnouncementItem | null;
  setCurrentIndex: (index: number) => void;
  nextAnnouncement: () => void;
  prevAnnouncement: () => void;
  openAnnouncements: () => void;
  closeAnnouncements: () => void;
  completeAnnouncements: () => Promise<void>;
  isCompleting: boolean;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const AnnouncementProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const userProfileQuery = useUserProfileQuery({ enabled: Boolean(token) });
  const updateAnnouncementMutation = useUpdateAnnouncementVersionMutation();

  // 1. Determine user's current announcement version
  const userAnnouncementVersion = useMemo(() => {
    const backendVersion = userProfileQuery.data?.preferences?.announcementVersion;
    if (typeof backendVersion === 'number') {
      return backendVersion;
    }
    const localVersionStr =
      typeof window !== 'undefined' ? localStorage.getItem('announcementVersion') : null;
    return localVersionStr !== null ? Number(localVersionStr) : 0;
  }, [userProfileQuery.data?.preferences?.announcementVersion]);

  // 2. Determine highest global announcement version
  const latestAnnouncementVersion = useMemo(() => {
    if (!ANNOUNCEMENT_VERSION.length) return 0;
    return Math.max(...ANNOUNCEMENT_VERSION.map((v) => v.version), 0);
  }, []);

  // 3. Filter announcements that are greater than user's version (unseen)
  const unseenAnnouncements = useMemo<AnnouncementItem[]>(() => {
    const newerVersions = ANNOUNCEMENT_VERSION.filter(
      (v) => v.version > userAnnouncementVersion,
    ).sort((a, b) => a.version - b.version);

    return newerVersions.flatMap((v) =>
      v.announcements.map((a) => ({ ...a, version: v.version })),
    );
  }, [userAnnouncementVersion]);

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Auto-open modal once if authenticated and has unseen announcements
  useEffect(() => {
    if (
      Boolean(token) &&
      unseenAnnouncements.length > 0 &&
      !hasAutoOpened &&
      !userProfileQuery.isLoading
    ) {
      setIsOpen(true);
      setCurrentIndex(0);
      setHasAutoOpened(true);
    }
  }, [token, unseenAnnouncements.length, hasAutoOpened, userProfileQuery.isLoading]);

  const currentAnnouncement = unseenAnnouncements[currentIndex] || null;

  const nextAnnouncement = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, Math.max(0, unseenAnnouncements.length - 1)));
  }, [unseenAnnouncements.length]);

  const prevAnnouncement = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const openAnnouncements = useCallback(() => {
    if (unseenAnnouncements.length > 0) {
      setCurrentIndex(0);
      setIsOpen(true);
    } else if (ANNOUNCEMENT_VERSION.length > 0) {
      // Fallback: show latest announcements for review
      setCurrentIndex(0);
      setIsOpen(true);
    }
  }, [unseenAnnouncements.length]);

  const closeAnnouncements = useCallback(() => {
    setIsOpen(false);
  }, []);

  // When completing (on final slide Continue or clicking Skip), mark latest version as viewed
  const completeAnnouncements = useCallback(async () => {
    try {
      if (latestAnnouncementVersion > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('announcementVersion', String(latestAnnouncementVersion));
        }
        await updateAnnouncementMutation.mutateAsync(latestAnnouncementVersion);
      }
    } catch (error) {
      console.warn('Failed to update announcement version on backend:', error);
    } finally {
      setIsOpen(false);
      setCurrentIndex(0);
    }
  }, [latestAnnouncementVersion, updateAnnouncementMutation]);

  const value = useMemo<AnnouncementContextType>(
    () => ({
      userAnnouncementVersion,
      latestAnnouncementVersion,
      unseenAnnouncements,
      isOpen,
      currentIndex,
      currentAnnouncement,
      setCurrentIndex,
      nextAnnouncement,
      prevAnnouncement,
      openAnnouncements,
      closeAnnouncements,
      completeAnnouncements,
      isCompleting: updateAnnouncementMutation.isPending,
    }),
    [
      userAnnouncementVersion,
      latestAnnouncementVersion,
      unseenAnnouncements,
      isOpen,
      currentIndex,
      currentAnnouncement,
      nextAnnouncement,
      prevAnnouncement,
      openAnnouncements,
      closeAnnouncements,
      completeAnnouncements,
      updateAnnouncementMutation.isPending,
    ],
  );

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
      <AnnouncementModal />
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  return context;
};

export default AnnouncementContext;