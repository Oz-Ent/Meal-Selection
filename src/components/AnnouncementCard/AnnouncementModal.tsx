import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { useAnnouncement } from '../../context/announcementContext';
import AnnouncementCard from './AnnouncementCard';

export function AnnouncementModal() {
  const {
    isOpen,
    unseenAnnouncements,
    currentIndex,
    currentAnnouncement,
    nextAnnouncement,
    prevAnnouncement,
    completeAnnouncements,
    isCompleting,
  } = useAnnouncement();

  if (!currentAnnouncement || unseenAnnouncements.length === 0) {
    return null;
  }

  const isLast = currentIndex === unseenAnnouncements.length - 1;
  const isFirst = currentIndex === 0;
  const totalCount = unseenAnnouncements.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={completeAnnouncements}
      variant="center"
      showCloseButton={false}
    >
      <div className="flex flex-col items-center p-5 sm:p-6 w-full max-w-md mx-auto text-text-primary font-sans relative">
        {/* Top Header Row with Skip button */}
        <div className="w-full flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted">
            {currentIndex + 1} of {totalCount}
          </span>
          <button
            type="button"
            onClick={completeAnnouncements}
            disabled={isCompleting}
            className="text-xs font-semibold text-text-secondary hover:text-text-primary hover:underline transition-colors cursor-pointer py-1 px-2 rounded-lg"
          >
            Skip all
          </button>
        </div>

        {/* Current Announcement Content */}
        <div className="w-full my-2">
          <AnnouncementCard announcement={currentAnnouncement} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full mt-2">
          {!isFirst && (
            <Button
              variant="outline"
              size="md"
              icon={<ArrowLeft size={16} />}
              label="Previous"
              onClick={prevAnnouncement}
              disabled={isCompleting}
              className="flex-1"
            />
          )}

          {isLast ? (
            <Button
              variant="primary"
              size="md"
              icon={<Check size={16} />}
              label="Done"
              onClick={completeAnnouncements}
              pending={isCompleting}
              className="flex-1"
            />
          ) : (
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight size={16} />}
              label="Continue"
              onClick={nextAnnouncement}
              disabled={isCompleting}
              className="flex-1"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default AnnouncementModal;