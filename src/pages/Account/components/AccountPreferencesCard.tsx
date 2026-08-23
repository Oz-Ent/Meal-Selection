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
  const foodItems = foodLibraryQuery.data ?? [];
  const meals = mealsQuery.data?.meals ?? [];

  // Map food codes to human-readable names
  const foodCodeToNameMap = useMemo(() => {
    const map = new Map<string, string>();
    foodItems.forEach((item) => {
      map.set(item.foodCode, item.name);
    });
    return map;
  }, [foodItems]);

  // Extract disliked food items and meal names
  const { dislikedFoodNames, dislikedMealNames, totalDislikesCount } = useMemo(() => {
    const rawDislikes = preferences?.dislikes;
    const foodNames: string[] = [];
    const mealNames: string[] = [];

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
  }, [preferences, foodCodeToNameMap, meals]);

  const excludedMealsCount = preferences?.excludedMealIds?.length ?? 0;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#00633d] border border-emerald-200/60">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Meal & Dietary Preferences</h3>
              <p className="text-xs text-slate-500">Manage dietary dislikes and saved presets</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 text-xs font-bold text-[#00633d] border border-emerald-200/70 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Configure</span>
          </button>
        </div>

        {/* Dislikes / Exclusions View */}
        <div className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Dietary Dislikes & Exclusions
            </span>
            {totalDislikesCount > 0 && (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {totalDislikesCount} exclusions active
              </span>
            )}
          </div>

          {totalDislikesCount === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-5 text-center px-4">
              <ShieldCheck className="h-6 w-6 text-slate-300 mb-1.5" />
              <p className="text-xs font-medium text-slate-600">
                No specific dietary exclusions configured
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-0.5 mb-2.5">
                You receive standard weekly menus. You can exclude ingredients or specific dishes anytime.
              </p>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#00633d] border border-slate-200 shadow-2xs hover:bg-slate-50 cursor-pointer"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Add Dietary Exclusions
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Ingredient Badges */}
              {dislikedFoodNames.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Ingredients ({dislikedFoodNames.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dislikedFoodNames.map((foodName, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200/80"
                      >
                        <Ban className="h-3 w-3 text-rose-500" />
                        {foodName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Meal Badges */}
              {dislikedMealNames.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Specific Dishes ({dislikedMealNames.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dislikedMealNames.map((mealName, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200"
                      >
                        <Ban className="h-3 w-3 text-amber-600" />
                        {mealName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {excludedMealsCount > 0 && (
                <p className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100">
                  <span className="font-semibold text-slate-700">{excludedMealsCount} dishes</span> are automatically filtered out from your weekly meal planning.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Shortcuts / Presets */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/preset-meals')}
            className="flex-1 flex items-center justify-between rounded-xl bg-emerald-50/70 hover:bg-emerald-50 p-3 text-left transition-colors border border-emerald-100 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="h-4 w-4 text-[#00633d]" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Saved Preset Meals</span>
                <span className="text-[11px] text-[#00633d] font-medium">
                  {stats?.totalPresets || 0} active presets
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#00633d]" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/select-meal')}
            className="flex-1 flex items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100/80 p-3 text-left transition-colors border border-slate-100 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-slate-700" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Weekly Selection</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {stats?.totalSelections || 0} meals chosen
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Edit Preferences Modal */}
      <EditPreferencesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialPreferences={preferences}
      />
    </>
  );
};
