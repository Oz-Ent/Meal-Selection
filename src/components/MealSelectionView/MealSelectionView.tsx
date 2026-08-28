import { useState, useMemo } from 'react';
import {
  Ban,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Palmtree,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import Modal from '../Modal/Modal';
import SpinWheel from '../SpinWheel/SpinWheel';
import type { MenuDay, MenuDayMeal } from '../../api/Services/MenuServices';
import type { HolidayItem } from '../../api/Services/HolidayServices';
import MealButton from '../MealButton/MealButton';
import MealDetailsModal from './MealDetailsModal';

export type DaySelectionValue = number | 'UNAVAILABLE' | 'HOLIDAY';

export interface GuestDaySelection {
  mealQuantities: Record<number, number>; // dayMealId -> quantity
  nonMeal?: 'UNAVAILABLE' | 'HOLIDAY';
}

export interface MealSelectionViewProps {
  menuDays: MenuDay[];
  menuDayMeals: MenuDayMeal[];
  selections: Record<number, DaySelectionValue>; // menuDayId -> mealId | 'UNAVAILABLE' | 'HOLIDAY'
  onSelectionChange: (menuDayId: number, value: DaySelectionValue | undefined) => void;
  onClearDaySelection?: (menuDayId: number) => void;
  onClearAllSelections?: () => void;
  currentDayIndex: number;
  onDayIndexChange: (index: number) => void;
  weeklyHolidays?: HolidayItem[];
  showPresetButton?: boolean;
  showOtherOptions?: boolean;
  onPresetClick?: () => void;
  onToast?: (type: 'success' | 'error', message: string) => void;
  mode?: 'select' | 'view';
  isGuestMode?: boolean;
  guestSelections?: Record<number, GuestDaySelection>;
  onGuestMealQuantityChange?: (menuDayId: number, dayMealId: number, quantity: number) => void;
  onGuestNonMealChange?: (menuDayId: number, nonMeal: 'UNAVAILABLE' | 'HOLIDAY' | undefined) => void;
  pastDayIds?: number[];
  isScheduleClosed?: boolean;
  closedMessage?: string;
  todayDayId?: number;
  dimDisabledMeals?: boolean;
}

export function MealSelectionView({
  menuDays,
  menuDayMeals,
  selections,
  onSelectionChange,
  onClearDaySelection,
  onClearAllSelections,
  currentDayIndex,
  onDayIndexChange,
  weeklyHolidays = [],
  showPresetButton = false,
  showOtherOptions = true,
  onPresetClick,
  onToast,
  mode = 'select',
  isGuestMode = false,
  guestSelections = {},
  onGuestMealQuantityChange,
  onGuestNonMealChange,
  pastDayIds = [],
  todayDayId,
  isScheduleClosed = false,
  closedMessage,
  dimDisabledMeals = true,
}: MealSelectionViewProps) {
  const [randomDrawerOpen, setRandomDrawerOpen] = useState(false);
  const [randomMenuDayId, setRandomMenuDayId] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedFoodCode, setSelectedFoodCode] = useState<string | null>(null);
  const handleLongPress = (foodCode: string) => {
    setSelectedFoodCode(foodCode);
    setDetailsModalOpen(true);
  };

  const currentDay = menuDays[currentDayIndex];
  const currentDayMeals = currentDay
    ? menuDayMeals.filter((item) => item.menuDayId === currentDay.id && item.isActive)
    : [];
  const selectedChoice = currentDay ? selections[currentDay.id] : undefined;
  const isFinalDay = currentDayIndex === menuDays.length - 1;

  const currentDayGuest = currentDay ? guestSelections[currentDay.id] : undefined;
  const isUnavailableSelected = isGuestMode
    ? currentDayGuest?.nonMeal === 'UNAVAILABLE'
    : selectedChoice === 'UNAVAILABLE';
  const isHolidaySelected = isGuestMode
    ? currentDayGuest?.nonMeal === 'HOLIDAY'
    : selectedChoice === 'HOLIDAY';

  const currentDayName = currentDay?.day
    ? currentDay.day.charAt(0).toUpperCase() + currentDay.day.slice(1).toLowerCase()
    : 'Monday';

  // Check if current day has a holiday from the weekly holidays list
  const activeHoliday = useMemo(() => {
    if (!currentDay || !weeklyHolidays.length) return null;
    return (
      weeklyHolidays.find(
        (h) => h.dayName?.toUpperCase() === currentDay.day?.toUpperCase(),
      ) ?? null
    );
  }, [currentDay, weeklyHolidays]);

  const isHolidayDay = Boolean(activeHoliday);
  const isPastDay = Boolean(currentDay && pastDayIds.includes(currentDay.id));
  const isTodayClosed = Boolean(currentDay && isPastDay && currentDay.id === todayDayId);
  const isDayDisabled = mode === 'view' || isHolidayDay || isPastDay || isScheduleClosed;
  const shouldDim = dimDisabledMeals && isDayDisabled;

  const totalGuestMealsToday = useMemo(() => {
    if (!isGuestMode || !currentDayGuest?.mealQuantities) return 0;
    return Object.values(currentDayGuest.mealQuantities).reduce((sum, q) => sum + (q || 0), 0);
  }, [isGuestMode, currentDayGuest]);

  const handleClearAll = () => {
    if (isScheduleClosed) return;
    if (onClearAllSelections) {
      onClearAllSelections();
    } else {
      for (const day of menuDays) {
        if (pastDayIds.includes(day.id)) continue;
        if (onClearDaySelection) {
          onClearDaySelection(day.id);
        } else {
          onSelectionChange(day.id, undefined);
        }
      }
    }
    onToast?.('success', 'All choices have been cleared.');
  };

  
  return (
    <>
      {/* Meal Items Card Container */}
      <main className="flex-1 px-4 pt-4 overflow-y-auto">
        {/* Closed Schedule Notice Banner */}
        {isScheduleClosed && (
          <div className="mb-3 flex items-start gap-3 rounded-2xl bg-rose-50/90 border border-rose-200/90 p-3.5 text-xs text-rose-900 shadow-2xs">
            <Ban size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-900">Meal Selection Closed</span>
              <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">
                {closedMessage || 'Meal selection for this week is closed. You can view your selections below.'}
              </p>
            </div>
          </div>
        )}

        {/* Active Holiday Information Banner */}
        {activeHoliday && (
          <div className="mb-3 flex items-start gap-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 p-3.5 text-xs text-amber-900 shadow-2xs">
            <Sparkles size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900">{activeHoliday.title}</span>
                <span className="rounded-md bg-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                  {activeHoliday.source === 'COMPANY' ? 'Company Holiday' : 'Public Holiday'}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">
                This day is recognized as a holiday. Menu selection is closed and automatically set to Holiday.
              </p>
            </div>
          </div>
        )}

        {/* Past Day / Closed Today Information Banner */}
        {isPastDay && !isHolidayDay && !isScheduleClosed && (
          <div className="mb-3 flex items-start gap-3 rounded-2xl bg-slate-100/90 border border-slate-200 p-3.5 text-xs text-slate-700 shadow-2xs">
            <Ban size={18} className="text-slate-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  {isTodayClosed ? 'Closed for Today' : 'Past Day'}
                </span>
                <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                  Locked
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">
                {isTodayClosed
                  ? 'Meal selection for today closed at 10:00 AM. Selections cannot be modified.'
                  : 'This day has passed. Selections for this day cannot be modified.'}
              </p>
            </div>
          </div>
        )}


        {/* Guest Mode Summary Header */}
        {isGuestMode && currentDay && (
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {currentDayName} Guest Dishes
            </span>
            {totalGuestMealsToday > 0 && (
              <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                {totalGuestMealsToday} meal{totalGuestMealsToday === 1 ? '' : 's'} selected
              </span>
            )}
          </div>
        )}

        <div
          role={isGuestMode ? undefined : 'radiogroup'}
          aria-label={`${currentDayName} meal choices`}
          className="bg-white rounded-3xl border border-slate-100/80 p-2 shadow-2xs space-y-1"
        >
          {/* Regular Menu Dishes */}
          {currentDayMeals.map((meal) => {
            const isSelected = isGuestMode
              ? (currentDayGuest?.mealQuantities?.[meal.id] ?? 0) > 0
              : selectedChoice === meal.id;
            const quantity = isGuestMode
              ? (currentDayGuest?.mealQuantities?.[meal.id] ?? 0)
              : 0;
            const isDisabled = isDayDisabled;

            return (
              <MealButton
                key={meal.id}
                meal={meal}
                isSelected={isSelected}
                isDisabled={isDisabled}
                isDimmed={shouldDim}
                isGuestMode={isGuestMode}
                quantity={quantity}
                onQuantityChange={(newQty) => {
                  if (isDisabled || !currentDay) return;
                  onGuestMealQuantityChange?.(currentDay.id, meal.id, newQty);
                }}
                onLongPress={handleLongPress}
                onSelect={() => {
                  if (isDisabled || !currentDay) return;

                  if (isSelected) {
                    if (isGuestMode) {
                      onGuestMealQuantityChange?.(currentDay.id, meal.id, 0);
                    } else if (onClearDaySelection) {
                      onClearDaySelection(currentDay.id);
                    } else {
                      onSelectionChange(currentDay.id, undefined);
                    }
                  } else {
                    if (isGuestMode) {
                      onGuestMealQuantityChange?.(currentDay.id, meal.id, 1);
                    } else {
                      onSelectionChange(currentDay.id, meal.id);
                    }
                  }
                }}
              />
            );
          })}

          {currentDayMeals.length === 0 && !isHolidayDay && (
            <div className="p-6 text-center text-slate-400 text-sm">
              No specific meal options configured for this day.
            </div>
          )}

          {/* Divider and Other Options (Unavailable, Holiday) */}
          {showOtherOptions && (
            <>
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Other options
              </div>

              {/* Option: UNAVAILABLE */}
              <button
                type="button"
                role={isGuestMode ? undefined : 'radio'}
                aria-checked={isUnavailableSelected}
                disabled={isDayDisabled}
                onClick={() => {
                  if (mode !== 'select' || isDayDisabled || !currentDay) return;
                  if (isGuestMode) {
                    onGuestNonMealChange?.(currentDay.id, isUnavailableSelected ? undefined : 'UNAVAILABLE');
                  } else {
                    if (selectedChoice === 'UNAVAILABLE') {
                      if (onClearDaySelection) {
                        onClearDaySelection(currentDay.id);
                      } else {
                        onSelectionChange(currentDay.id, undefined);
                      }
                    } else {
                      onSelectionChange(currentDay.id, 'UNAVAILABLE');
                    }
                  }
                }}
                className={`flex w-full items-center justify-between p-3 rounded-2xl border-b border-slate-50 last:border-b-0 text-left transition-colors ${
                  isDayDisabled
                    ? shouldDim
                      ? isUnavailableSelected
                        ? 'bg-primary-light/60 opacity-80 cursor-not-allowed'
                        : 'opacity-40 cursor-not-allowed'
                      : isUnavailableSelected
                      ? 'bg-primary-light cursor-default'
                      : 'cursor-default'
                    : isUnavailableSelected
                    ? 'bg-primary-light'
                    : mode === 'select'
                    ? 'hover:bg-slate-50 cursor-pointer'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Ban size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm leading-snug ${
                        isUnavailableSelected
                          ? 'font-semibold text-primary'
                          : 'font-medium text-slate-800'
                      }`}
                    >
                      Unavailable
                    </span>
                    <p className="text-[11px] text-slate-500">{isGuestMode ? 'No guests will be having lunch on this day' : 'I will not be having lunch on this day'}</p>
                  </div>
                </div>

                {mode === 'view' || isDayDisabled ? (
                  isUnavailableSelected && (
                    <Check size={18} className="text-primary shrink-0 font-bold" />
                  )
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isUnavailableSelected
                        ? 'border-primary bg-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isUnavailableSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                )}
              </button>

              {/* Option: HOLIDAY */}
              <button
                type="button"
                role={isGuestMode ? undefined : 'radio'}
                aria-checked={isHolidaySelected || isHolidayDay}
                disabled={isDayDisabled}
                onClick={() => {
                  if (mode !== 'select' || isDayDisabled || !currentDay) return;
                  if (isGuestMode) {
                    onGuestNonMealChange?.(currentDay.id, isHolidaySelected ? undefined : 'HOLIDAY');
                  } else {
                    if (selectedChoice === 'HOLIDAY') {
                      if (onClearDaySelection) {
                        onClearDaySelection(currentDay.id);
                      } else {
                        onSelectionChange(currentDay.id, undefined);
                      }
                    } else {
                      onSelectionChange(currentDay.id, 'HOLIDAY');
                    }
                  }
                }}
                className={`flex w-full items-center justify-between p-3 rounded-2xl text-left transition-colors ${
                  isHolidaySelected || isHolidayDay
                    ? 'bg-amber-50/80 border border-amber-200/70'
                    : isDayDisabled
                    ? shouldDim
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-default'
                    : mode === 'select'
                    ? 'hover:bg-slate-50 cursor-pointer'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-11 h-11 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-700 shrink-0">
                    <Palmtree size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm leading-snug ${
                          isHolidaySelected || isHolidayDay
                            ? 'font-semibold text-amber-950'
                            : 'font-medium text-slate-800'
                        }`}
                      >
                        Holiday
                      </span>
                      {isHolidayDay && (
                        <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                          Auto-marked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isHolidayDay ? activeHoliday?.title : 'Mark this day as a holiday / day off'}
                    </p>
                  </div>
                </div>

                {mode === 'view' || isDayDisabled ? (
                  (isHolidaySelected || isHolidayDay) && (
                    <Check size={18} className="text-amber-800 shrink-0 font-bold" />
                  )
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isHolidaySelected || isHolidayDay
                        ? 'border-amber-700 bg-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {(isHolidaySelected || isHolidayDay) && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-700" />
                    )}
                  </div>
                )}
              </button>
            </>
          )}
        </div>
      </main>
        <MealDetailsModal
          isOpen={detailsModalOpen}
          foodCode={selectedFoodCode}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedFoodCode(null);
          }}
        />

      {/* Floating Bottom Control Bar */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg px-4 flex items-center gap-2 z-20">
        {/* Pill 1: Day Navigation */}
        <div className="flex-1 flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-3 py-2 shadow-md shadow-slate-200/50 text-xs font-bold text-slate-800">
          <button
            type="button"
            aria-label="Previous day navigation"
            disabled={currentDayIndex === 0}
            onClick={() => onDayIndexChange(Math.max(0, currentDayIndex - 1))}
            className="p-1 text-slate-600 disabled:opacity-25 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="capitalize">{currentDayName}</span>

          <button
            type="button"
            aria-label="Next"
            disabled={isFinalDay}
            onClick={() => onDayIndexChange(Math.min(menuDays.length - 1, currentDayIndex + 1))}
            className="p-1 text-slate-600 disabled:opacity-25 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Pill 2: Clear Selection */}
        {mode === 'select' && !isScheduleClosed && (
          <button
            type="button"
            aria-label="Clear all selections"
            onClick={handleClearAll}
            className="w-11 h-11 shrink-0 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform cursor-pointer"
          >
            <CircleX size={18} />
          </button>
        )}

        {/* Pill 3: Random Selection */}
        {mode !== 'view' && !isHolidayDay && !isPastDay && !isScheduleClosed && currentDayMeals.length > 0 && (
          <button
            type="button"
            aria-label="Choose a random meal"
            onClick={() => {
              if (currentDay) {
                setRandomMenuDayId(currentDay.id);
                setRandomDrawerOpen(true);
              }
            }}
            className="w-11 h-11 shrink-0 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 text-slate-700 hover:text-slate-900 active:scale-95 transition-transform cursor-pointer"
          >
            <Shuffle size={18} />
          </button>
        )}

        {/* Pill 4: Presets / Bookmark */}
        {showPresetButton && mode === 'select' && !isScheduleClosed && (
          <button
            type="button"
            aria-label="Presets"
            onClick={onPresetClick}
            className="w-11 h-11 shrink-0 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 text-slate-700 hover:text-slate-900 active:scale-95 transition-transform cursor-pointer"
          >
            <Bookmark size={18} />
          </button>
        )}
      </footer>

      {/* Random Selection Modal */}
      <Modal
        isOpen={randomDrawerOpen}
        onClose={() => setRandomDrawerOpen(false)}
        variant="bottom"
        showCloseButton={true}
      >
        <div className="p-4 flex flex-col gap-4 text-black h-full font-sans">
          <h2 className="text-base font-bold text-slate-900">Random Meal</h2>
          <div className="flex flex-1 flex-col items-center py-8">
            <SpinWheel
              options={menuDayMeals
                .filter((item) => item.menuDayId === randomMenuDayId && item.isActive)
                .map((item) => ({
                  value: item.id,
                  label: item.meal.name,
                }))}
              onSpinComplete={(selectedValue) => {
                if (randomMenuDayId) {
                  onSelectionChange(randomMenuDayId, Number(selectedValue));
                }
              }}
            />
          </div>
          {menuDayMeals.filter((item) => item.menuDayId === randomMenuDayId && item.isActive)
            .length === 0 && (
            <div className="p-4 text-center text-gray-500">No meals available for this day.</div>
          )}
        </div>
      </Modal>
    </>
  );
}
