import { useState, useMemo } from 'react';
import { Utensils, Sparkles, ChevronRight, Bookmark, SlidersHorizontal, ShieldCheck, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useUserPreferencesQuery,
  useFoodLibraryQuery,
  useMealsQuery,
} from '../../../api/useApiQueries';
import { EditPreferencesModal } from './EditPreferencesModal';
import type { UserPreferences } from '../../../api/Services/UserServices';
import { Card } from '../../../components/Card/Card';
import Badge from '../../../components/Badge/Badge';
import Button from '../../../components/Button/Button';
import EmptyState from '../../../components/EmptyState/EmptyState';

interface AccountPreferencesCardProps {
  preferences?: UserPreferences | null;
  stats?: {
    totalSelections: number;
    totalPresets: number;
  };
}

export const AccountPreferencesCard = ({
  preferences: initialPreferences,
  stats,
}: AccountPreferencesCardProps) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch real-time preferences from API
  const { data: serverPreferences } = useUserPreferencesQuery();
  const foodLibraryQuery = useFoodLibraryQuery();
  const mealsQuery = useMealsQuery();

  const preferences = serverPreferences ?? initialPreferences;

  // Map food codes to human-readable names
  const foodCodeToNameMap = useMemo(() => {
    const map = new Map<string, string>();
    const foodItems = foodLibraryQuery.data ?? [];
    foodItems.forEach((item) => {
      map.set(item.foodCode, item.name);
    });
    return map;
  }, [foodLibraryQuery.data]);

  // Extract disliked food items and meal names
  const { dislikedFoodNames, dislikedMealNames, totalDislikesCount } = useMemo(() => {
    const rawDislikes = preferences?.dislikes;
    const foodNames: string[] = [];
    const mealNames: string[] = [];
    const meals = mealsQuery.data?.meals ?? [];

    if (Array.isArray(rawDislikes)) {
      rawDislikes.forEach((codeOrName) => {
        const mapped = foodCodeToNameMap.get(codeOrName);
        foodNames.push(mapped || codeOrName);
      });
    } else if (rawDislikes && typeof rawDislikes === 'object') {
      const items = rawDislikes.foodItems ?? [];
      items.forEach((codeOrName) => {
        const mapped = foodCodeToNameMap.get(codeOrName);
        foodNames.push(mapped || codeOrName);
      });

      const mealIds = rawDislikes.meals ?? [];
      mealIds.forEach((mId) => {
        const mealObj = meals.find((m) => m.id === mId);
        mealNames.push(mealObj?.name || `Dish #${mId}`);
      });
    }

    return {
      dislikedFoodNames: foodNames,
      dislikedMealNames: mealNames,
      totalDislikesCount: foodNames.length + mealNames.length,
    };
  }, [preferences, foodCodeToNameMap, mealsQuery.data?.meals]);

  const excludedMealsCount = preferences?.excludedMealIds?.length ?? 0;

  return (
    <>
      <Card
        header={{
          title: 'Dietary Preferences',
          subtitle: 'Manage dietary dislikes and saved presets',
          icon: <Utensils className="h-4 w-4" />,
        }}
      >
        <div className="flex flex-col gap-4 justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Custom Exclusions</span>
            <Button
              variant="outline"
              size="sm"
              icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
              label="Configure"
              onClick={() => setIsEditModalOpen(true)}
            />
          </div>

          {/* Dislikes / Exclusions View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Dietary Dislikes & Exclusions
              </span>
              {totalDislikesCount > 0 && (
                <Badge
                  variant="danger"
                  size="xs"
                  label={`${totalDislikesCount} exclusions active`}
                />
              )}
            </div>

            {totalDislikesCount === 0 ? (
              <EmptyState
                icon={<ShieldCheck className="h-6 w-6" />}
                title="No specific dietary exclusions configured"
                description="You receive standard weekly menus. You can exclude ingredients or specific dishes anytime."
                buttonLabel="Add Dietary Exclusions"
                buttonIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
                buttonAction={() => setIsEditModalOpen(true)}
              />
            ) : (
              <div className="space-y-2.5">
                {/* Ingredient Badges */}
                {dislikedFoodNames.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                      Ingredients ({dislikedFoodNames.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dislikedFoodNames.map((foodName, i) => (
                        <Badge
                          key={i}
                          variant="danger"
                          icon={<Ban className="h-3 w-3" />}
                          label={foodName}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Meal Badges */}
                {dislikedMealNames.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                      Specific Dishes ({dislikedMealNames.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dislikedMealNames.map((mealName, i) => (
                        <Badge
                          key={i}
                          variant="warning"
                          icon={<Ban className="h-3 w-3" />}
                          label={mealName}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {excludedMealsCount > 0 && (
                  <p className="text-[11px] text-text-secondary bg-surface-muted rounded-lg p-2 border border-border">
                    <span className="font-semibold text-text-primary">{excludedMealsCount} dishes</span> are automatically filtered out from your weekly meal planning.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Shortcuts / Presets */}
          <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/preset-meals')}
              className="flex-1 flex items-center justify-between rounded-xl bg-primary-light/60 hover:bg-primary-light p-3 text-left transition-colors border border-primary/20 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">Saved Preset Meals</span>
                  <span className="text-[11px] text-primary font-medium">
                    {stats?.totalPresets || 0} active presets
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-primary" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/select-meal')}
              className="flex-1 flex items-center justify-between rounded-xl bg-surface-muted hover:bg-surface p-3 text-left transition-colors border border-border cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-text-secondary" />
                <div>
                  <span className="text-xs font-bold text-text-primary block">Weekly Selection</span>
                  <span className="text-[11px] text-text-muted font-medium">
                    {stats?.totalSelections || 0} meals chosen
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>
          </div>
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
