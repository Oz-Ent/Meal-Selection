import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnnouncementModal from './AnnouncementModal';
import { useAnnouncement } from '../../context/announcementContext';

jest.mock('../../context/announcementContext', () => ({
  useAnnouncement: jest.fn(),
}));

describe('AnnouncementModal', () => {
  const mockUseAnnouncement = useAnnouncement as jest.Mock;

  const mockAnnouncements = [
    {
      version: 1,
      title: 'Announcement 1',
      description: 'First feature description',
      tag: 'Feature',
    },
    {
      version: 1,
      title: 'Announcement 2',
      description: 'Second feature description',
      tag: 'Update',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no announcements or modal is closed', () => {
    mockUseAnnouncement.mockReturnValue({
      isOpen: false,
      unseenAnnouncements: [],
      currentIndex: 0,
      currentAnnouncement: null,
      nextAnnouncement: jest.fn(),
      prevAnnouncement: jest.fn(),
      completeAnnouncements: jest.fn(),
      isCompleting: false,
    });

    const { container } = render(<AnnouncementModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders active announcement and steps to next and previous', () => {
    const nextAnnouncement = jest.fn();
    const prevAnnouncement = jest.fn();
    const completeAnnouncements = jest.fn();

    mockUseAnnouncement.mockReturnValue({
      isOpen: true,
      unseenAnnouncements: mockAnnouncements,
      currentIndex: 0,
      currentAnnouncement: mockAnnouncements[0],
      nextAnnouncement,
      prevAnnouncement,
      completeAnnouncements,
      isCompleting: false,
    });

    render(<AnnouncementModal />);

    expect(screen.getByText('Announcement 1')).toBeInTheDocument();
    expect(screen.getByText('First feature description')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);
    expect(nextAnnouncement).toHaveBeenCalledTimes(1);

    const skipBtn = screen.getByRole('button', { name: /Skip all/i });
    fireEvent.click(skipBtn);
    expect(completeAnnouncements).toHaveBeenCalledTimes(1);
  });

  it('renders "Get Started" and "Previous" button on the final slide', () => {
    const completeAnnouncements = jest.fn();
    const prevAnnouncement = jest.fn();

    mockUseAnnouncement.mockReturnValue({
      isOpen: true,
      unseenAnnouncements: mockAnnouncements,
      currentIndex: 1,
      currentAnnouncement: mockAnnouncements[1],
      nextAnnouncement: jest.fn(),
      prevAnnouncement,
      completeAnnouncements,
      isCompleting: false,
    });

    render(<AnnouncementModal />);

    expect(screen.getByText('Announcement 2')).toBeInTheDocument();
    expect(screen.getByText('2 of 2')).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    fireEvent.click(prevBtn);
    expect(prevAnnouncement).toHaveBeenCalledTimes(1);

    const doneBtn = screen.getByRole('button', { name: /Done/i });
    fireEvent.click(doneBtn);
    expect(completeAnnouncements).toHaveBeenCalledTimes(1);
  });
});
