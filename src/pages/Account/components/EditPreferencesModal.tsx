import { useState, useMemo } from 'react';
import {
  Utensils,
  Search,
  Check,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import Modal from '../../../components/Modal/Modal';
import Tabs from '../../../components/Tabs/Tabs';
import Button from '../../../components/Button/Button';
import Chip from '../../../components/Chip/Chip';
import SearchChips from '../../../components/SearchChips/SearchChips';
import EmptyState from '../../../components/EmptyState/EmptyState';
import InfoBanner from '../../../components/Banner/InfoBanner';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
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
      <div className="flex flex-col w-[90vw] sm:w-[560px] md:w-[620px] max-w-full h-[85vh] max-h-[620px] overflow-hidden p-4 sm:p-6 text-text-primary font-sans">
        {/* STATIC HEADER */}
        <div className="shrink-0 flex items-start justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary border border-primary/20 shadow-2xs">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-text-primary leading-tight">
                Manage Meal Preferences
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Select ingredients or dishes to exclude from weekly menus
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="shrink-0 mt-3">
            <InfoBanner variant="danger" description={errorMessage} />
          </div>
        )}

        {successMessage && (
          <div className="shrink-0 mt-3">
            <InfoBanner variant="success" description={successMessage} />
          </div>
        )}

        {/* STATIC TABS */}
        <div className="shrink-0 mt-3">
          <Tabs
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val as 'ingredients' | 'meals');
              setSearchTerm('');
            }}
          >
            <Tabs.Options>
              <Tabs.Option
                value="ingredients"
                icon={<Layers size={14} />}
                badge={selectedFoodCodes.length}
              >
                Ingredients
              </Tabs.Option>
              <Tabs.Option
                value="meals"
                icon={<Sparkles size={14} />}
                badge={selectedMealIds.length}
              >
                Dishes
              </Tabs.Option>
            </Tabs.Options>
          </Tabs>
        </div>

        {/* STATIC SEARCH & FILTERS */}
        <div className="shrink-0 mt-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'ingredients'
                  ? 'Search ingredients (e.g. Pork, Fish, Egg)...'
                  : 'Search dish name to exclude...'
              }
              className="w-full rounded-xl border border-border bg-surface-muted/70 pl-9 pr-8 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {activeTab === 'ingredients' && availableGroups.length > 0 && (
            <SearchChips>
              <Chip
                label="All"
                size="sm"
                variant="filter"
                selected={selectedGroup === 'ALL'}
                onClick={() => setSelectedGroup('ALL')}
              />
              {availableGroups.map((group) => (
                <Chip
                  key={group}
                  label={group}
                  size="sm"
                  variant="filter"
                  selected={selectedGroup === group}
                  onClick={() => setSelectedGroup(group)}
                />
              ))}
            </SearchChips>
          )}
        </div>

        {/* SCROLLABLE INNER ROWS / GRID ONLY */}
        <div className="flex-1 min-h-0 mt-3 overflow-y-auto overflow-x-hidden pr-1 space-y-2">
          {activeTab === 'ingredients' ? (
            foodLibraryQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-text-muted gap-2">
                <LoadingSpinner />
                <span className="text-xs font-medium">Loading ingredients...</span>
              </div>
            ) : filteredFoodItems.length === 0 ? (
              <EmptyState
                title="No ingredients found"
                description="Try a different search keyword"
              />
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
                          ? 'bg-danger-light border-danger/40 text-danger-dark shadow-2xs ring-1 ring-danger/20'
                          : 'bg-surface border-border text-text-primary hover:border-border-hover hover:bg-surface-muted/60'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold leading-snug">
                          {item.name}
                        </span>
                        <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mt-0.5 truncate">
                          {item.foodGroup || item.foodCode}
                        </span>
                      </div>
                      <div
                        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? 'bg-danger border-danger text-white'
                            : 'border-border bg-surface-muted'
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
            <div className="flex flex-col items-center justify-center py-10 text-text-muted gap-2">
              <LoadingSpinner />
              <span className="text-xs font-medium">Loading dishes...</span>
            </div>
          ) : filteredMeals.length === 0 ? (
            <EmptyState
              title="No dishes found"
              description="Try a different search term"
            />
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
                        ? 'bg-danger-light border-danger/40 text-danger-dark shadow-2xs ring-1 ring-danger/20'
                        : 'bg-surface border-border text-text-primary hover:border-border-hover hover:bg-surface-muted/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs sm:text-sm font-bold">
                        {meal.name}
                      </span>
                      {meal.description && (
                        <span className="block truncate text-[11px] text-text-muted font-normal mt-0.5">
                          {meal.description}
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? 'bg-danger border-danger text-white'
                          : 'border-border bg-surface-muted'
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
        <div className="shrink-0 mt-3 pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-text-secondary self-start sm:self-auto">
            <span className="font-bold text-text-primary">{selectedFoodCodes.length}</span> ingredients
            and <span className="font-bold text-text-primary">{selectedMealIds.length}</span> dishes
            disliked
          </div>

          <div className="flex w-full sm:w-auto gap-2">
            <Button
              variant="outline"
              label="Cancel"
              disabled={updateMutation.isPending}
              onClick={onClose}
            />
            <Button
              variant="primary"
              label="Save Preferences"
              pending={updateMutation.isPending}
              disabled={updateMutation.isPending}
              onClick={handleSave}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
