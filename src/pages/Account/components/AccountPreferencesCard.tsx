import { useMemo, useState } from 'react';
import {
  Ban,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useUserPreferencesQuery,
  useFoodLibraryQuery,
  useMealsQuery,
} from '../../../api/useApiQueries';
import StatCard from '../../../components/StatCard/StatCard';
import { EditPreferencesModal } from './EditPreferencesModal';
import type { UserPreferences } from '../../../api/Services/UserServices';
import { Card } from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import EmptyState from '../../../components/EmptyState/EmptyState';

interface AccountPreferencesCardProps {
  preferences?: UserPreferences | null;
  stats?: {
    totalSelections: number;
    totalPresets: number;
  };
}

const normalizeFoodCode = (value: string) => value.trim().toUpperCase();

export const AccountPreferencesCard = ({
  preferences: initialPreferences,
  stats,
}: AccountPreferencesCardProps) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [areExcludedMealsOpen, setAreExcludedMealsOpen] = useState(false);

  const { data: serverPreferences } = useUserPreferencesQuery();
  const foodLibraryQuery = useFoodLibraryQuery();
  const mealsQuery = useMealsQuery();

  const preferences = serverPreferences ?? initialPreferences;
  const foodNamesByCode = useMemo(
    () =>
      new Map(
        (foodLibraryQuery.data ?? []).map((food) => [normalizeFoodCode(food.foodCode), food.name]),
      ),
    [foodLibraryQuery.data],
  );
  const mealsById = useMemo(
    () => new Map((mealsQuery.data?.meals ?? []).map((meal) => [meal.id, meal.name])),
    [mealsQuery.data?.meals],
  );

  const { excludedFoodNames, excludedMealNames } = useMemo(() => {
    const dislikes = preferences?.dislikes;
    const foodCodes = Array.isArray(dislikes) ? dislikes : dislikes?.foodItems ?? [];
    const foodNames = foodCodes.map(
      (foodCode) => foodNamesByCode.get(normalizeFoodCode(foodCode)) ?? foodCode,
    );
    const dislikedMealIds = Array.isArray(dislikes) ? [] : dislikes?.meals ?? [];
    const excludedMealIds = preferences?.excludedMealIds ?? [];
    const dislikedMealNames = dislikedMealIds.map((id) => mealsById.get(id) ?? `Dish #${id}`);

    return {
      excludedFoodNames: [...new Set([...foodNames, ...dislikedMealNames])],
      excludedMealNames: [...new Set(excludedMealIds.map((id) => mealsById.get(id) ?? `Dish #${id}`))],
    };
  }, [foodNamesByCode, mealsById, preferences]);

  return (
    <>
      <Card
        header={{
          title: 'Dietary Preferences',
          subtitle: 'Manage dietary dislikes and saved presets',
          icon: <Utensils className="h-4 w-4" />,
        }}
      >
        <div className="flex flex-col gap-4 h-full">
          <div className="pt-2 grid grid-cols-2 gap-3.5">
            <StatCard
              title="Saved Presets"
              subtitle="View your presets"
              value={stats?.totalPresets || 0}
              icon={<Bookmark className="h-4 w-4" />}
              onClick={() => navigate('/preset-meals')}
            />
            
            <StatCard
            title="Total Selections"
            subtitle="View your meal history"
            value={stats?.totalSelections || 0}
            icon={<Sparkles className="h-4 w-4" />}
            onClick={() => navigate('/history')}
            />
          </div>

          {/* Dislikes / Exclusions View */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Dietary Dislikes & Exclusions
              </span>
              <Button
              variant="outline"
              size="sm"
              icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
              label="Configure"
              onClick={() => setIsEditModalOpen(true)}
            />
            </div>

            {excludedFoodNames.length === 0 && excludedMealNames.length === 0 ? (
              <EmptyState
                icon={<ShieldCheck className="h-6 w-6" />}
                title="No specific dietary exclusions configured"
                description="You receive standard weekly menus. You can exclude ingredients or specific dishes anytime."
                buttonLabel="Add Dietary Exclusions"
                buttonIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                buttonAction={() => setIsEditModalOpen(true)}
              />
            ) : (
              <div className="flex flex-col gap-4 overflow-hidden">
                {excludedFoodNames.length > 0 && (
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                      Excluded Food Items ({excludedFoodNames.length})
                    </span>
                    <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain rounded-xl border border-border border-dashed bg-surface-elevated p-2.5">
                      {excludedFoodNames.map((foodName, index) => (
                        <div
                          key={`${foodName}-${index}`}
                          className="flex min-h-10 min-w-0 items-center gap-1.5 overflow-hidden rounded-md border border-border bg-surface p-3 text-xs text-text-secondary shadow-2xs"
                        >
                          <Ban className="h-3 w-3 shrink-0 text-danger" />
                          <span className="truncate">{foodName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {excludedMealNames.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-border border-dashed bg-surface-elevated">
                    <button
                      type="button"
                      aria-expanded={areExcludedMealsOpen}
                      onClick={() => setAreExcludedMealsOpen((isOpen) => !isOpen)}
                      className="flex w-full items-center justify-between gap-2 p-3 text-left text-xs font-semibold text-text-primary cursor-pointer"
                    >
                      <span>Meals excluded from selections ({excludedMealNames.length})</span>
                      {areExcludedMealsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {areExcludedMealsOpen && (
                      <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain border-t border-border p-2.5">
                        {excludedMealNames.map((mealName, index) => (
                          <div
                            key={`${mealName}-${index}`}
                            className="flex min-h-10 min-w-0 items-center gap-1.5 overflow-hidden rounded-md border border-border bg-surface p-3 text-xs text-text-secondary shadow-2xs"
                          >
                            <Ban className="h-3 w-3 shrink-0 text-danger" />
                            <span className="truncate">{mealName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                  </div>
                )}
                
              </div>
            )}
          </div>

          {/* Shortcuts / Presets */}

        </div>
      </Card>

      {/* Edit Preferences Modal */}
      <EditPreferencesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialPreferences={preferences}
      />
    </>
  );
};
