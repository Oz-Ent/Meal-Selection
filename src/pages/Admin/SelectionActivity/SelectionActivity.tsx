import { useMemo, useState } from 'react';
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  RefreshCw,
  Search,
  Sparkles,
  UserRoundCheck,
  Check,
  X,
} from 'lucide-react';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { SearchBar } from '../../../components/SearchBar/SearchBar';

import EmptyFoodAssignmentSvg from '../../../assets/admin/EmptyFoodAssignment.svg';
import MenuFood from '../../../assets/admin/MenuFood.webp';
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
  useWeeklyHolidaysQuery,
  useWeekScheduleQuery,
  useWeeklyMealReportQuery,
} from '../../../api/useApiQueries';
import type { MenuDayMeal } from '../../../api/Services/MenuServices';
import type { WeeklyReportUser } from '../../../api/Services/MealSelectionServices';

const isGuestUser = (u: WeeklyReportUser): boolean => {
  return Boolean(u.isGuest || (u.name && u.name.toLowerCase().includes('(guest)')));
};

const getRecipientDisplayName = (u: WeeklyReportUser): string => {
  if (isGuestUser(u)) {
    const qty = u.quantity !== undefined && u.quantity !== null ? u.quantity : 1;
    return `Guest (${qty})`;
  }
  return u.createdForName || u.name || 'Unknown';
};

const doesUserMatchSearch = (u: WeeklyReportUser, q: string): boolean => {
  if (!q) return false;
  if (isGuestUser(u)) {
    const qty = u.quantity !== undefined && u.quantity !== null ? u.quantity : 1;
    const guestLabel = `guest (${qty})`;
    return 'guest'.includes(q) || q.includes('guest') || guestLabel.includes(q);
  }
  const name = u.createdForName || u.name;
  return Boolean(name && name.toLowerCase().includes(q));
};

export function SelectionActivity() {
  const { week, year } = getISOWeekAndYear();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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
  const weeklyHolidaysQuery = useWeeklyHolidaysQuery(week, year);
  const menuId = scheduleQuery.data?.menu.id ?? 0;
  const daysQuery = useMenuDaysQuery(menuId);
  const mealsQuery = useMenuMealsQuery(menuId);
  const reportDate = useMemo(() => new Date().toISOString(), []);
  const reportQuery = useWeeklyMealReportQuery(reportDate);
  const replaceMealMutation = useReplaceWeeklyMealMutation();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  const menuDays = useMemo(() => {
    const rawMenuDays = daysQuery.data ?? [];
    return [...rawMenuDays].sort(
      (a, b) => DAY_ORDER.indexOf(a.day.toUpperCase()) - DAY_ORDER.indexOf(b.day.toUpperCase()),
    );
  }, [daysQuery.data]);

  const currentDay = menuDays[currentDayIndex];
  const currentDayMeals = useMemo(() => {
    const dayMeals = mealsQuery.data ?? [];
    return currentDay
      ? dayMeals.filter((meal) => meal.menuDayId === currentDay.id && meal.isActive)
      : [];
  }, [currentDay, mealsQuery.data]);

  const weeklyReport = reportQuery.data ?? {};
  const currentDayReport = currentDay ? weeklyReport[currentDay.day.toUpperCase()] : undefined;

  const weeklyHolidays = useMemo(() => weeklyHolidaysQuery.data ?? [], [weeklyHolidaysQuery.data]);
  const activeHolidayFromList = useMemo(() => {
    if (!currentDay || !weeklyHolidays.length) return null;
    return weeklyHolidays.find((h) => h.dayName?.toUpperCase() === currentDay.day?.toUpperCase()) ?? null;
  }, [currentDay, weeklyHolidays]);

  const isHoliday = Boolean(currentDayReport?.isHoliday) || Boolean(activeHolidayFromList);
  const holidayTitle = currentDayReport?.holidayTitle || activeHolidayFromList?.title || 'Public / Company Holiday';
  const holidayDescription =
    currentDayReport?.holiday?.description ||
    activeHolidayFromList?.description ||
    'This day is recognized as a holiday. No meal delivery is scheduled.';
  const isCompanyHoliday =
    currentDayReport?.holiday?.isCompany ||
    activeHolidayFromList?.isCompany ||
    activeHolidayFromList?.source === 'COMPANY';

  const unavailableReportItem = useMemo(() => {
    if (!currentDayReport?.response) return null;
    return (
      currentDayReport.response.find(
        (item) => item.id === -1 || item.foodCode === 'UNAVAILABLE' || item.name.toLowerCase() === 'unavailable',
      ) ?? null
    );
  }, [currentDayReport]);

  const unavailableUsers = useMemo(() => unavailableReportItem?.users ?? [], [unavailableReportItem]);

  const showUnavailable = useMemo(() => {
    if (!unavailableReportItem || unavailableReportItem.count === 0) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    if ('unavailable'.includes(q)) return true;
    return unavailableUsers.some((u) => doesUserMatchSearch(u, q));
  }, [unavailableReportItem, unavailableUsers, searchQuery]);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchingUnavailableUsers = useMemo(() => {
    if (!trimmedQuery) return [];
    return unavailableUsers.filter((u) => doesUserMatchSearch(u, trimmedQuery));
  }, [unavailableUsers, trimmedQuery]);

  const hasMatchingUnavailableUser = matchingUnavailableUsers.length > 0;
  const isUnavailableExpanded =
    expandedMealIds.includes(-1) || (Boolean(trimmedQuery) && hasMatchingUnavailableUser);
  const displayUnavailableUsers =
    Boolean(trimmedQuery) && hasMatchingUnavailableUser && !'unavailable'.includes(trimmedQuery)
      ? matchingUnavailableUsers
      : unavailableUsers;

  // Filter meals for the current day by meal name OR assigned user names (created for / recipient only)
  const filteredCurrentDayMeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentDayMeals;

    return currentDayMeals.filter((menuMeal) => {
      // 1. Meal name match
      if (menuMeal.meal.name.toLowerCase().includes(q)) return true;

      // 2. Assigned user match in report (only createdFor / recipient name, NOT createdByName)
      const mealReportItem = currentDayReport?.response.find(
        (item) =>
          item.id === menuMeal.meal.id ||
          item.name.toLowerCase() === menuMeal.meal.name.toLowerCase(),
      );
      const users = mealReportItem?.users ?? [];
      return users.some((u) => doesUserMatchSearch(u, q));
    });
  }, [currentDayMeals, currentDayReport, searchQuery]);

  const availableReplacementMeals = useMemo(() => {
    if (!changingMeal || !currentDay) return [];
    const dayMeals = mealsQuery.data ?? [];
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
  }, [changingMeal, currentDay, mealsQuery.data]);

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

  const executeExport = (selectedDay: string) => {
    if (Object.keys(weeklyReport).length === 0) {
      setIsExportModalOpen(false);
      showToast('error', 'Something went wrong while exporting meal. Please try again.');
      return;
    }

    try {
      exportWeeklyReportToPdf({
        report: weeklyReport,
        selectedDay,
        titlePrefix: 'Food Assignment Report',
      });
      setIsExportModalOpen(false);
      showToast('success', 'Menu exported successfully.');
    } catch {
      setIsExportModalOpen(false);
      showToast('error', 'Something went wrong while exporting meal. Please try again.');
    }
  };

  const handleExportDay = () => {
    executeExport(currentDay ? currentDay.day.toUpperCase() : 'ALL');
  };

  const handleExportWeek = () => {
    executeExport('ALL');
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
    reportQuery.isLoading ||
    weeklyHolidaysQuery.isLoading;

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
        <main className="px-4 sm:px-6 pt-4">
          {/* Top Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search meal or user..."
          />

          {/* Active Holiday Information Banner */}
          {isHoliday && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 p-4 text-xs text-amber-900 shadow-2xs">
              <Sparkles size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{holidayTitle}</span>
                  <span className="rounded-md bg-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                    {isCompanyHoliday ? 'Company Holiday' : 'Holiday'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  {holidayDescription}
                </p>
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
              {currentDayName} Menu
            </span>
            {isHoliday ? (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                <Sparkles size={12} className="text-amber-600" />
                <span>Holiday</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                {currentDayReport ? `${currentDayReport.total} selections` : `${currentDayMeals.length} dishes`}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {filteredCurrentDayMeals.map((menuMeal) => {
              const mealReportItem = currentDayReport?.response.find(
                (item) => item.id === menuMeal.meal.id || item.name.toLowerCase() === menuMeal.meal.name.toLowerCase(),
              );
              const selectionCount = mealReportItem ? mealReportItem.count : 0;
              const users = mealReportItem?.users ?? [];

              const trimmedQuery = searchQuery.trim().toLowerCase();
              const matchingUsers = trimmedQuery
                ? users.filter((u) => doesUserMatchSearch(u, trimmedQuery))
                : [];
              const hasMatchingUser = matchingUsers.length > 0;

              // Auto expand when searching for a user that selected this meal
              const isExpanded =
                expandedMealIds.includes(menuMeal.id) || (Boolean(trimmedQuery) && hasMatchingUser);

              // When searching for a user, display matching users directly under the meal
              const displayUsers =
                Boolean(trimmedQuery) && hasMatchingUser && !menuMeal.meal.name.toLowerCase().includes(trimmedQuery)
                  ? matchingUsers
                  : users;

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
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
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
                      <p className="mb-1.5 text-xs font-semibold text-slate-600">
                        Assigned Recipients {displayUsers.length > 0 && `(${displayUsers.length})`}:
                      </p>
                      {displayUsers.length > 0 ? (
                        <div className="space-y-1 pl-1">
                          {displayUsers.map((user, index) => {
                            const displayName = getRecipientDisplayName(user);
                            const isUserMatch =
                              Boolean(trimmedQuery) && doesUserMatchSearch(user, trimmedQuery);
                            const isGuest = isGuestUser(user);
                            return (
                              <div
                                key={`${user.id ?? 'guest'}-${index}`}
                                className="flex items-center justify-between text-xs text-slate-600"
                              >
                                <span
                                  className={
                                    isUserMatch
                                      ? 'font-bold text-primary'
                                      : ''
                                  }
                                >
                                  {index + 1}. {displayName}
                                </span>
                                {!isGuest && user.quantity > 1 && (
                                  <span className="font-semibold text-slate-700">
                                    qty: {user.quantity}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No selections yet for this meal.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unavailable Selections Card */}
            {showUnavailable && unavailableReportItem && (
              <div
                className="relative rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs transition-all"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleMealExpanded(-1)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Ban size={22} className="text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                        Unavailable
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Opted out of lunch delivery
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Selection count badge */}
                    <div className="flex items-center gap-1 rounded-lg bg-slate-600 px-2 py-1 text-xs font-semibold text-white">
                      <span>{unavailableReportItem.count}</span>
                      <UserRoundCheck size={13} />
                    </div>
                  </div>
                </div>

                {/* Expandable unavailable recipients list */}
                {isUnavailableExpanded && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="mb-1.5 text-xs font-semibold text-slate-600">
                      Unavailable Recipients {displayUnavailableUsers.length > 0 && `(${displayUnavailableUsers.length})`}:
                    </p>
                    {displayUnavailableUsers.length > 0 ? (
                      <div className="space-y-1 pl-1">
                        {displayUnavailableUsers.map((user, index) => {
                          const displayName = getRecipientDisplayName(user);
                          const isUserMatch =
                            Boolean(trimmedQuery) && doesUserMatchSearch(user, trimmedQuery);
                          const isGuest = isGuestUser(user);
                          return (
                            <div
                              key={`${user.id ?? 'guest'}-${index}`}
                              className="flex items-center justify-between text-xs text-slate-600"
                            >
                              <span
                                className={
                                  isUserMatch
                                    ? 'font-bold text-primary'
                                    : ''
                                }
                              >
                                {index + 1}. {displayName}
                              </span>
                              {!isGuest && user.quantity > 1 && (
                                <span className="font-semibold text-slate-700">
                                  qty: {user.quantity}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No unavailable users for this day.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Empty state when search yields no matching meals or users */}
            {filteredCurrentDayMeals.length === 0 && !showUnavailable && searchQuery && (
              <div className="p-8 text-center text-slate-500 text-xs sm:text-sm bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                <Search size={24} className="text-slate-400" />
                <p className="font-semibold text-slate-800">No results found for "{searchQuery}"</p>
                <p className="text-slate-400 text-xs">Try searching for a different meal or user name</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Empty state when day has no meals */}
            {filteredCurrentDayMeals.length === 0 && !showUnavailable && !searchQuery && (
              <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
                {isHoliday
                  ? `No meal delivery needed for ${currentDayName} (Holiday).`
                  : `No meals assigned for ${currentDayName}.`}
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
              className="p-1 text-slate-600 disabled:opacity-25 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="capitalize">{currentDayName}</span>

            <button
              type="button"
              aria-label="Next day navigation"
              disabled={currentDayIndex === menuDays.length - 1}
              onClick={() => setCurrentDayIndex((prev) => Math.min(menuDays.length - 1, prev + 1))}
              className="p-1 text-slate-600 disabled:opacity-25 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Pill 2: Export Button (Opens Export Modal) */}
          <button
            type="button"
            aria-label="Export report"
            onClick={() => setIsExportModalOpen(true)}
            className="h-11 px-4 shrink-0 flex items-center gap-1.5 bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 text-slate-700 hover:text-slate-900 active:scale-95 transition-transform text-xs font-semibold cursor-pointer"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </footer>
      )}

      {/* EXPORT FOOD ASSIGNMENT MODAL */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        variant="bottom"
        showCloseButton={false}
      >
        <div className="relative flex flex-col p-4 pt-3 pb-6 w-full font-sans">
          {/* Top-Right Circular Close Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(false)}
            aria-label="Close modal"
            className="absolute right-3 top-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Burger Illustration */}
          <div className="flex justify-center my-3">
            <img
              src={MenuFood}
              alt="Export food assignment"
              className="w-24 h-20 sm:w-28 sm:h-24 object-contain"
            />
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 text-left">
            Export food assignment
          </h2>

          {/* Export Options */}
          <div className="flex flex-col gap-2.5 w-full">
            <button
              type="button"
              onClick={handleExportDay}
              className="flex w-full items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-2xs group"
            >
              <span>For {currentDayName.toLowerCase()}</span>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>

            <button
              type="button"
              onClick={handleExportWeek}
              className="flex w-full items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-2xs group"
            >
              <span>For the week</span>
              <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </div>
      </Modal>

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
