import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  RefreshCw,
  Search,
  UserRoundCheck,
  Check,
} from 'lucide-react';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import EmptyFoodAssignmentSvg from '../../../assets/admin/EmptyFoodAssignment.svg';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import { getISOWeekAndYear } from '../../../utils/dateHelpers';
import {
  DAY_ORDER,
  formatDay,
  exportWeeklyReportToPdf,
} from '../../../utils/exportMealReportPdf';
import {
  useMenuDaysQuery,
  useMenuMealsQuery,
  useReplaceWeeklyMealMutation,
  useWeekScheduleQuery,
  useWeeklyMealReportQuery,
} from '../../../api/useApiQueries';
import type { MenuDayMeal } from '../../../api/Services/MenuServices';

export function SelectionActivity() {
  const { week, year } = getISOWeekAndYear();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [openKebabMealId, setOpenKebabMealId] = useState<number | null>(null);
  const [changingMeal, setChangingMeal] = useState<MenuDayMeal | null>(null);
  const [selectedReplacementDayMealId, setSelectedReplacementDayMealId] = useState<number | null>(
    null,
  );
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [expandedMealIds, setExpandedMealIds] = useState<number[]>([]);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const scheduleQuery = useWeekScheduleQuery(week, year);
  const menuId = scheduleQuery.data?.menu.id ?? 0;
  const daysQuery = useMenuDaysQuery(menuId);
  const mealsQuery = useMenuMealsQuery(menuId);
  const reportDate = useMemo(() => new Date().toISOString(), []);
  const reportQuery = useWeeklyMealReportQuery(reportDate);
  const replaceMealMutation = useReplaceWeeklyMealMutation();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  const rawMenuDays = daysQuery.data ?? [];
  const menuDays = useMemo(() => {
    return [...rawMenuDays].sort(
      (a, b) => DAY_ORDER.indexOf(a.day.toUpperCase()) - DAY_ORDER.indexOf(b.day.toUpperCase()),
    );
  }, [rawMenuDays]);

  const currentDay = menuDays[currentDayIndex];
  const dayMeals = mealsQuery.data ?? [];
  const currentDayMeals = currentDay
    ? dayMeals.filter((meal) => meal.menuDayId === currentDay.id && meal.isActive)
    : [];

  const weeklyReport = reportQuery.data ?? {};
  const currentDayReport = currentDay ? weeklyReport[currentDay.day.toUpperCase()] : undefined;


  const availableReplacementMeals = useMemo(() => {
    if (!changingMeal || !currentDay) return [];
    // Same-day alternative menu meals that are active and not the current one
    const sameDayAlternatives = dayMeals.filter(
      (meal) =>
        meal.menuDayId === currentDay.id &&
        meal.isActive &&
        meal.id !== changingMeal.id,
    );

    if (sameDayAlternatives.length > 0) {
      return sameDayAlternatives;
    }

    // Fallback: map other active meals in the menu or master library
    return dayMeals.filter((meal) => meal.isActive && meal.id !== changingMeal.id);
  }, [changingMeal, currentDay, dayMeals]);

  const filteredReplacementMeals = useMemo(() => {
    const query = mealSearchQuery.trim().toLowerCase();
    if (!query) return availableReplacementMeals;
    return availableReplacementMeals.filter((item) =>
      item.meal.name.toLowerCase().includes(query),
    );
  }, [availableReplacementMeals, mealSearchQuery]);

  const toggleMealExpanded = (mealId: number) => {
    setExpandedMealIds((prev) =>
      prev.includes(mealId) ? prev.filter((id) => id !== mealId) : [...prev, mealId],
    );
  };

  const handleExport = () => {
    if (Object.keys(weeklyReport).length === 0) {
      showToast('error', 'No meal data available to export.');
      return;
    }

    exportWeeklyReportToPdf({
      report: weeklyReport,
      selectedDay: currentDay ? currentDay.day.toUpperCase() : 'ALL',
      titlePrefix: 'Food Assignment Report',
    });
  };

  const handleConfirmChangeMeal = async () => {
    if (!changingMeal || !selectedReplacementDayMealId || replaceMealMutation.isPending) return;

    try {
      const result = await replaceMealMutation.mutateAsync({
        weekNumber: week,
        year,
        unavailableDayMealId: changingMeal.id,
        replacementDayMealId: selectedReplacementDayMealId,
      });

      setChangingMeal(null);
      setSelectedReplacementDayMealId(null);
      setMealSearchQuery('');
      showToast(
        'success',
        result.affectedSelections > 0
          ? `Meal changed successfully. Updated ${result.affectedSelections} selection(s).`
          : 'Meal changed successfully.',
      );
    } catch {
      showToast('error', 'Something went wrong while changing meal. Please try again.');
    }
  };

  const isLoading =
    scheduleQuery.isLoading ||
    daysQuery.isLoading ||
    mealsQuery.isLoading ||
    reportQuery.isLoading;

  const currentDayName = currentDay ? formatDay(currentDay.day) : 'Monday';

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      <NavBar title="Food Assignment" backUrl="/admin/activities" />

      {isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8">
            <LoadingSpinner />
          </div>
          <p className="text-sm text-slate-500">Loading food assignments...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && menuDays.length === 0 && (
        <div className="flex flex-col items-center justify-center px-8 pt-20 text-center">
          <img
            src={EmptyFoodAssignmentSvg}
            alt="No food assignments"
            className="w-56 h-auto max-h-48 object-contain mb-6"
          />
          <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-64">
            There are no food assignments available for this week.
          </p>
        </div>
      )}

      {/* MEALS LIST VIEW FOR CURRENT DAY */}
      {!isLoading && menuDays.length > 0 && (
        <main className="px-4 sm:px-6 pt-5">
          <div className="mb-4 flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
              {currentDayName} Menu
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              {currentDayReport ? `${currentDayReport.total} selections` : `${currentDayMeals.length} dishes`}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {currentDayMeals.map((menuMeal) => {
              const mealReportItem = currentDayReport?.response.find(
                (item) => item.id === menuMeal.meal.id || item.name.toLowerCase() === menuMeal.meal.name.toLowerCase(),
              );
              const selectionCount = mealReportItem ? mealReportItem.count : 0;
              const users = mealReportItem?.users ?? [];
              const isExpanded = expandedMealIds.includes(menuMeal.id);

              return (
                <div
                  key={menuMeal.id}
                  className="relative rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-2xs transition-all"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleMealExpanded(menuMeal.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <img
                        src={menuMeal.meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                        alt={menuMeal.meal.name}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                          {menuMeal.meal.name}
                        </h3>
                        {menuMeal.meal.calories && (
                          <span className="text-[11px] text-slate-400">
                            {menuMeal.meal.calories} kcal
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Selection count badge */}
                      <div className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-white">
                        <span>{selectionCount}</span>
                        <UserRoundCheck size={13} />
                      </div>

                      {/* Kebab menu trigger button */}
                      <button
                        type="button"
                        aria-label="More options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenKebabMealId(openKebabMealId === menuMeal.id ? null : menuMeal.id);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Kebab Options Dropdown Popup */}
                  {openKebabMealId === menuMeal.id && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenKebabMealId(null);
                        }}
                      />
                      <div
                        className="absolute right-3 top-12 z-40 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl flex flex-col gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenKebabMealId(null);
                            setChangingMeal(menuMeal);
                            setSelectedReplacementDayMealId(null);
                            setMealSearchQuery('');
                          }}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <RefreshCw size={15} className="text-slate-500" />
                          <span>Change meal</span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Expandable assigned users list */}
                  {isExpanded && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="mb-1.5 text-xs font-semibold text-slate-600">Assigned Recipients:</p>
                      {users.length > 0 ? (
                        <div className="space-y-1 pl-1">
                          {users.map((user, index) => (
                            <div
                              key={`${user.id ?? 'guest'}-${index}`}
                              className="flex items-center justify-between text-xs text-slate-600"
                            >
                              <span>
                                {index + 1}. {user.name}
                              </span>
                              {user.quantity > 1 && (
                                <span className="font-semibold text-slate-700">
                                  qty: {user.quantity}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No selections yet for this meal.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {currentDayMeals.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
                No meals assigned for {currentDayName}.
              </div>
            )}
          </div>
        </main>
      )}

      {/* FLOATING BOTTOM CONTROL BAR: DAY NAVIGATION & EXPORT BUTTON */}
      {!isLoading && menuDays.length > 0 && (
        <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex items-center gap-2 z-20">
          {/* Pill 1: Day Navigation */}
          <div className="flex-1 flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-3 py-2 shadow-md shadow-slate-200/50 text-xs font-bold text-slate-800">
            <button
              type="button"
              aria-label="Previous day navigation"
              disabled={currentDayIndex === 0}
              onClick={() => setCurrentDayIndex((prev) => Math.max(0, prev - 1))}
              className="p-1 text-slate-600 disabled:opacity-25 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="capitalize">{currentDayName}</span>

            <button
              type="button"
              aria-label="Next day navigation"
              disabled={currentDayIndex === menuDays.length - 1}
              onClick={() => setCurrentDayIndex((prev) => Math.min(menuDays.length - 1, prev + 1))}
              className="p-1 text-slate-600 disabled:opacity-25 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Pill 2: Export Button */}
          <button
            type="button"
            aria-label="Export report"
            onClick={handleExport}
            className="h-11 px-4 shrink-0 flex items-center gap-1.5 bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 text-slate-700 hover:text-slate-900 active:scale-95 transition-transform text-xs font-semibold"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </footer>
      )}

      {/* CHANGE MEAL MODAL */}
      {changingMeal && (
        <Modal
          isOpen={Boolean(changingMeal)}
          onClose={() => !replaceMealMutation.isPending && setChangingMeal(null)}
          variant="bottom"
          showCloseButton={!replaceMealMutation.isPending}
        >
          <section className="p-4 pt-6 text-text-primary flex flex-col font-sans w-full">
            <h2 className="mb-2 text-base font-bold text-slate-900">Change meal</h2>
            <p className="mb-4 text-xs text-slate-500">
              Select a replacement dish for{' '}
              <span className="font-semibold text-slate-700">{changingMeal.meal.name}</span> on{' '}
              <span className="font-semibold text-slate-700">{currentDayName}</span>.
            </p>

            {/* Search Input */}
            <div className="relative mb-3 w-full">
              <input
                type="text"
                value={mealSearchQuery}
                onChange={(e) => setMealSearchQuery(e.target.value)}
                placeholder="Search replacement meal"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none pr-10 focus:border-slate-400 placeholder:text-slate-400 bg-slate-50/50"
              />
              <Search
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
            </div>

            {/* Replacement Meal Options List */}
            <div className="max-h-60 overflow-y-auto space-y-2 mb-5 pr-1 divide-y divide-slate-100">
              {filteredReplacementMeals.map((item) => {
                const isSelected = selectedReplacementDayMealId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedReplacementDayMealId(item.id)}
                    className={`flex w-full items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      isSelected ? 'bg-primary-light border border-primary/30' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <img
                        src={item.meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
                        alt={item.meal.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs leading-snug line-clamp-1 ${
                            isSelected ? 'font-semibold text-primary' : 'font-medium text-slate-800'
                          }`}
                        >
                          {item.meal.name}
                        </p>
                        {item.meal.calories && (
                          <span className="text-[10px] text-slate-400">
                            {item.meal.calories} kcal
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}

              {filteredReplacementMeals.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">
                  No alternative meals available.
                </p>
              )}
            </div>

            {/* Confirm Replacement Button */}
            <button
              type="button"
              disabled={!selectedReplacementDayMealId || replaceMealMutation.isPending}
              onClick={() => void handleConfirmChangeMeal()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:bg-primary-hover disabled:opacity-40"
            >
              {replaceMealMutation.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Check size={18} />
              )}
              <span>Save changes</span>
            </button>
          </section>
        </Modal>
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
