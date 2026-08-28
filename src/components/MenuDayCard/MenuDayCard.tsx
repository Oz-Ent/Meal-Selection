import { Plus, X } from 'lucide-react';
import { type Meal } from '../../api/Services/MealServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../helpers/mealDefaults';

export function BowlIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-amber-600 fill-amber-100"
      >
        <path d="M12 4V2M16 5V2M8 5V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M3 10C3 15.5228 7.02944 20 12 20C16.9706 20 21 15.5228 21 10H3Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export interface MenuDayCardProps {
  dayTitle: string;
  meals: Meal[];
  isEditable?: boolean;
  onAddMeals?: () => void;
  onRemoveMeal?: (mealId: number) => void;
  onClearMeals?: () => void;
  emptyPlaceholderText?: string;
}

export function MenuDayCard({
  dayTitle,
  meals,
  isEditable = true,
  onAddMeals,
  onRemoveMeal,
  onClearMeals,
  emptyPlaceholderText = 'Add meals to weekday',
}: MenuDayCardProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between min-h-[180px]">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">{dayTitle}</h3>
          {isEditable && onAddMeals && (
            <button
              type="button"
              onClick={onAddMeals}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Meals</span>
            </button>
          )}
        </div>

        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BowlIcon />
            <p className="mt-2 text-xs font-medium text-slate-400">{emptyPlaceholderText}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                    alt={meal.name}
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_MEAL_IMAGE_URL) {
                        e.currentTarget.src = FALLBACK_MEAL_IMAGE_URL;
                      }
                    }}
                    className="h-10 w-10 shrink-0 rounded-xl object-cover bg-slate-100"
                  />
                  <span className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                    {meal.name}
                  </span>
                </div>

                {isEditable && onRemoveMeal && (
                  <button
                    type="button"
                    aria-label="Remove meal"
                    onClick={() => onRemoveMeal(meal.id)}
                    className="p-1 text-red-500 hover:text-red-700 shrink-0 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            {isEditable && meals.length > 0 && onClearMeals && (
              <div className="mt-3 pt-2 border-t border-slate-50 text-center">
                <button
                  type="button"
                  onClick={onClearMeals}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear meal(s)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuDayCard;
