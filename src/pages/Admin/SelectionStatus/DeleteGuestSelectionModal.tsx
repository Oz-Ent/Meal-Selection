import { useState } from 'react';
import { Trash2, Minus, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../../../components/Modal/Modal';
import type { WeeklyGuestSelectionItem } from '../../../api/Services/MealSelectionServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';

interface DeleteGuestSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestItem: WeeklyGuestSelectionItem | null;
  onConfirm: (item: WeeklyGuestSelectionItem, count: number) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteGuestSelectionModal({
  isOpen,
  onClose,
  guestItem,
  onConfirm,
  isDeleting,
}: DeleteGuestSelectionModalProps) {
  const maxCount = guestItem?.guestCount ?? 1;
  const [deleteCount, setDeleteCount] = useState<number>(1);
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const [prevGuestItemId, setPrevGuestItemId] = useState<number | null>(null);

  if (isOpen !== prevOpen || (guestItem && guestItem.id !== prevGuestItemId)) {
    setPrevOpen(isOpen);
    setPrevGuestItemId(guestItem?.id ?? null);
    if (isOpen) {
      setDeleteCount(1);
    }
  }

  if (!guestItem) return null;

  const mealName =
    guestItem.selectionType === 'MEAL'
      ? guestItem.dayMeal?.meal?.name || 'Guest Meal'
      : guestItem.selectionType === 'HOLIDAY'
      ? 'Holiday'
      : 'Unavailable';

  const dayName = guestItem.menuDay?.day || 'Selected Day';
  const imagePath = guestItem.dayMeal?.meal?.imagePath || FALLBACK_MEAL_IMAGE_URL;
  const createdByName = guestItem.createdByUser?.name;
  const isSinglePortion = maxCount === 1;

  const handleDecrement = () => {
    setDeleteCount((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setDeleteCount((prev) => Math.min(maxCount, prev + 1));
  };

  const handleSelectAll = () => {
    setDeleteCount(maxCount);
  };

  const handleSubmit = async () => {
    await onConfirm(guestItem, isSinglePortion ? 1 : deleteCount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="center" showCloseButton>
      <div className="p-5 sm:p-6 text-slate-900 flex flex-col items-center text-center">
        <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-2xs">
          <Trash2 size={26} />
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          {isSinglePortion ? 'Delete Guest Selection' : 'Remove Guest Selections'}
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          {isSinglePortion
            ? `Are you sure you want to remove the guest selection for ${mealName} on ${dayName}?`
            : `Select how many guest portions you would like to remove for ${mealName} on ${dayName}.`}
        </p>

        {/* Item Summary Card */}
        <div className="mt-4 w-full rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-center gap-3 text-left">
          <span className="w-12 text-xs font-bold text-slate-700 uppercase shrink-0 text-center">
            {dayName.slice(0, 3)}
          </span>
          {guestItem.selectionType === 'MEAL' && (
            <img
              src={imagePath}
              alt={mealName}
              className="h-10 w-10 shrink-0 rounded-lg object-cover bg-slate-100"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {mealName}
            </h4>
            {createdByName && (
              <span className="text-[11px] text-slate-400 block truncate">
                Requested by: {createdByName}
              </span>
            )}
          </div>
          <span className="rounded-full bg-secondary text-white text-[11px] font-bold px-2 py-0.5 shrink-0">
            {maxCount} {maxCount === 1 ? 'portion' : 'portions'}
          </span>
        </div>

        {/* Portion Selector (only if multi-portion) */}
        {!isSinglePortion ? (
          <div className="mt-4 w-full rounded-2xl border border-slate-100 bg-white p-4 flex flex-col gap-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Total Available Portions:</span>
              <span className="font-bold text-slate-900 text-sm">{maxCount}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Portions to delete:</span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={deleteCount <= 1 || isDeleting}
                  aria-label="Decrease portions to delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer shadow-2xs transition-colors"
                >
                  <Minus size={14} />
                </button>

                <span className="w-8 text-center text-base font-bold text-slate-900">
                  {deleteCount}
                </span>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={deleteCount >= maxCount || isDeleting}
                  aria-label="Increase portions to delete"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer shadow-2xs transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {deleteCount < maxCount && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Remove all ({maxCount})
                </button>
              </div>
            )}

            {deleteCount === maxCount && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 mt-1 text-left">
                <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                <span>This will completely delete this guest selection entry.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 w-full flex items-center gap-2 text-xs text-amber-800 bg-amber-50 rounded-xl p-3 text-left border border-amber-100/80">
            <AlertTriangle size={16} className="shrink-0 text-amber-600" />
            <span>This action cannot be undone.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex w-full gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{isSinglePortion ? 'Delete Selection' : `Delete (${deleteCount})`}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
