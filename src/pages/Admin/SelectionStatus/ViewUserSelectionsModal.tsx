import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import Modal from '../../../components/Modal/Modal';
import Skeleton from '../../../components/Skeleton/Skeleton';
import Button from '../../../components/Button/Button';
import Badge from '../../../components/Badge/Badge';
import Checkbox from '../../../components/Checkbox/Checkbox';
import { useWeeklySelectionsQuery } from '../../../api/useApiQueries';
import { days } from '../../../utils/Enums/DayOfWeek';
import type { User } from '../../../api/Services/UserServices';
import type { WeeklyUserMealSelection } from '../../../api/Services/MealSelectionServices';

export interface WeeklySelectionItemDisplay {
  day: string;
  mealName: string;
  mealImagePath?: string | null;
  calories?: number | null;
  selectionType?: 'MEAL' | 'UNAVAILABLE' | 'HOLIDAY';
  isGuest?: boolean;
  guestQuantities?: Array<{ mealName: string; quantity: number }>;
}

export interface ViewUserSelectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // User query mode
  user?: User | null;
  targetDateString?: string;
  selectedWeek?: number;
  selectedYear?: number;
  // Direct / Confirm mode
  customTitle?: string;
  customSubtitle?: ReactNode;
  directSelections?: WeeklySelectionItemDisplay[];
  confirmButton?: {
    label?: string;
    onClick: () => void | Promise<void>;
    isLoading?: boolean;
    disabled?: boolean;
  };
  showCancelButton?: boolean;
  onEdit?: () => void;
  showSaveAsPresetCheckbox?: boolean;
  saveAsPresetChecked?: boolean;
  onSaveAsPresetChange?: (checked: boolean) => void;
}

export function ViewUserSelectionsModal({
  isOpen,
  onClose,
  user,
  targetDateString,
  selectedWeek,
  selectedYear,
  customTitle,
  customSubtitle,
  directSelections,
  confirmButton,
  showCancelButton = false,
  onEdit,
  showSaveAsPresetCheckbox = false,
  saveAsPresetChecked = false,
  onSaveAsPresetChange,
}: ViewUserSelectionsModalProps) {
  const navigate = useNavigate();
  const userId = user?.id;

  const isQueryMode = Boolean(!directSelections && userId && targetDateString);

  const selectionsQuery = useWeeklySelectionsQuery(
    isOpen && isQueryMode && userId ? userId : undefined,
    targetDateString || '',
  );

  const { mealSelectionsMap, isSelfSelected, selectedByOtherName } = useMemo(() => {
    if (!isQueryMode) {
      return { mealSelectionsMap: {}, isSelfSelected: false, selectedByOtherName: null };
    }

    const rawData = selectionsQuery.data;
    if (!rawData) {
      return { mealSelectionsMap: {}, isSelfSelected: false, selectedByOtherName: null };
    }

    let selectionsMap: Partial<Record<string, WeeklyUserMealSelection>> = {};

    if (rawData.mealSelections && typeof rawData.mealSelections === 'object') {
      selectionsMap = rawData.mealSelections;
    } else if (Array.isArray(rawData)) {
      for (const item of rawData) {
        const dayKey = (item.menuDay?.day || item.dayName || item.day || '')?.toString().toUpperCase();
        if (dayKey) {
          selectionsMap[dayKey] = {
            id: item.id || 0,
            mealName: item.mealName || item.dayMeal?.meal?.name || item.meal?.name || '',
            mealID: item.dayMeal?.meal?.id || item.meal?.id || null,
            mealImagePath: item.mealImagePath || item.dayMeal?.meal?.imagePath || item.meal?.imagePath || null,
            foodCode: item.foodCode || '',
            calories: item.calories || item.dayMeal?.meal?.calories || item.meal?.calories || null,
            selectionType: item.selectionType || (item.dayMeal ? 'MEAL' : undefined),
          };
        }
      }
    }

    const createdById = rawData.createdById;
    const createdForId = rawData.createdForId ?? userId;
    const self = createdById !== null && createdById !== undefined && createdById === createdForId;
    const other =
      !self && createdById !== null && createdById !== undefined ? rawData.createdBy || 'another user' : null;

    return {
      mealSelectionsMap: selectionsMap,
      isSelfSelected: self,
      selectedByOtherName: other,
    };
  }, [isQueryMode, selectionsQuery.data, userId]);

  const handleEditForUser = () => {
    onClose();
    if (onEdit) {
      onEdit();
    } else if (user && selectedWeek && selectedYear) {
      navigate(
        `/select-meal?forSomeone=true&userId=${user.id}&week=${selectedWeek}&year=${selectedYear}`,
      );
    }
  };

  const isLoading = isQueryMode && selectionsQuery.isLoading;

  const title = customTitle || user?.name || 'Meal Selections';
  const hasFooter = Boolean(confirmButton || showCancelButton);

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="center" showCloseButton>
      <div className="p-4 sm:p-6 text-text-primary max-w-lg mx-auto font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3 mb-4">
          <div className="min-w-0 flex-1 text-left">
            <h3 className="text-base sm:text-lg font-bold text-text-primary truncate">{title}</h3>

            {customSubtitle ? (
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{customSubtitle}</p>
            ) : selectedWeek && selectedYear ? (
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <p className="text-xs text-text-secondary truncate">
                  Week {selectedWeek}, {selectedYear} Selections
                </p>
                {isSelfSelected ? (
                  <Badge variant="success" size="xs" label="Self-selected" />
                ) : selectedByOtherName ? (
                  <Badge variant="info" size="xs" label={`Selected by ${selectedByOtherName}`} />
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Edit Button: only visible in query mode when loaded and not self-selected */}
          {isQueryMode && !isLoading && !isSelfSelected && (
            <Button
              variant="primary"
              size="sm"
              icon={<Utensils size={13} />}
              label="Edit Meals"
              onClick={handleEditForUser}
            />
          )}
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="py-2">
            <Skeleton rowCount={5} />
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto overscroll-contain pr-1">
            {directSelections
              ? directSelections.map((item, idx) => {
                  const isUnavailable = item.selectionType === 'UNAVAILABLE';
                  const isHoliday = item.selectionType === 'HOLIDAY';

                  return (
                    <div
                      key={item.day || idx}
                      className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted/50 p-3 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="w-12 text-xs font-bold text-text-secondary shrink-0 uppercase tracking-wider">
                          {item.day.slice(0, 3)}
                        </span>

                        <div className="flex items-center gap-3 min-w-0 flex-1">

                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                              {item.mealName}
                            </p>
                            {item.calories && !isUnavailable && !isHoliday ? (
                              <span className="text-[11px] text-text-secondary">{item.calories} kcal</span>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          {isUnavailable ? (
                            <Badge variant="neutral" size="xs" label="Unavailable" />
                          ) : isHoliday ? (
                            <Badge variant="warning" size="xs" label="Holiday" />
                          ) : null}
                        </div>
                      </div>

                      {/* Nested Guest multi-dish breakdown */}
                      {item.isGuest && item.guestQuantities && item.guestQuantities.length > 0 && (
                        <div className="flex flex-col gap-1.5 pl-14 pt-1 border-t border-border/40">
                          {item.guestQuantities.map((g, gIdx) => (
                            <div key={gIdx} className="flex items-center justify-between text-xs">
                              <span className="font-medium text-text-secondary truncate">{g.mealName}</span>
                              <span className="rounded-lg bg-primary-light px-2 py-0.5 text-[11px] font-bold text-primary border border-primary/20 shrink-0">
                                Qty: {g.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              : days.map((day) => {
                  const selection = mealSelectionsMap[day.toUpperCase()];
                  const selectionType =
                    selection?.selectionType || (selection?.mealName ? 'MEAL' : undefined);
                  const isUnavailable = selectionType === 'UNAVAILABLE' || selection?.mealName === 'Unavailable';
                  const isHoliday = selectionType === 'HOLIDAY' || selection?.mealName === 'Holiday';

                  const mealName =
                    selection?.mealName ||
                    (isUnavailable ? 'Unavailable' : isHoliday ? 'Holiday' : 'No selection');


                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/50 p-2.5 sm:p-3 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-12 text-xs font-bold text-text-secondary shrink-0 uppercase tracking-wider">
                          {day.slice(0, 3)}
                        </span>


                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                            {mealName}
                          </p>
                          {selection?.calories && !isUnavailable && !isHoliday ? (
                            <span className="text-[11px] text-text-secondary">{selection.calories} kcal</span>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        {isUnavailable ? (
                          <Badge variant="neutral" size="xs" label="Unavailable" />
                        ) : isHoliday ? (
                          <Badge variant="warning" size="xs" label="Holiday" />
                        ):null}
                      </div>
                    </div>
                  );
                })}
          </div>
        )}

        {/* Save selections as preset checkbox */}
        {showSaveAsPresetCheckbox && (
          <div className="w-full mt-4 pt-3 border-t border-border flex items-center justify-start text-left">
            <Checkbox
              label="Save selections as preset"
              checked={Boolean(saveAsPresetChecked)}
              onChange={(checked) => onSaveAsPresetChange?.(checked)}
            />
          </div>
        )}

        {/* Modal Footer Actions (Confirm / Cancel) */}
        {hasFooter && (
          <div className="flex items-center gap-3 w-full mt-5 pt-3 border-t border-border">
            {showCancelButton && (
              <Button
                variant="outline"
                label="Cancel"
                onClick={onClose}
                disabled={confirmButton?.isLoading}
                className="flex-1"
              />
            )}
            {confirmButton && (
              <Button
                variant="primary"
                label={confirmButton.label || 'Confirm'}
                onClick={() => void confirmButton.onClick()}
                pending={confirmButton.isLoading}
                disabled={confirmButton.disabled || confirmButton.isLoading}
                className="flex-1"
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ViewUserSelectionsModal;
