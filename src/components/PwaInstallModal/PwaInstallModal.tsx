import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { Share, PlusSquare, Smartphone } from 'lucide-react';
import type { IBrowserDetails } from '../../config/browserConfig';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  browserInfo: IBrowserDetails;
}

export function PwaInstallModal({ isOpen, onClose, browserInfo }: PwaInstallModalProps) {
  const isIOS = browserInfo.os === 'iOS';

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton variant="center">
      <div className="flex flex-col gap-5 p-6 max-w-sm sm:max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Install Edziban</h3>
            <p className="text-xs text-text-secondary">
              Add Edziban to your home screen for quick access and instant alerts.
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4 border border-border">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                1
              </span>
              <p className="text-xs text-text-primary leading-relaxed">
                Tap the <span className="font-semibold inline-flex items-center gap-1">Share button <Share className="inline h-3.5 w-3.5 text-info" /></span> in Safari's bottom toolbar.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                2
              </span>
              <p className="text-xs text-text-primary leading-relaxed">
                Scroll down and tap <span className="font-semibold inline-flex items-center gap-1"><PlusSquare className="inline h-3.5 w-3.5" /> Add to Home Screen</span>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                3
              </span>
              <p className="text-xs text-text-primary leading-relaxed">
                Tap <span className="font-semibold text-primary">Add</span> in the top-right corner to finish.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-2xl bg-surface-muted p-4 border border-border">
            <p className="text-xs font-medium text-text-primary">Instructions for {browserInfo.name}:</p>
            <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
              {browserInfo.installInstructions.map((instruction, idx) => (
                <li key={idx} className="leading-relaxed">
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button variant="primary" size="md" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PwaInstallModal;
