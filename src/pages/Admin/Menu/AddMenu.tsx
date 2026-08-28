import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Plus, Search } from 'lucide-react';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import { type Meal } from '../../../api/Services/MealServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import {
  useCreateMenuWithAssignmentsMutation,
  useMealsQuery,
} from '../../../api/useApiQueries';

interface MenuDaySelection {
  id: string;
  title: string;
  mealIds: number[];
}

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const formatDay = (day: string) =>
  day.charAt(0) + day.slice(1).toLowerCase();

function BowlIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-amber-600 fill-amber-100"
      >
        <path
          d="M12 4V2M16 5V2M8 5V2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 10C3 15.5228 7.02944 20 12 20C16.9706 20 21 15.5228 21 10H3Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export function AddMenu() {
  const navigate = useNavigate();
  const { menuName } = useParams<{ menuName: string }>();
  const decodedMenuName = menuName
    ? decodeURIComponent(menuName)
    : 'New Menu';

  const mealsQuery = useMealsQuery();
  const createMenuMutation = useCreateMenuWithAssignmentsMutation();

  const [menuDays, setMenuDays] = useState<MenuDaySelection[]>(
    WEEKDAYS.map((day) => ({
      id: day,
      title: formatDay(day),
      mealIds: [],
    })),
  );

  const [activeDayIdForMealSelection, setActiveDayIdForMealSelection] =
    useState<string | null>(null);

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

  const meals = (mealsQuery.data?.meals ?? []).filter(
    (meal) => meal.isActive,
  );

  const isLoading = mealsQuery.isLoading;

  const updateDayMeals = (dayId: string, mealIds: number[]) => {
    setMenuDays((currentDays) =>
      currentDays.map((day) =>
        day.id === dayId ? { ...day, mealIds } : day,
      ),
    );
  };

  const handleCreateMenuSubmit = async () => {
    setIsPreviewOpen(false);

    const title = decodedMenuName.trim();

    try {
      await createMenuMutation.mutateAsync({
        menu: { title },
        mealIdsByDay: Object.fromEntries(
          menuDays.map((day) => [day.id, day.mealIds]),
        ),
      });

      setToastState({
        isOpen: true,
        type: 'success',
        message: 'New menu added successfully',
      });
    } catch {
      setToastState({
        isOpen: true,
        type: 'error',
        message:
          'Something went wrong while creating menu. Please try again.',
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

            <p className="text-sm text-slate-500">
              Loading meals...
            </p>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuDays.map((day) => {
              const selectedMealsForDay = meals.filter((meal) =>
                day.mealIds.includes(meal.id),
              );

              return (
                <div
                  key={day.id}
                  className="flex min-h-[180px] flex-col justify-between rounded-3xl border border-slate-100 bg-white p-4 shadow-2xs sm:p-5"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between border-b border-slate-50 pb-2">
                      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                        {day.title}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveDayIdForMealSelection(day.id)
                        }
                        className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-slate-100"
                      >
                        <Plus size={14} />
                        <span>Add Meals</span>
                      </button>
                    </div>

                    {selectedMealsForDay.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <BowlIcon />

                        <p className="mt-2 text-xs font-medium text-slate-400">
                          Add meals to weekday
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selectedMealsForDay.map((meal) => (
                          <div
                            key={meal.id}
                            className="flex items-center gap-3 py-1"
                          >
                            <img
                              src={
                                meal.imagePath ||
                                FALLBACK_MEAL_IMAGE_URL
                              }
                              alt={meal.name}
                              className="h-10 w-10 rounded-xl object-cover"
                            />

                            <span className="line-clamp-2 text-xs font-semibold text-slate-800">
                              {meal.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
            menuDays.find(
              (day) => day.id === activeDayIdForMealSelection,
            )?.mealIds ?? []
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

function AllMealsModalSheet({
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

  const [searchQuery, setSearchQuery] = useState('');

  const toggleMeal = (mealId: number) => {
    setTempIds((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId],
    );
  };

  const filteredMeals = meals.filter((meal) =>
    meal.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <Modal
      isOpen
      variant="bottom"
      onClose={onClose}
      showCloseButton
    >
      <section className="flex max-h-[85vh] w-full flex-col font-sans">
        {/* Modal Header */}
        <div className="border-b border-slate-100 px-4 pb-3 pt-4">
          <h2 className="text-base font-bold text-slate-900">
            All meals
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Select all meals to add to this weekday.
          </p>

          {/* Search Input */}
          <div className="relative mt-3">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search meals..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Meals List */}
        <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-4 py-2">
          {filteredMeals.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
              <p className="text-sm font-semibold text-slate-600">
                No meals found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try searching for a different meal name.
              </p>
            </div>
          ) : (
            filteredMeals.map((meal) => {
              const isSelected = tempIds.includes(meal.id);

              return (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => toggleMeal(meal.id)}
                  className={`my-1 flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-primary-light'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3 pr-2">
                    <img
                      src={
                        meal.imagePath ||
                        FALLBACK_MEAL_IMAGE_URL
                      }
                      alt={meal.name}
                      className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 object-cover"
                    />

                    <span className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900">
                      {meal.name}
                    </span>
                  </div>

                  {isSelected && (
                    <Check
                      size={18}
                      className="shrink-0 text-primary"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Add Button */}
        <div className="border-t border-slate-100 bg-white p-4">
          <button
            type="button"
            onClick={() => onSave(tempIds)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:bg-primary-hover"
          >
            <Check size={18} />
            <span>Add</span>
          </button>
        </div>
      </section>
    </Modal>
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
  const [openDayId, setOpenDayId] = useState<string | null>(
    menuDays[0]?.id ?? 'MONDAY',
  );

  return (
    <Modal
      isOpen
      variant="bottom"
      onClose={onClose}
      showCloseButton
    >
      <section className="flex max-h-[85vh] w-full flex-col font-sans">
        {/* Modal Header */}
        <div className="border-b border-slate-100 px-4 pb-2 pt-4">
          <h2 className="text-base font-bold text-slate-900">
            Preview
          </h2>
        </div>

        {/* Preview List */}
        <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-4 py-2">
          {menuDays.map((day) => {
            const isOpen = openDayId === day.id;

            const dayMeals = allMeals.filter((meal) =>
              day.mealIds.includes(meal.id),
            );

            return (
              <div key={day.id} className="py-2">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDayId(isOpen ? null : day.id)
                  }
                  className="flex w-full items-center justify-between py-2 text-left"
                >
                  <span className="text-sm font-semibold text-slate-900">
                    {day.title}
                  </span>

                  {isOpen ? (
                    <ChevronUp
                      size={18}
                      className="text-slate-500"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-slate-500"
                    />
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
                        <div
                          key={meal.id}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={
                              meal.imagePath ||
                              FALLBACK_MEAL_IMAGE_URL
                            }
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