import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import { useMealDetailsQuery } from '../../api/useApiQueries';
import { FALLBACK_MEAL_IMAGE_URL } from '../../helpers/mealDefaults';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import Badge from '../Badge/Badge';

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
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Handle escape key & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };

    document.addEventListener('keydown', handleEscape);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const mealDetailsQuery = useMealDetailsQuery(isOpen ? foodCode : null);
  const meal = mealDetailsQuery.data;

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs"
      onClick={onClose}
      data-testid="meal-details-modal-backdrop"
    >
      <div
        className="relative flex flex-col items-center w-full max-w-md mx-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
        data-testid="meal-details-modal-container"
      >
        {/* Part 1: Meal (Circle with background containing the image) */}
        {meal && (
          <div
            data-testid="meal-image-circle"
            className="relative -mb-16 z-10 flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center rounded-full border-2 border-border bg-surface-elevated p-2 shadow-xl shrink-0"
          >
            <img
              src={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
              alt={meal.name}
              onError={(e) => {
                if (e.currentTarget.src !== FALLBACK_MEAL_IMAGE_URL) {
                  e.currentTarget.src = FALLBACK_MEAL_IMAGE_URL;
                }
              }}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        )}

        {/* Part 2: Meal Details (Div with surface-elevated background containing details and close button) */}
        <div
          className={`relative flex flex-col w-full rounded-3xl border border-border bg-surface-elevated text-text-primary shadow-2xl transition-colors max-h-[85vh] overflow-hidden ${
            meal ? 'pt-20 px-6 pb-6' : 'p-6'
          }`}
        >
          {/* Close Button on the meal details container */}
          <button
            type="button"
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon fontSize="small" />
          </button>

          {/* Details Body */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden font-sans">
            {mealDetailsQuery.isPending && (
              <div className="py-12 text-center text-sm text-text-secondary flex flex-col items-center gap-3">
                <LoadingSpinner />
                <span>Loading meal details...</span>
              </div>
            )}

            {mealDetailsQuery.isError && (
              <div className="py-12 text-center text-sm text-danger">
                Unable to load meal details.
              </div>
            )}

            {meal && (
              <div className="flex flex-col gap-4">
                {/* Header Info */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      {meal.ingredients
                        ?.filter((ing) => ing.foodGroup === 'SUPERGROUP')
                        .map((ing, idx) => (
                          <span key={idx}>{ing.name}</span>
                        ))}
                    </span>

                    {meal.calories !== undefined && meal.calories !== null && (
                      <Badge
                        variant="warning"
                        size="xs"
                        label={`${meal.calories} kcal`}
                      />
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                    {meal.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-text-secondary mt-1 leading-relaxed">
                    {meal.description ?? 'No description yet'}
                  </p>
                </div>

                {/* Ingredients list */}
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <div className="pt-3.5 border-t border-border">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
                      Ingredients
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.ingredients
                        .filter((ing) => ing.foodGroup !== 'SUPERGROUP' && ing.foodGroup !== 'PREP')
                        .map((ing, idx) => (
                          <Badge
                            key={idx}
                            variant="neutral"
                            size="xs"
                            label={ing.name}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}