import { useEffect, useRef } from 'react';
import type { IModal } from '../../utils/interfaces';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';

let activeModalCount = 0;

export default function Modal({
  isOpen,
  onClose,
  children,
  variant = 'center',
  showCloseButton = false,
}: IModal) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };

    document.addEventListener('keydown', handleEscape);
    activeModalCount += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      activeModalCount = Math.max(0, activeModalCount - 1);
      if (activeModalCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isCenter = variant === 'center';

  return createPortal(
    <div
      className={`fixed inset-0 z-1000 flex ${
        isCenter
          ? 'items-center justify-center p-4 bg-black/40 backdrop-blur-xs'
          : 'items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs'
      }`}
      onClick={onClose}
    >
      <div
        className={`relative flex flex-col bg-white overflow-hidden ${
          isCenter
            ? 'w-fit h-fit max-h-[90vh] max-w-2xl min-w-70 sm:min-w-85 rounded-2xl shadow-2xl m-4'
            : 'max-h-[95vh] w-full sm:max-w-xl sm:rounded-2xl sm:shadow-2xl rounded-t-3xl pb-[env(safe-area-inset-bottom)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            className="absolute z-10 right-4 top-3 flex h-6 w-6 items-center justify-center rounded-full text-msDeepBlue transition-colors hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-1.5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
