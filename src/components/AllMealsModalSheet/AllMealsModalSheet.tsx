import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import Modal from '../Modal/Modal';
import { type Meal } from '../../api/Services/MealServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../helpers/mealDefaults';
import SearchBar from '../SearchBar/SearchBar';

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
      <section className="flex flex-col font-sans w-full max-h-[85vh]">
        <div className="px-4 pt-4 pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">All meals</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-3">Select all meals to add to this weekday.</p>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search meals..."
            className="mb-1 w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-slate-100">
          {filteredMeals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
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
                  className={`flex w-full items-center justify-between p-3 rounded-xl text-left transition-colors my-1 ${
                    isSelected ? 'bg-primary-light' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                      alt={meal.name}
                      className="h-11 w-11 shrink-0 rounded-xl object-cover bg-slate-100"
                    />
                    <span className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {meal.name}
                    </span>
                  </div>

                  {isSelected && <Check size={18} className="text-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => onSave(tempIds)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity cursor-pointer"
          >
            <Check size={18} />
            <span>Add</span>
          </button>
        </div>
      </section>
    </Modal>
  );
}

export default AllMealsModalSheet;

