import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Check, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import MenuDayCard from '../../../components/MenuDayCard/MenuDayCard';
import AllMealsModalSheet from '../../../components/AllMealsModalSheet/AllMealsModalSheet';
import { navigateBack } from '../../../utils/navigation';

import { type Meal } from '../../../api/Services/MealServices';
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
  const navigate = useNavigate();
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
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);

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

  // Warn on page reload or tab close when in editing mode
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditingMode) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditingMode]);

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
  const handleSaveMenu = async (andNavigateBack: boolean = false) => {
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
      setIsUnsavedModalOpen(false);
      setToastState({
        isOpen: true,
        type: 'success',
        message: `${menuTitle} changes saved successfully.`,
      });
      if (andNavigateBack) {
        navigateBack(navigate, '/admin/menu');
      }
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

  const handleBackNavigation = () => {
    if (isEditingMode) {
      setIsUnsavedModalOpen(true);
    } else {
      navigateBack(navigate, '/admin/menu');
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      {/* Top Bar Header */}
      <NavBar
        title={isEditingMode ? `Editing ${menuTitle}` : menuTitle}
        onBackClick={handleBackNavigation}
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
              <MenuDayCard
                key={day.id}
                dayTitle={day.title}
                meals={day.meals}
                isEditable={isEditingMode}
                onAddMeals={() => setActiveDayIdForAdd(day.id)}
                onRemoveMeal={(mealId) => handleRemoveMealLocal(day.id, mealId)}
                onClearMeals={() => handleClearDayMealsLocal(day.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ALL MEALS SELECTION MODAL */}
      {activeDayIdForAdd !== null && (
        <AllMealsModalSheet
          meals={meals}
          selectedMealIds={(localDayMeals[activeDayIdForAdd] ?? []).map((m) => m.id)}
          onClose={() => setActiveDayIdForAdd(null)}
          onSave={(ids) => handleAddMealsToDayLocal(activeDayIdForAdd, ids)}
        />
      )}

      {/* UNSAVED CHANGES MODAL */}
      <Modal
        isOpen={isUnsavedModalOpen}
        onClose={() => !isSaving && setIsUnsavedModalOpen(false)}
        variant="bottom"
        showCloseButton={!isSaving}
      >
        <section className="p-4 pt-6 text-text-primary flex flex-col font-sans w-full">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Unsaved changes</h2>
          </div>
          <p className="mb-6 text-sm text-slate-600 leading-relaxed">
            You have unsaved changes while editing <strong className="text-slate-900">{menuTitle}</strong>. Would you like to save or discard your changes before leaving?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setIsUnsavedModalOpen(false);
                setIsEditingMode(false);
                setIsInitialized(false);
                navigateBack(navigate, '/admin/menu');
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSaveMenu(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-50"
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Check size={18} />
              )}
              <span>Save & Exit</span>
            </button>
          </div>
        </section>
      </Modal>

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
