import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Modal from '../../components/Modal/Modal';

import { miscMediaList } from '../../assets/misc/miscMedia';

export interface MiscSuccessfulSelectionModalProps {
  onClose?: () => void;
}

export function MiscSuccessfulSelectionModal({ onClose }: MiscSuccessfulSelectionModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  // Random number generator within the length of the array
  const [selectedMedia] = useState<string | null>(() => {
    if (miscMediaList.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * miscMediaList.length);
    return miscMediaList[randomIndex];
  });

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    } else {
      navigate('/activities');
    }
  };

  const isVideo = selectedMedia ? /\.(mp4|webm|ogg)$/i.test(selectedMedia) : false;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} variant="bottom" showCloseButton={true}>
      <div className="flex flex-col items-center text-center p-4 pt-2 w-full font-sans">
        {/* Media display */}
        {selectedMedia && (
          <div className="flex justify-center my-4 max-w-xs w-full overflow-hidden rounded-2xl shadow-md border border-border bg-surface-muted">
            {isVideo ? (
              <video
                src={selectedMedia}
                autoPlay
                loop
                muted
                playsInline
                className="w-full max-h-64 object-cover rounded-2xl"
              />
            ) : (
              <img
                src={selectedMedia}
                alt="This is for Fidel"
                className="w-full max-h-64 object-cover rounded-2xl"
              />
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
          This is for Fidel
        </h2>

        {/* Description */}
        <p className="text-sm font-medium text-text-secondary max-w-xs leading-relaxed mb-6">
          from Glorious
        </p>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer mb-2"
        >
          <ArrowRight size={18} />
          <span>Continue</span>
        </button>
      </div>
    </Modal>
  );
}

export default MiscSuccessfulSelectionModal;
