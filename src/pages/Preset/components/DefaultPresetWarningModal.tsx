import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../../../components/Modal/Modal';

export interface DefaultPresetWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  presetName: string;
  emptyDays: string[];
  isLoading?: boolean;
}

export function DefaultPresetWarningModal({
  isOpen,
  onClose,
  onConfirm,
  presetName,
  emptyDays,
  isLoading = false,
}: DefaultPresetWarningModalProps) {
  const formatDayName = (day: string) =>
    day ? day.charAt(0).toUpperCase() + day.slice(1).toLowerCase() : day;

  const capitalizedDays = emptyDays.map(formatDayName);

  const formattedDays =
    capitalizedDays.length === 1
      ? capitalizedDays[0]
      : capitalizedDays.length === 2
        ? `${capitalizedDays[0]} and ${capitalizedDays[1]}`
        : `${capitalizedDays.slice(0, -1).join(', ')}, and ${capitalizedDays[capitalizedDays.length - 1]}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="center">
      <div className="flex flex-col items-center text-center p-3 sm:p-4 max-w-sm mx-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-light text-warning-dark mb-4 border border-warning/20">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-text-primary mb-2">
          Set Incomplete Preset as Default?
        </h3>

        <p className="text-xs text-text-secondary mb-3 leading-relaxed">
          <span className="font-semibold text-text-primary">{presetName || 'This preset'}</span> does
          not have meal choices for{' '}
          <span className="font-semibold text-warning-dark">{formattedDays || 'some days'}</span>.
        </p>

        <p className="text-xs mb-6 leading-relaxed bg-warning-light border border-warning/20 rounded-xl p-2.5 text-warning-dark">
          If set as default, any unselected days will automatically be prefilled as{' '}
          <span className="font-bold">Unavailable</span> during meal selection.
        </p>

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-border bg-surface py-2.5 text-xs font-bold text-text-primary hover:bg-surface-muted transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-warning hover:bg-warning-dark py-2.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Setting...
              </>
            ) : (
              'Set as Default'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
