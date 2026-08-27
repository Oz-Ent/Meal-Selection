import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { MenuDayMeal } from "../../api/Services/MenuServices";
import { FALLBACK_MEAL_IMAGE_URL } from "../../helpers/mealDefaults";
import { useLongPress } from "../../hooks/useLongPress";

interface MealButtonProps {
  meal: MenuDayMeal;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  onLongPress: (foodCode: string) => void;
  isGuestMode?: boolean;
  quantity?: number;
  onQuantityChange?: (qty: number) => void;
}

export default function MealButton({
  meal,
  isSelected,
  isDisabled,
  onSelect,
  onLongPress,
  isGuestMode = false,
  quantity = 0,
  onQuantityChange,
}: MealButtonProps) {
  const [localInputVal, setLocalInputVal] = useState<string | null>(null);

  const longPressHandlers = useLongPress(
    () => onLongPress(meal.meal.foodCode),
    500,
  );

  const hasQuantity = quantity > 0;

  if (!isGuestMode) {
    return (
      <button
        key={meal.id}
        type="button"
        role="radio"
        aria-checked={isSelected}
        disabled={isDisabled}
        {...longPressHandlers}
        onClick={() => {
          if (isDisabled || longPressHandlers.isLongPress()) return;
          onSelect();
        }}
        className={`select-none flex w-full items-center justify-between p-3 rounded-2xl border-b border-slate-50 last:border-b-0 text-left transition-colors cursor-pointer ${
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

  return (
    <div
      key={meal.id}
      {...longPressHandlers}
      onClick={() => {
        if (isDisabled || longPressHandlers.isLongPress()) return;
        if (quantity === 0) {
          onQuantityChange?.(1);
        }
      }}
      className={`select-none flex w-full items-center justify-between p-3 rounded-2xl border-b border-slate-50 last:border-b-0 text-left transition-colors cursor-pointer ${
        isDisabled
          ? 'opacity-40 cursor-not-allowed bg-slate-50/50'
          : hasQuantity
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
              hasQuantity
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
        className="flex items-center shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {hasQuantity ? (
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-primary/30 shadow-2xs">
            <button
              type="button"
              aria-label={`Decrease quantity of ${meal.meal.name}`}
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange?.(Math.max(0, quantity - 1));
                setLocalInputVal(null);
              }}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>

            <input
              type="number"
              min={1}
              aria-label={`Quantity of ${meal.meal.name}`}
              value={localInputVal !== null ? localInputVal : quantity}
              onChange={(e) => {
                const val = e.target.value;
                setLocalInputVal(val);
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed) && parsed >= 0) {
                  onQuantityChange?.(parsed);
                }
              }}
              onFocus={() => {
                setLocalInputVal('');
              }}
              onBlur={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (isNaN(parsed) || parsed < 1) {
                  onQuantityChange?.(1);
                }
                setLocalInputVal(null);
              }}
              className="w-10 h-7 text-center font-bold text-xs text-primary bg-transparent outline-none"
            />

            <button
              type="button"
              aria-label={`Increase quantity of ${meal.meal.name}`}
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange?.(quantity + 1);
                setLocalInputVal(null);
              }}
              className="w-7 h-7 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={`Add ${meal.meal.name}`}
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation();
              if (isDisabled) return;
              onQuantityChange?.(1);
            }}
            className="h-8 px-3 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 shadow-2xs hover:border-primary hover:text-primary hover:bg-primary-light transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}