import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { MenuDayMeal } from '../../api/Services/MenuServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../helpers/mealDefaults';
import { useLongPress } from '../../hooks/useLongPress';

interface MealButtonProps {
  meal: MenuDayMeal;
  isSelected: boolean;
  isDisabled: boolean;
  isDimmed?: boolean;
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
  isDimmed = true,
  onSelect,
  onLongPress,
  isGuestMode = false,
  quantity = 0,
  onQuantityChange,
}: MealButtonProps) {
  const [localInputVal, setLocalInputVal] = useState<string | null>(null);

  const { isLongPress, ...longPressEventHandlers } = useLongPress(
    () => {
      if (isDisabled) return;
      onLongPress(meal.meal.foodCode);
    },
    500,
  );

  const hasQuantity = quantity > 0;
  const active = isGuestMode ? hasQuantity : isSelected;

  const containerClasses = (() => {
    const base = 'select-none flex w-full items-center justify-between p-3 rounded-2xl text-left transition-colors font-sans';
    if (isDisabled) {
      if (isDimmed) {
        return `${base} ${
          active
            ? 'bg-primary-light/60 opacity-80 cursor-not-allowed'
            : 'opacity-40 cursor-not-allowed bg-surface-muted/50'
        }`;
      }
      return `${base} cursor-default ${active ? 'bg-primary-light' : ''}`;
    }
    return `${base} cursor-pointer ${
      active
        ? 'hover:bg-primary-light/80'
        : 'hover:bg-surface-muted'
    }`;
  })();

  const renderMealInfo = () => (
    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
      <img
        src={meal.meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
        alt={meal.meal.name}
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_MEAL_IMAGE_URL) {
            e.currentTarget.src = FALLBACK_MEAL_IMAGE_URL;
          }
        }}
        className="w-11 h-11 rounded-xl object-cover bg-surface-muted shrink-0 border border-border/50"
      />

      <div className="min-w-0 flex-1">
        <span
          className={`text-sm leading-snug line-clamp-2 ${
            active
              ? 'font-semibold text-primary'
              : 'font-medium text-text-primary'
          }`}
        >
          {meal.meal.name}
        </span>

        {meal.meal.calories && (
          <span className="text-[11px] text-text-muted block mt-0.5">
            {meal.meal.calories} kcal
          </span>
        )}
      </div>
    </div>
  );

  if (!isGuestMode) {
    return (
      <button
        key={meal.id}
        type="button"
        role="radio"
        aria-checked={isSelected}
        disabled={isDisabled}
        {...longPressEventHandlers}
        onClick={() => {
          if (isDisabled || isLongPress()) return;
          onSelect();
        }}
        className={containerClasses}
      >
        {renderMealInfo()}
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
            isSelected ? 'border-primary bg-surface' : 'border-border bg-surface'
          }`}
        >
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
      </button>
    );
  }

  return (
    <div
      key={meal.id}
      {...longPressEventHandlers}
      onClick={() => {
        if (isDisabled || isLongPress()) return;
        if (quantity === 0) {
          onQuantityChange?.(1);
        }
      }}
      className={containerClasses}
    >
      {renderMealInfo()}

      <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
        {hasQuantity ? (
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-primary/30 shadow-2xs">
            <button
              type="button"
              aria-label={`Decrease quantity of ${meal.meal.name}`}
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange?.(Math.max(0, quantity - 1));
                setLocalInputVal(null);
              }}
              className="w-7 h-7 rounded-lg bg-surface-muted hover:bg-surface text-text-primary flex items-center justify-center transition-colors active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
              onFocus={() => setLocalInputVal('')}
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
              className="w-7 h-7 rounded-lg bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
            className="h-8 px-3 rounded-xl border border-border bg-surface flex items-center justify-center gap-1 text-xs font-semibold text-text-secondary shadow-2xs hover:border-primary hover:text-primary hover:bg-primary-light transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}