import { useEffect } from 'react';
import { Check, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface BottomToastProps {
  isOpen: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function BottomToast({ isOpen, type, message, onClose, duration = 4000 }: BottomToastProps) {
  useEffect(() => {
    if (!isOpen || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50 bg-surface-dark text-white rounded-2xl p-3.5 px-4 shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-medium transition-all"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isSuccess ? (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Check size={13} strokeWidth={3} className="text-white" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0 text-[12px] font-extrabold text-white font-mono leading-none">
            !
          </div>
        )}
        <span className="leading-snug text-slate-100 line-clamp-2">{message}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-slate-400 hover:text-white p-1 rounded-full transition-colors shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
