import Modal from '../Modal/Modal';
import { useMealDetailsQuery } from '../../api/useApiQueries';
import { FALLBACK_MEAL_IMAGE_URL } from '../../helpers/mealDefaults';

interface MealDetailsModalProps {
  isOpen: boolean;
  foodCode: string | null;
  onClose: () => void;
}

export default function MealDetailsModal({
  isOpen,
  foodCode,
  onClose,
}: MealDetailsModalProps) {
  const mealDetailsQuery = useMealDetailsQuery(isOpen ? foodCode : null);
  const meal = mealDetailsQuery.data;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="p-5 font-sans text-slate-800">
        {mealDetailsQuery.isPending && (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading meal details...
          </div>
        )}

        {mealDetailsQuery.isError && (
          <div className="py-8 text-center text-sm text-red-500">
            Unable to load meal details.
          </div>
        )}

        {meal && (
          <div className="flex flex-col gap-4">
            {/* Meal Image */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
              <img
                src={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {meal.ingredients.filter(ing => ing.foodGroup == "SUPERGROUP").map(
                    (ing, idx) => <span key={idx}>{ing.name}</span>
                  )}
                </span>

                {meal.calories !== undefined && meal.calories !== null && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {meal.calories} kcal
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {meal.name}
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {meal.description ?? "No description yet"}
              </span>
            </div>

            {/* Description */}
            {meal.description && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {meal.description}
              </p>
            )}

            {/* Ingredients list */}
            {meal.ingredients && meal.ingredients.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Ingredients
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {meal.ingredients.filter(ing => ing.foodGroup !== "SUPERGROUP" && ing.foodGroup !== "PREP").map((ing, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
                    >
                      <span className="font-medium">{ing.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}