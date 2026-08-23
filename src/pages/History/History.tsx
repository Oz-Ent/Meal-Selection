import { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Filter,
  Flame,
  Layers,
  RotateCcw,
  User,
  Users,
  Utensils,
} from 'lucide-react';
import AppIcon from '../../assets/App Icon.svg';
import MealForeground from '../../assets/MealForeground.jpg';
import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { EmptyPage } from '../../components/EmptyPage/EmptyPage';
import { useAuth } from '../Auth/useAuth/useAuth';
import {
  useUserWeeklyHistoryQuery,
  useWeeklyHistoryQuery,
} from '../../api/useApiQueries';
import type { WeeklyHistoryFilterParams } from '../../api/Services/MealSelectionServices';
import { DAY_ORDER, formatDay, exportWeeklyReportToPdf } from '../../utils/exportMealReportPdf';

export function History() {
  const { profile } = useAuth();
  const roleName = profile?.user?.roleName?.toLowerCase();
  const isAdminOrHr = roleName === 'admin' || roleName === 'hr';

  // Tabs for Admin/HR: 'my-history' | 'admin-report'
  const [activeTab, setActiveTab] = useState<'my-history' | 'admin-report'>('my-history');

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [startYear, setStartYear] = useState<string>('');
  const [startWeek, setStartWeek] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');
  const [endWeek, setEndWeek] = useState<string>('');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  // Expanded weeks state (record of weekMenuScheduleId -> boolean)
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});

  // Expanded meal details state in admin view (key: `${weekMenuScheduleId}-${day}-${dishId}`)
  const [expandedMealIds, setExpandedMealIds] = useState<Record<string, boolean>>({});

  const toggleMealExpand = (key: string) => {
    setExpandedMealIds((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filterParams: WeeklyHistoryFilterParams = useMemo(() => {
    const params: WeeklyHistoryFilterParams = {
      page,
      limit,
      order,
    };
    if (startYear) params.startYear = Number(startYear);
    if (startWeek) params.startWeek = Number(startWeek);
    if (endYear) params.endYear = Number(endYear);
    if (endWeek) params.endWeek = Number(endWeek);
    return params;
  }, [page, limit, order, startYear, startWeek, endYear, endWeek]);

  // Queries
  const userHistoryQuery = useUserWeeklyHistoryQuery(
    profile?.user?.id,
    filterParams,
    { enabled: !isAdminOrHr || activeTab === 'my-history' },
  );

  const adminHistoryQuery = useWeeklyHistoryQuery(filterParams);

  const isQueryLoading =
    activeTab === 'my-history' || !isAdminOrHr
      ? userHistoryQuery.isLoading
      : adminHistoryQuery.isLoading;

  const isQueryError =
    activeTab === 'my-history' || !isAdminOrHr
      ? userHistoryQuery.isError
      : adminHistoryQuery.isError;

  const userHistoryData = userHistoryQuery.data;
  const adminHistoryData = adminHistoryQuery.data;

  const pagination =
    activeTab === 'my-history' || !isAdminOrHr
      ? userHistoryData?.pagination
      : adminHistoryData?.pagination;

  const totalWeeks = pagination?.totalWeeks ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const toggleWeekExpand = (id: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleResetFilters = () => {
    setStartYear('');
    setStartWeek('');
    setEndYear('');
    setEndWeek('');
    setOrder('desc');
    setLimit(20);
    setPage(1);
  };

  const handleQuickRange = (weeksCount: number) => {
    setStartYear('');
    setStartWeek('');
    setEndYear('');
    setEndWeek('');
    setOrder('desc');
    setLimit(weeksCount);
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    startYear || startWeek || endYear || endWeek || order !== 'desc' || limit !== 20,
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-32 text-text-primary font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md shadow-2xs sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src={AppIcon} alt="App Icon" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold tracking-tight text-slate-800">
            Edziban
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
            hasActiveFilters || isFilterOpen
              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          aria-label="Toggle filter panel"
        >
          <Filter size={15} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col gap-5 px-4 pt-5 sm:px-6">
        {/* Title & Description */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Selection History
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            Browse through past weekly menus, view meal selections, and review dietary choices across week ranges and years.
          </p>
        </div>

        {/* Tab Switcher for Admin/HR */}
        {isAdminOrHr && (
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('my-history');
                setPage(1);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all sm:text-sm ${
                activeTab === 'my-history'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={16} />
              <span>My Selection History</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin-report');
                setPage(1);
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all sm:text-sm ${
                activeTab === 'admin-report'
                  ? 'bg-white text-secondary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={16} />
              <span>Admin Report History</span>
            </button>
          </div>
        )}

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Calendar size={16} className="text-emerald-700" />
                <span>Week & Year Range Filters</span>
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>

            {/* Quick Filter Presets */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Quick ranges:</span>
              <button
                type="button"
                onClick={() => handleQuickRange(4)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  limit === 4 && !startYear && !endYear
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Last 4 Weeks
              </button>
              <button
                type="button"
                onClick={() => handleQuickRange(12)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  limit === 12 && !startYear && !endYear
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Last 12 Weeks
              </button>
              <button
                type="button"
                onClick={() => handleQuickRange(20)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  limit === 20 && !startYear && !endYear
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Last 20 Weeks (Default)
              </button>
            </div>

            {/* Range Inputs Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="history-from-year" className="mb-1 block text-xs font-semibold text-slate-600">
                  From Year
                </label>
                <input
                  id="history-from-year"
                  type="number"
                  placeholder="e.g. 2025"
                  min={2000}
                  max={2100}
                  value={startYear}
                  onChange={(e) => {
                    setStartYear(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="history-from-week" className="mb-1 block text-xs font-semibold text-slate-600">
                  From Week (1-53)
                </label>
                <input
                  id="history-from-week"
                  type="number"
                  placeholder="e.g. 40"
                  min={1}
                  max={53}
                  value={startWeek}
                  onChange={(e) => {
                    setStartWeek(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="history-to-year" className="mb-1 block text-xs font-semibold text-slate-600">
                  To Year
                </label>
                <input
                  id="history-to-year"
                  type="number"
                  placeholder="e.g. 2026"
                  min={2000}
                  max={2100}
                  value={endYear}
                  onChange={(e) => {
                    setEndYear(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="history-to-week" className="mb-1 block text-xs font-semibold text-slate-600">
                  To Week (1-53)
                </label>
                <input
                  id="history-to-week"
                  type="number"
                  placeholder="e.g. 10"
                  min={1}
                  max={53}
                  value={endWeek}
                  onChange={(e) => {
                    setEndWeek(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Secondary Controls: Limit and Order */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">Sort:</span>
                  <select
                    value={order}
                    onChange={(e) => {
                      setOrder(e.target.value as 'asc' | 'desc');
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">Per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value={10}>10 weeks</option>
                    <option value={20}>20 weeks (Default)</option>
                    <option value={50}>50 weeks</option>
                  </select>
                </div>
              </div>

              <span className="text-xs text-slate-400">
                Total matching: <strong className="text-slate-700">{totalWeeks}</strong> weeks
              </span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isQueryLoading && (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        )}

        {/* Error Alert */}
        {isQueryError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-700">
            Unable to load meal selection history. Please check your connection and try again.
          </div>
        )}

        {/* Empty State */}
        {!isQueryLoading && !isQueryError && totalWeeks === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <EmptyPage item="meal selection history records" />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Data List: User History View */}
        {!isQueryLoading &&
          !isQueryError &&
          (activeTab === 'my-history' || !isAdminOrHr) &&
          userHistoryData?.data?.map((weekItem) => {
            const isExpanded = expandedWeeks[weekItem.weekMenuScheduleId] ?? true;
            const mealSelections = weekItem.selection.mealSelections as Record<
              string,
              {
                id?: number;
                mealName?: string;
                selectionType?: string;
                calories?: number | null;
                foodCode?: string | null;
                mealImagePath?: string | null;
              }
            >;

            const daysWithSelections = DAY_ORDER.filter(
              (day) => day in (mealSelections || {}),
            );

            return (
              <section
                key={weekItem.weekMenuScheduleId}
                className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs transition-all"
              >
                {/* Week Header Accordion Bar */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleWeekExpand(weekItem.weekMenuScheduleId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleWeekExpand(weekItem.weekMenuScheduleId);
                    }
                  }}
                  className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-slate-50/90 to-white px-4 py-3.5 hover:bg-slate-50/80 transition-colors sm:px-6"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white shadow-2xs">
                      <Layers size={13} />
                      <span>
                        Week {weekItem.week} • {weekItem.year}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {weekItem.menu.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        weekItem.selection.selectionStatus === 'SUBMITTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {weekItem.selection.selectionStatus ?? 'PENDING'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Week Details Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 sm:p-6">
                    {daysWithSelections.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        No individual meal selections recorded for this scheduled week.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {daysWithSelections.map((day) => {
                          const selection = mealSelections[day];
                          const isUnavailable =
                            selection?.selectionType === 'UNAVAILABLE' ||
                            selection?.mealName === 'Unavailable';
                          const isHoliday =
                            selection?.selectionType === 'HOLIDAY' ||
                            selection?.mealName === 'Holiday';

                          return (
                            <div
                              key={day}
                              className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 shadow-2xs"
                            >
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white shadow-2xs">
                                <img
                                  src={selection?.mealImagePath || MealForeground}
                                  alt={selection?.mealName || 'Meal'}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                  {formatDay(day)}
                                </span>
                                <h4 className="truncate text-xs sm:text-sm font-bold text-slate-900">
                                  {isUnavailable
                                    ? 'Unavailable'
                                    : isHoliday
                                    ? 'Holiday'
                                    : selection?.mealName || 'No selection'}
                                </h4>

                                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                                  {selection?.foodCode && (
                                    <span className="rounded bg-slate-200/70 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                                      {selection.foodCode}
                                    </span>
                                  )}
                                  {selection?.calories && (
                                    <span className="flex items-center gap-0.5 text-amber-700 font-medium">
                                      <Flame size={12} />
                                      <span>{selection.calories} kcal</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}

        {/* Data List: Admin Report History View */}
        {!isQueryLoading &&
          !isQueryError &&
          isAdminOrHr &&
          activeTab === 'admin-report' &&
          adminHistoryData?.data?.map((weekItem) => {
            const isExpanded = expandedWeeks[weekItem.weekMenuScheduleId] ?? true;
            const daysEntries = Object.entries(weekItem.selections).sort(
              ([firstDay], [secondDay]) =>
                DAY_ORDER.indexOf(firstDay) - DAY_ORDER.indexOf(secondDay),
            );

            return (
              <section
                key={weekItem.weekMenuScheduleId}
                className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs transition-all"
              >
                {/* Week Header Bar */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleWeekExpand(weekItem.weekMenuScheduleId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleWeekExpand(weekItem.weekMenuScheduleId);
                    }
                  }}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-slate-50/90 to-white px-4 py-3.5 hover:bg-slate-50/80 transition-colors sm:px-6"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-white shadow-2xs">
                      <Layers size={13} />
                      <span>
                        Week {weekItem.week} • {weekItem.year}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {weekItem.menu.title}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {weekItem.totalResponses} Total Orders
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportWeeklyReportToPdf({
                          report: weekItem.selections,
                          titlePrefix: `Week ${weekItem.week} (${weekItem.year}) Report`,
                        });
                      }}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                      title="Export PDF"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>

                    {isExpanded ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Week Breakdown Table / List */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-slate-100 p-4 sm:p-6">
                    {daysEntries.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        No aggregated meal orders recorded for this scheduled week.
                      </p>
                    ) : (
                      daysEntries.map(([day, data]) => (
                        <div
                          key={day}
                          className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
                        >
                          <div className="mb-2.5 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                              {formatDay(day)}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {data.total} total orders
                            </span>
                          </div>

                          <div className="space-y-2">
                            {data.response.map((dish) => {
                              const dishKey = `${weekItem.weekMenuScheduleId}-${day}-${dish.id}`;
                              const isDishExpanded = Boolean(expandedMealIds[dishKey]);

                              return (
                                <div
                                  key={dish.id}
                                  className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs transition-all"
                                >
                                  {/* Dish Item Row Header */}
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleMealExpand(dishKey)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleMealExpand(dishKey);
                                      }
                                    }}
                                    className="flex cursor-pointer flex-col p-3 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <Utensils size={15} className="text-emerald-700 shrink-0" />
                                      <span className="text-xs font-bold text-slate-900">
                                        {dish.name}
                                      </span>
                                      {dish.foodCode && (
                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                          {dish.foodCode}
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-2 flex items-center justify-between gap-2.5 sm:mt-0">
                                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                          {dish.count} selected
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-500">
                                          ({dish.users.length} {dish.users.length === 1 ? 'user' : 'users'})
                                        </span>
                                      </div>

                                      <div className="flex items-center text-slate-400">
                                        {isDishExpanded ? (
                                          <ChevronUp size={16} />
                                        ) : (
                                          <ChevronDown size={16} />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expanded User Breakdown List */}
                                  {isDishExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
                                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Selected by ({dish.users.length}):
                                      </span>
                                      {dish.users.length === 0 ? (
                                        <p className="text-xs text-slate-400">No users found for this meal.</p>
                                      ) : (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                          {dish.users.map((user, idx) => (
                                            <div
                                              key={`${user.id ?? 'guest'}-${idx}`}
                                              className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 shadow-2xs"
                                            >
                                              <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-primary border border-emerald-100">
                                                  {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="truncate text-xs font-medium text-slate-800" title={user.name}>
                                                  {user.name}
                                                </span>
                                              </div>

                                              {user.quantity > 1 && (
                                                <span className="ml-2 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                                  x{user.quantity}
                                                </span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>
            );
          })}

        {/* Pagination Bar */}
        {!isQueryLoading && !isQueryError && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs">
            <span className="text-xs text-slate-500">
              Page <strong className="text-slate-800">{page}</strong> of{' '}
              <strong className="text-slate-800">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                <ChevronLeft size={15} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar activeTab="history" />
    </main>
  );
}

export default History;
