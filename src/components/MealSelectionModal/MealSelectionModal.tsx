import { useEffect, useState, type ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight, Shuffle, X } from 'lucide-react';
import type { MenuDay, MenuDayMeal } from '../../api/Services/MenuServices';
import Modal from '../Modal/Modal';
import { FALLBACK_MEAL_IMAGE_URL } from '../../helpers/mealDefaults';

interface MealSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuDays: MenuDay[];
  menuDayMeals: MenuDayMeal[];
  selectedMeals: Record<number, number>;
  onSelectedMealChange: (menuDayId: number, dayMealId: number) => void;
  onComplete: () => void;
  completeLabel: string;
  subtitle?: string;
  isPending?: boolean;
  renderDayControls?: (menuDay: MenuDay) => ReactNode;
  onRandomClick?: (menuDayId: number) => void;
  showCloseButton?: boolean;
}

export default function MealSelectionModal({
  isOpen,
  onClose,
  menuDays,
  menuDayMeals,
  selectedMeals,
  onSelectedMealChange,
  onComplete,
  completeLabel,
  subtitle,
  isPending = false,
  renderDayControls,
  onRandomClick,
  showCloseButton = true,
}: MealSelectionModalProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const currentDay = menuDays[currentDayIndex];
  const currentDayMeals = currentDay
    ? menuDayMeals.filter((meal) => meal.menuDayId === currentDay.id && meal.isActive)
    : [];
  const selectedMealId = currentDay ? selectedMeals[currentDay.id] : undefined;
  const isFinalDay = currentDayIndex === menuDays.length - 1;
  const dayLabel = currentDay?.day
    ? currentDay.day.charAt(0).toUpperCase() + currentDay.day.slice(1).toLowerCase()
    : 'Weekly meals';

  useEffect(() => {
    if (isOpen) setCurrentDayIndex(0);
  }, [isOpen]);

  const moveForward = () => {
    if (isFinalDay) {
      onComplete();
      return;
    }
    setCurrentDayIndex((index) => index + 1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="bottom" showCloseButton={false}>
      <div className="flex h-[88vh] flex-col bg-app-bg text-text-primary">
        <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-4">
          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Back to activities"
              className="mr-3 rounded-full p-1 text-secondary hover:bg-slate-100"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <span className="mr-3 w-7" />
          )}
          <h1 className="flex-1 text-center text-sm font-bold text-text-primary">Select Meal</h1>
          {isFinalDay ? (
            <button
              type="button"
              onClick={onComplete}
              disabled={!selectedMealId || isPending}
              className="rounded-full bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              Submit
            </button>
          ) : (
            <span className="w-12" />
          )}
        </header>
        {subtitle && <div className="shrink-0 px-5 py-3 text-xs text-slate-600">{subtitle}</div>}

        {currentDay && renderDayControls?.(currentDay)}

        <div
          role="radiogroup"
          aria-label={`${dayLabel} meal choices`}
          className="min-h-0 flex-1 overflow-y-auto border-y border-slate-100 bg-white px-3"
        >
          {currentDayMeals.map((meal) => (
            <button
              key={meal.id}
              type="button"
              role="radio"
              aria-checked={selectedMealId === meal.id}
              onClick={() => currentDay && onSelectedMealChange(currentDay.id, meal.id)}
              className={`flex w-full items-center gap-3 border-b border-slate-100 px-2 py-2.5 text-left last:border-b-0 ${selectedMealId === meal.id ? 'bg-primary-light' : 'hover:bg-slate-50'}`}
            >
              <img
                className="h-10 w-10 shrink-0 rounded-md object-cover bg-slate-100"
                src={meal.meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                alt=""
              />
              <span
                className={`flex-1 text-sm leading-tight ${selectedMealId === meal.id ? 'font-semibold text-primary' : ''}`}
              >
                {meal.meal.name}
              </span>
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${selectedMealId === meal.id ? 'border-primary bg-primary text-white' : 'border-slate-300'}`}
              >
                {selectedMealId === meal.id && <Check size={11} strokeWidth={3} />}
              </span>
            </button>
          ))}
          {currentDayMeals.length === 0 && (
            <div className="p-4 text-center text-gray-500">No meals available for this day.</div>
          )}
        </div>

        <footer className="shrink-0 bg-white px-3 pb-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous day navigation"
              disabled={currentDayIndex === 0}
              onClick={() => setCurrentDayIndex((index) => Math.max(0, index - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-secondary disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="flex-1 text-center text-sm font-semibold">{dayLabel}</span>
            <button
              type="button"
              aria-label="Next day navigation"
              disabled={isFinalDay}
              onClick={moveForward}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-secondary disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
            <button
              type="button"
              aria-label="Clear current day selection"
              onClick={() => currentDay && onSelectedMealChange(currentDay.id, 0)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
            >
              <X size={18} />
            </button>
            {onRandomClick && currentDay && (
              <button
                type="button"
                aria-label="Choose a random meal"
                onClick={() => onRandomClick(currentDay.id)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-secondary"
              >
                <Shuffle size={18} />
              </button>
            )}
          </div>
          {!isFinalDay && (
            <button
              type="button"
              onClick={moveForward}
              disabled={!selectedMealId || isPending}
              className="sr-only"
            >
              Next
            </button>
          )}
          {isFinalDay && (
            <button
              type="button"
              onClick={onComplete}
              disabled={!selectedMealId || isPending}
              className="sr-only"
            >
              {completeLabel}
            </button>
          )}
        </footer>
      </div>
    </Modal>
  );
}
