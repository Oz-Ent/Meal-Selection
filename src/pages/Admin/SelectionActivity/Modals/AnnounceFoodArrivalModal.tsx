import { useState, useMemo } from 'react';
import { Volume2, X, Search } from 'lucide-react';
import Modal from '../../../../components/Modal/Modal';
import Button from '../../../../components/Button/Button';
import Badge from '../../../../components/Badge/Badge';
import InputField from '../../../../components/InputField/InputField';
import Checkbox from '../../../../components/Checkbox/Checkbox';
import { useFoodArrivalMutation } from '../../../../api/useApiQueries';

export interface ArrivalSelectionItem {
  id: number;
  userName: string;
  mealName: string;
  isGuest?: boolean;
}

interface AnnounceFoodArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayName: string;
  menuDayId?: number;
  weekMenuScheduleId?: number;
  selections: ArrivalSelectionItem[];
  onSuccess: (result: { fulfilledCount: number; unfulfilledCount: number; message: string }) => void;
  onError: (errorMsg: string) => void;
}

export default function AnnounceFoodArrivalModal({
  isOpen,
  onClose,
  dayName,
  menuDayId,
  weekMenuScheduleId,
  selections,
  onSuccess,
  onError,
}: AnnounceFoodArrivalModalProps) {
  const [unfulfilledIds, setUnfulfilledIds] = useState<number[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [note, setNote] = useState('');

  const foodArrivalMutation = useFoodArrivalMutation();

  const toggleSelectionUnfulfilled = (id: number) => {
    setUnfulfilledIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredSelections = useMemo(() => {
    if (!searchFilter.trim()) return selections;
    const q = searchFilter.toLowerCase();
    return selections.filter(
      (s) =>
        s.userName.toLowerCase().includes(q) ||
        s.mealName.toLowerCase().includes(q)
    );
  }, [selections, searchFilter]);

  const fulfilledCount = selections.length - unfulfilledIds.length;

  const handleSubmit = async () => {
    try {
      const res = await foodArrivalMutation.mutateAsync({
        weekMenuScheduleId,
        menuDayId,
        unfulfilledSelectionIds: unfulfilledIds,
        note: note.trim() || undefined,
      });

      onSuccess({
        fulfilledCount: res.fulfilledCount ?? fulfilledCount,
        unfulfilledCount: res.unfulfilledCount ?? unfulfilledIds.length,
        message: res.message || 'Food arrival announced successfully.',
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to broadcast food arrival.';
      onError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="center"
      showCloseButton={false}
    >
      <div className="flex flex-col p-5 font-sans text-text-primary w-full max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-3.5">
          <div className="flex items-center gap-3">

            <div>
              <h2 className="text-base font-bold text-text-primary">
                Announce Food Arrival
              </h2>
              <p className="text-xs text-text-secondary">
                Broadcast arrival for {dayName} and update meal status
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status summary banner */}
        {unfulfilledIds.length > 0 && <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-muted p-3 border border-border text-xs">
           <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">
              {unfulfilledIds.length} Selection Unfulfilled
            </span>
          </div>
        </div>}

        {/* Unfulfilled Selection Tagging Section */}
        <div className="mt-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-text-secondary">
              Which selections did not come?
            </label>
            {unfulfilledIds.length > 0 && (
              <button
                type="button"
                onClick={() => setUnfulfilledIds([])}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {selections.length > 5 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search user or dish..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 pl-8 text-xs text-text-primary outline-none placeholder:text-text-muted"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-text-muted" />
            </div>
          )}

          <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-surface divide-y divide-border">
            {filteredSelections.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted">
                No meal selections found for this day.
              </div>
            ) : (
              filteredSelections.map((s) => {
                const isTagged = unfulfilledIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSelectionUnfulfilled(s.id)}
                    className={`flex items-center justify-between p-2.5 text-xs transition-colors cursor-pointer hover:bg-surface-muted ${
                      isTagged ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Checkbox
                        color="warning"
                        variant='radio'
                        checked={isTagged}
                        onChange={() => {toggleSelectionUnfulfilled(s.id)}}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold truncate ${isTagged ? 'text-danger line-through' : 'text-text-primary'}`}>
                            {s.userName}
                          </span>
                          {s.isGuest && (
                            <Badge variant="neutral" size="xs" label="Guest" />
                          )}
                        </div>
                        <span className="text-[11px] text-text-secondary truncate block">
                          {s.mealName}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Note / Reason Field */}
        <div className="mt-3.5">
          <InputField
            label="Arrival Note (Optional)"
            placeholder="e.g. Caterer missing 2 portions of salad; all other meals ready."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border pt-3.5">
          <Button
            type="button"
            variant="outline"
            label="Cancel"
            onClick={onClose}
          />
          <Button
            type="button"
            variant="primary"
            icon={<Volume2 size={15} />}
            label="Announce"
            disabled={foodArrivalMutation.isPending || selections.length === 0}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Modal>
  );
}

