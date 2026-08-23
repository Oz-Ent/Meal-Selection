import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import { type Meal } from '../../../api/Services/MealServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import {
  useAssignMealsMutation,
  useMenuDaysQuery,
  useMenuMealsQuery,
  useMenuQuery,
  useMealsQuery,
  useToggleMenuMealStatusMutation,
  useUpdateMenuMutation,
} from '../../../api/useApiQueries';
import { queryKeys } from '../../../api/queryKeys';

interface DayAssignmentsLocal {
  id: number;
  title: string;
  meals: Meal[];
}

const formatDay = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

export function EditMenu() {
  const { menuId } = useParams<{ menuId: string }>();
  const numericMenuId = Number(menuId);
  const queryClient = useQueryClient();

  const menuQuery = useMenuQuery(numericMenuId);
  const menuDaysQuery = useMenuDaysQuery(numericMenuId);
  const menuMealsQuery = useMenuMealsQuery(numericMenuId);
  const mealsQuery = useMealsQuery();

  const updateMenuMutation = useUpdateMenuMutation();
  const assignMealsMutation = useAssignMealsMutation();
  const toggleMenuMealStatusMutation = useToggleMenuMealStatusMutation();

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDayIdForAdd, setActiveDayIdForAdd] = useState<number | null>(null);

  // Local state for meal assignments per day (key: menuDayId -> Meal[])
  const [localDayMeals, setLocalDayMeals] = useState<Record<number, Meal[]>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const menuTitle = menuQuery.data?.title ?? 'Menu';
  const meals = (mealsQuery.data?.meals ?? []).filter((m) => m.isActive);
  const menuDays = menuDaysQuery.data ?? [];

  const isLoading =
    menuQuery.isLoading ||
    menuDaysQuery.isLoading ||
    menuMealsQuery.isLoading ||
    mealsQuery.isLoading;

  // Initialize local state from server queries once loaded
  useEffect(() => {
    if (menuDaysQuery.data && menuMealsQuery.data && !isInitialized) {
      const initialMap: Record<number, Meal[]> = {};
      menuDaysQuery.data.forEach((day) => {
        const activeAssignments = menuMealsQuery.data
          .filter((assignment) => assignment.menuDayId === day.id && assignment.isActive)
          .map((assignment) => assignment.meal as Meal);
        initialMap[day.id] = activeAssignments;
      });
      setLocalDayMeals(initialMap);
      setIsInitialized(true);
    }
  }, [menuDaysQuery.data, menuMealsQuery.data, isInitialized]);

  // Construct view days model from local state (or query fallback if not initialized)
  const displayDays: DayAssignmentsLocal[] = menuDays.map((day) => ({
    id: day.id,
    title: formatDay(day.day),
    meals: isInitialized
      ? (localDayMeals[day.id] ?? [])
      : (menuMealsQuery.data ?? [])
          .filter((a) => a.menuDayId === day.id && a.isActive)
          .map((a) => a.meal as Meal),
  }));

  // Local Actions (No API calls until Save!)
  const handleRemoveMealLocal = (menuDayId: number, mealId: number) => {
    setLocalDayMeals((prev) => ({
      ...prev,
      [menuDayId]: (prev[menuDayId] ?? []).filter((m) => m.id !== mealId),
    }));
  };

  const handleClearDayMealsLocal = (menuDayId: number) => {
    setLocalDayMeals((prev) => ({
      ...prev,
      [menuDayId]: [],
    }));
  };

  const handleAddMealsToDayLocal = (menuDayId: number, selectedMealIds: number[]) => {
    const selectedMealObjects = meals.filter((m) => selectedMealIds.includes(m.id));
    setLocalDayMeals((prev) => {
      const currentForDay = prev[menuDayId] ?? [];
      const existingIds = new Set(currentForDay.map((m) => m.id));
      const newMeals = selectedMealObjects.filter((m) => !existingIds.has(m.id));
      return {
        ...prev,
        [menuDayId]: [...currentForDay, ...newMeals],
      };
    });
    setActiveDayIdForAdd(null);
  };

  // Commit changes to API on Save
  const handleSaveMenu = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. Update menu title if needed
      await updateMenuMutation.mutateAsync({
        id: numericMenuId,
        data: { title: menuTitle },
      });

      // 2. Diff local state against server assignments (both active and inactive)
      const allServerAssignments = menuMealsQuery.data ?? [];

      const promises: Promise<unknown>[] = [];
      const assignmentsToAdd: { menuDayId: number; meals: number[] }[] = [];

      menuDays.forEach((day) => {
        const serverAssignmentsForDay = allServerAssignments.filter((a) => a.menuDayId === day.id);
        const serverMealMap = new Map(serverAssignmentsForDay.map((a) => [a.meal.id, a]));

        const currentLocalMeals = localDayMeals[day.id] ?? [];
        const localMealIds = new Set(currentLocalMeals.map((m) => m.id));

        // 2a. Check existing server assignments for this day
        serverAssignmentsForDay.forEach((assignment) => {
          const isRequestedLocally = localMealIds.has(assignment.meal.id);

          if (isRequestedLocally && !assignment.isActive) {
            // Re-activate inactive server assignment
            promises.push(
              toggleMenuMealStatusMutation.mutateAsync({
                id: assignment.id,
                isActive: true,
                menuId: numericMenuId,
              }),
            );
          } else if (!isRequestedLocally && assignment.isActive) {
            // De-activate active server assignment
            promises.push(
              toggleMenuMealStatusMutation.mutateAsync({
                id: assignment.id,
                isActive: false,
                menuId: numericMenuId,
              }),
            );
          }
        });

        // 2b. Check for brand new meal IDs not present on server at all
        const brandNewMealIds = currentLocalMeals
          .map((m) => m.id)
          .filter((mealId) => !serverMealMap.has(mealId));

        if (brandNewMealIds.length > 0) {
          assignmentsToAdd.push({
            menuDayId: day.id,
            meals: brandNewMealIds,
          });
        }
      });

      // Execute status updates & new assignments
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      if (assignmentsToAdd.length > 0) {
        await assignMealsMutation.mutateAsync({
          menuId: numericMenuId,
          assignments: assignmentsToAdd,
        });
      }

      // Invalidate queries to sync TanStack Query cache
      await queryClient.invalidateQueries({ queryKey: queryKeys.menuMeals(numericMenuId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.menu(numericMenuId) });

      setIsInitialized(false); // Force re-sync with updated server state
      setIsEditingMode(false);
      setToastState({
        isOpen: true,
        type: 'success',
        message: `${menuTitle} changes saved successfully.`,
      });
    } catch {
      setToastState({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while saving changes to menu. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      {/* Top Bar Header */}
      <NavBar
        title={isEditingMode ? `Editing ${menuTitle}` : menuTitle}
        backUrl="/admin/menu"
        actionButton={
          isEditingMode
            ? {
                label: 'Save',
                icon: <Check size={14} />,
                onClick: () => void handleSaveMenu(),
                pending: isSaving,
                disabled: isSaving,
              }
            : {
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: () => setIsEditingMode(true),
                variant: 'outline',
              }
        }
      />

      {/* Main Weekday List */}
      <main className="p-4 sm:p-6">
        {isLoading && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <div className="h-8 w-8">
              <LoadingSpinner />
            </div>
            <p className="text-sm text-slate-500">Loading menu details...</p>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayDays.map((day) => (
              <div
                key={day.id}
                className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{day.title}</h3>
                    {isEditingMode && (
                      <button
                        type="button"
                        onClick={() => setActiveDayIdForAdd(day.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Meals</span>
                      </button>
                    )}
                  </div>

                  {day.meals.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400 italic">No meals added</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {day.meals.map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between gap-3 py-1">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                              alt={meal.name}
                              className="h-10 w-10 shrink-0 rounded-xl object-cover bg-slate-100"
                            />
                            <span className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
                              {meal.name}
                            </span>
                          </div>

                          {isEditingMode && (
                            <button
                              type="button"
                              aria-label="Remove meal"
                              onClick={() => handleRemoveMealLocal(day.id, meal.id)}
                              className="p-1 text-red-500 hover:text-red-700 shrink-0 cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      {isEditingMode && day.meals.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-50 text-center">
                          <button
                            type="button"
                            onClick={() => handleClearDayMealsLocal(day.id)}
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
            ))}
          </div>
        )}
      </main>

      {/* ALL MEALS SELECTION MODAL */}
      {activeDayIdForAdd !== null && (
        <EditMealSelectionModalSheet
          meals={meals}
          selectedMealIds={(localDayMeals[activeDayIdForAdd] ?? []).map((m) => m.id)}
          onClose={() => setActiveDayIdForAdd(null)}
          onSave={(ids) => handleAddMealsToDayLocal(activeDayIdForAdd, ids)}
        />
      )}

      {/* BOTTOM TOAST */}
      <BottomToast
        isOpen={toastState.isOpen}
        type={toastState.type}
        message={toastState.message}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
      />
    </div>
  );
}

function EditMealSelectionModalSheet({
  meals,
  selectedMealIds,
  onClose,
  onSave,
}: {
  meals: Meal[];
  selectedMealIds: number[];
  onClose: () => void;
  onSave: (selectedIds: number[]) => void;
}) {
  const [tempIds, setTempIds] = useState<number[]>(selectedMealIds);

  const toggleMeal = (mealId: number) => {
    setTempIds((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId],
    );
  };

  return (
    <Modal isOpen variant="bottom" onClose={onClose} showCloseButton>
      <section className="flex flex-col font-sans w-full max-h-[85vh]">
        <div className="px-4 pt-4 pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">All meals</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select all meals to add to this weekday.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-slate-100">
          {meals.map((meal) => {
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
          })}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => onSave(tempIds)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity"
          >
            <Check size={18} />
            <span>Add</span>
          </button>
        </div>
      </section>
    </Modal>
  );
}
