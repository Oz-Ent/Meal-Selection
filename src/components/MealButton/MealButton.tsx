import type { MenuDayMeal } from "../../api/Services/MenuServices";
import { FALLBACK_MEAL_IMAGE_URL } from "../../helpers/mealDefaults";
import { useLongPress } from "../../hooks/useLongPress";

interface MealButtonProps {
  meal: MenuDayMeal;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  onLongPress: (foodCode: string) => void;
}

export default function MealButton({
  meal,
  isSelected,
  isDisabled,
  onSelect,
  onLongPress,
}: MealButtonProps) {
  const longPressHandlers = useLongPress(
    () => onLongPress(meal.meal.foodCode),
    500,
  );

  return (
    <button
      key={meal.id}
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={isDisabled}
      {...longPressHandlers}
      onClick={() => {
        if (longPressHandlers.isLongPress()) return;
        onSelect();
      }}
      className={`select-none flex w-full items-center justify-between p-3 rounded-2xl border-b border-slate-50 last:border-b-0 text-left transition-colors ${
        isDisabled
          ? 'opacity-40 cursor-not-allowed bg-slate-50/50'
          : isSelected
          ? 'bg-primary-light'
          : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <img
          src={meal.meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
          alt={meal.meal.name}
          className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <span
            className={`text-sm leading-snug line-clamp-2 ${
              isSelected
                ? 'font-semibold text-primary'
                : 'font-medium text-slate-700'
            }`}
          >
            {meal.meal.name}
          </span>

          {meal.meal.calories && (
            <span className="text-[11px] text-slate-400">
              {meal.meal.calories} kcal
            </span>
          )}
        </div>
      </div>

      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
          isSelected
            ? 'border-primary bg-white'
            : 'border-slate-300 bg-white'
        }`}
      >
        {isSelected && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        )}
      </div>
    </button>
  );
}