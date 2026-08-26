import { useState, useMemo } from 'react';
import {
  Utensils,
  Search,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import Modal from '../../../components/Modal/Modal';
import {
  useFoodLibraryQuery,
  useMealsQuery,
  useUpdateUserPreferencesMutation,
  useUserPreferencesQuery,
} from '../../../api/useApiQueries';
import type { UserPreferences } from '../../../api/Services/UserServices';

interface EditPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPreferences?: UserPreferences | null;
}

export const EditPreferencesModal = ({
  isOpen,
  onClose,
  initialPreferences,
}: EditPreferencesModalProps) => {
  const { data: serverPreferences } = useUserPreferencesQuery();
  const foodLibraryQuery = useFoodLibraryQuery();
  const mealsQuery = useMealsQuery();
  const updateMutation = useUpdateUserPreferencesMutation();

  const preferences = serverPreferences ?? initialPreferences;

  // Active Tab: 'ingredients' | 'meals'
  const [activeTab, setActiveTab] = useState<'ingredients' | 'meals'>('ingredients');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  // Selected food item codes (e.g. ['PK', 'BF', 'EG'])
  const [selectedFoodCodes, setSelectedFoodCodes] = useState<string[]>([]);
  // Selected meal IDs (e.g. [1, 5])
  const [selectedMealIds, setSelectedMealIds] = useState<number[]>([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevPreferences, setPrevPreferences] = useState(preferences);

  if (isOpen !== prevIsOpen || preferences !== prevPreferences) {
    setPrevIsOpen(isOpen);
    setPrevPreferences(preferences);
    if (isOpen && preferences?.dislikes) {
      if (Array.isArray(preferences.dislikes)) {
        setSelectedFoodCodes(preferences.dislikes);
        setSelectedMealIds([]);
      } else if (typeof preferences.dislikes === 'object') {
        setSelectedFoodCodes(preferences.dislikes.foodItems ?? []);
        setSelectedMealIds(preferences.dislikes.meals ?? []);
      }
    } else if (isOpen) {
      setSelectedFoodCodes([]);
      setSelectedMealIds([]);
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  // Group food items
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    const foodItems = foodLibraryQuery.data ?? [];
    foodItems.forEach((item) => {
      if (item.foodGroup) groups.add(item.foodGroup);
    });
    return Array.from(groups);
  }, [foodLibraryQuery.data]);

  const filteredFoodItems = useMemo(() => {
    const foodItems = foodLibraryQuery.data ?? [];
    return foodItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.foodCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === 'ALL' || item.foodGroup === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [foodLibraryQuery.data, searchTerm, selectedGroup]);

  const filteredMeals = useMemo(() => {
    const meals = mealsQuery.data?.meals ?? [];
    return meals.filter((meal) => {
      return meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [mealsQuery.data?.meals, searchTerm]);

  const toggleFoodCode = (code: string) => {
    setSelectedFoodCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleMealId = (id: number) => {
    setSelectedMealIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateMutation.mutateAsync({
        dislikes: {
          foodItems: selectedFoodCodes,
          meals: selectedMealIds,
        },
      });

      setSuccessMessage('Dietary preferences updated successfully!');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        error?.response?.data?.message || error?.message || 'Failed to update preferences.'
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col w-[90vw] sm:w-[560px] md:w-[620px] max-w-full h-[85vh] max-h-[620px] overflow-hidden p-4 sm:p-6 text-slate-800 font-sans">
        {/* STATIC HEADER */}
        <div className="shrink-0 flex items-start justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#00633d] border border-emerald-200/70 shadow-2xs">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Manage Meal Preferences
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select ingredients or dishes to exclude from weekly menus
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="shrink-0 mt-3 flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="shrink-0 mt-3 flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 text-xs text-[#00633d] border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00633d] mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STATIC TABS */}
        <div className="shrink-0 mt-3 flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ingredients');
              setSearchTerm('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ingredients'
                ? 'bg-white text-[#00633d] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Ingredients ({selectedFoodCodes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('meals');
              setSearchTerm('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'meals'
                ? 'bg-white text-[#00633d] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dishes ({selectedMealIds.length})</span>
          </button>
        </div>

        {/* STATIC SEARCH & FILTERS */}
        <div className="shrink-0 mt-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'ingredients'
                  ? 'Search ingredients (e.g. Pork, Fish, Egg)...'
                  : 'Search dish name to exclude...'
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#00633d] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00633d]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {activeTab === 'ingredients' && availableGroups.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedGroup('ALL')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGroup === 'ALL'
                    ? 'bg-[#00633d] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                All
              </button>
              {availableGroups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedGroup === group
                      ? 'bg-[#00633d] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SCROLLABLE INNER ROWS / GRID ONLY */}
        <div className="flex-1 min-h-0 mt-3 overflow-y-auto overflow-x-hidden pr-1 space-y-2">
          {activeTab === 'ingredients' ? (
            foodLibraryQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin mb-1.5 text-[#00633d]" />
                <span className="text-xs font-medium">Loading ingredients...</span>
              </div>
            ) : filteredFoodItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-600">No ingredients found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try a different search keyword</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
                {filteredFoodItems.map((item) => {
                  const isSelected = selectedFoodCodes.includes(item.foodCode);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleFoodCode(item.foodCode)}
                      className={`flex items-center justify-between gap-2 rounded-xl p-2.5 text-left border transition-all cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs ring-1 ring-rose-200'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold leading-snug">
                          {item.name}
                        </span>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                          {item.foodGroup || item.foodCode}
                        </span>
                      </div>
                      <div
                        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'border-slate-300 bg-slate-50'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : mealsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mb-1.5 text-[#00633d]" />
              <span className="text-xs font-medium">Loading dishes...</span>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-600">No dishes found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-1.5 w-full">
              {filteredMeals.map((meal) => {
                const isSelected = selectedMealIds.includes(meal.id);
                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => toggleMealId(meal.id)}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl p-2.5 text-left border transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs ring-1 ring-rose-200'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs sm:text-sm font-bold">
                        {meal.name}
                      </span>
                      {meal.description && (
                        <span className="block truncate text-[11px] text-slate-400 font-normal mt-0.5">
                          {meal.description}
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-slate-300 bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* STATIC FOOTER */}
        <div className="shrink-0 mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-slate-500 self-start sm:self-auto">
            <span className="font-bold text-slate-800">{selectedFoodCodes.length}</span> ingredients
            and <span className="font-bold text-slate-800">{selectedMealIds.length}</span> dishes
            disliked
          </div>

          <div className="flex w-full sm:w-auto gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00633d] hover:bg-[#005232] px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
