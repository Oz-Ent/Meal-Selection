import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import Modal from '../Modal/Modal';
import { type Meal } from '../../api/Services/MealServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../helpers/mealDefaults';
import SearchBar from '../SearchBar/SearchBar';
import Button from '../Button/Button';

export interface AllMealsModalSheetProps {
  meals: Meal[];
  selectedMealIds: number[];
  onClose: () => void;
  onSave: (selectedIds: number[]) => void;
}

export function AllMealsModalSheet({
  meals,
  selectedMealIds,
  onClose,
  onSave,
}: AllMealsModalSheetProps) {
  const [tempIds, setTempIds] = useState<number[]>(selectedMealIds);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleMeal = (mealId: number) => {
    setTempIds((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId],
    );
  };

  const filteredMeals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return meals;
    return meals.filter((meal) => meal.name.toLowerCase().includes(query));
  }, [meals, searchTerm]);

  return (
    <Modal isOpen variant="bottom" onClose={onClose} showCloseButton>
      <section className="flex flex-col font-sans w-full max-h-[85vh] text-text-primary bg-surface">
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">All meals</h2>
          <p className="text-xs text-text-secondary mt-0.5 mb-3">Select all meals to add to this weekday.</p>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search meals..."
            className="mb-1 w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-border">
          {filteredMeals.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              No meals found matching &quot;{searchTerm}&quot;
            </div>
          ) : (
            filteredMeals.map((meal) => {
              const isSelected = tempIds.includes(meal.id);

              return (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => toggleMeal(meal.id)}
                  className={`flex w-full items-center justify-between p-3 rounded-xl text-left transition-colors my-1 cursor-pointer ${
                    isSelected
                      ? 'bg-primary-light border border-primary/30 text-primary'
                      : 'hover:bg-surface-muted text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                      alt={meal.name}
                      onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_MEAL_IMAGE_URL) {
                          e.currentTarget.src = FALLBACK_MEAL_IMAGE_URL;
                        }
                      }}
                      className="h-11 w-11 shrink-0 rounded-xl object-cover bg-surface-muted border border-border/50"
                    />
                    <span className="text-xs font-semibold leading-snug line-clamp-2">
                      {meal.name}
                    </span>
                  </div>

                  {isSelected && <Check size={18} className="text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-border bg-surface">
          <Button
            variant="primary"
            className="w-full"
            icon={<Check size={18} />}
            label="Add"
            onClick={() => onSave(tempIds)}
          />
        </div>
      </section>
    </Modal>
  );
}

export default AllMealsModalSheet;
