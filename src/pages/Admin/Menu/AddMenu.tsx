import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Plus } from 'lucide-react';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import MenuDayCard from '../../../components/MenuDayCard/MenuDayCard';
import AllMealsModalSheet from '../../../components/AllMealsModalSheet/AllMealsModalSheet';

import { type Meal } from '../../../api/Services/MealServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import { useCreateMenuWithAssignmentsMutation, useMealsQuery } from '../../../api/useApiQueries';

interface MenuDaySelection {
  id: string;
  title: string;
  mealIds: number[];
}

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const formatDay = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

export function AddMenu() {
  const navigate = useNavigate();
  const { menuName } = useParams<{ menuName: string }>();
  const decodedMenuName = menuName ? decodeURIComponent(menuName) : 'New Menu';

  const mealsQuery = useMealsQuery();
  const createMenuMutation = useCreateMenuWithAssignmentsMutation();

  const [menuDays, setMenuDays] = useState<MenuDaySelection[]>(
    WEEKDAYS.map((day) => ({
      id: day,
      title: formatDay(day),
      mealIds: [],
    })),
  );

  const [activeDayIdForMealSelection, setActiveDayIdForMealSelection] = useState<string | null>(
    null,
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const meals = (mealsQuery.data?.meals ?? []).filter((meal) => meal.isActive);

  const isLoading = mealsQuery.isLoading;

  const updateDayMeals = (dayId: string, mealIds: number[]) => {
    setMenuDays((currentDays) =>
      currentDays.map((day) => (day.id === dayId ? { ...day, mealIds } : day)),
    );
  };

  const handleRemoveMealFromDay = (dayId: string, mealId: number) => {
    setMenuDays((currentDays) =>
      currentDays.map((day) =>
        day.id === dayId ? { ...day, mealIds: day.mealIds.filter((id) => id !== mealId) } : day,
      ),
    );
  };

  const handleClearDayMeals = (dayId: string) => {
    setMenuDays((currentDays) =>
      currentDays.map((day) => (day.id === dayId ? { ...day, mealIds: [] } : day)),
    );
  };

  const handleCreateMenuSubmit = async () => {
    if (createMenuMutation.isPending) return;
    const title = decodedMenuName.trim();

    try {
      await createMenuMutation.mutateAsync({
        menu: { title },
        mealIdsByDay: Object.fromEntries(menuDays.map((day) => [day.id, day.mealIds])),
      });
      setIsPreviewOpen(false);
      setToastState({
        isOpen: true,
        type: 'success',
        message: 'New menu added successfully',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong while creating menu. Please try again.';
      setToastState({
        isOpen: true,
        type: 'error',
        message,
      });
    }
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 font-sans text-text-primary">
      {/* Header Bar */}
      <NavBar
        title={decodedMenuName}
        backUrl="/admin/menu"
        actionButton={{
          label: 'Done',
          icon: <Check size={14} />,
          disabled: createMenuMutation.isPending,
          pending: createMenuMutation.isPending,
          onClick: () => setIsPreviewOpen(true),
        }}
      />

      {/* Weekday Cards List */}
      <main className="p-4 sm:p-6">
        {isLoading && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <div className="h-8 w-8">
              <LoadingSpinner />
            </div>

            <p className="text-sm text-slate-500">Loading meals...</p>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuDays.map((day) => {
              const selectedMealsForDay = meals.filter((meal) => day.mealIds.includes(meal.id));

              return (
                <MenuDayCard
                  key={day.id}
                  dayTitle={day.title}
                  meals={selectedMealsForDay}
                  isEditable={true}
                  onAddMeals={() => setActiveDayIdForMealSelection(day.id)}
                  onRemoveMeal={(mealId) => handleRemoveMealFromDay(day.id, mealId)}
                  onClearMeals={() => handleClearDayMeals(day.id)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* ALL MEALS SELECTION MODAL */}
      {activeDayIdForMealSelection && (
        <AllMealsModalSheet
          meals={meals}
          selectedMealIds={
            menuDays.find((day) => day.id === activeDayIdForMealSelection)?.mealIds ?? []
          }
          onClose={() => setActiveDayIdForMealSelection(null)}
          onSave={(ids) => {
            updateDayMeals(activeDayIdForMealSelection, ids);
            setActiveDayIdForMealSelection(null);
          }}
        />
      )}

      {/* PREVIEW MODAL */}
      {isPreviewOpen && (
        <PreviewModalSheet
          menuDays={menuDays}
          allMeals={meals}
          isSubmitting={createMenuMutation.isPending}
          onClose={() => setIsPreviewOpen(false)}
          onSubmit={handleCreateMenuSubmit}
        />
      )}

      {/* BOTTOM TOAST */}
      <BottomToast
        isOpen={toastState.isOpen}
        type={toastState.type}
        message={toastState.message}
        onClose={() => {
          setToastState({
            ...toastState,
            isOpen: false,
          });

          if (toastState.type === 'success') {
            navigate('/admin/menu');
          }
        }}
      />
    </div>
  );
}

function PreviewModalSheet({
  menuDays,
  allMeals,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  menuDays: MenuDaySelection[];
  allMeals: Meal[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [openDayId, setOpenDayId] = useState<string | null>(menuDays[0]?.id ?? 'MONDAY');

  return (
    <Modal
      isOpen
      variant="bottom"
      onClose={() => !isSubmitting && onClose()}
      showCloseButton={!isSubmitting}
    >
      <section className="flex flex-col font-sans w-full max-h-[85vh]">
        <div className="px-4 pt-4 pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Preview</h2>
        </div>

        {/* Preview List */}
        <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-4 py-2">
          {menuDays.map((day) => {
            const isOpen = openDayId === day.id;

            const dayMeals = allMeals.filter((meal) => day.mealIds.includes(meal.id));

            return (
              <div key={day.id} className="py-2">
                <button
                  type="button"
                  onClick={() => setOpenDayId(isOpen ? null : day.id)}
                  className="flex w-full items-center justify-between py-2 text-left"
                >
                  <span className="text-sm font-semibold text-slate-900">{day.title}</span>

                  {isOpen ? (
                    <ChevronUp size={18} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-500" />
                  )}
                </button>

                {isOpen && (
                  <div className="flex flex-col gap-2 pb-1 pl-2 pt-2">
                    {dayMeals.length === 0 ? (
                      <p className="text-xs italic text-slate-400">
                        No meals selected for this day.
                      </p>
                    ) : (
                      dayMeals.map((meal) => (
                        <div key={meal.id} className="flex items-center gap-3">
                          <img
                            src={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                            alt={meal.name}
                            className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 object-cover"
                          />

                          <span className="line-clamp-2 text-xs font-semibold text-slate-800">
                            {meal.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Menu Button */}
        <div className="border-t border-slate-100 bg-white p-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Plus size={18} />
            )}

            <span>Create menu</span>
          </button>
        </div>
      </section>
    </Modal>
  );
}
