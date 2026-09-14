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
import MealForeground from '../../assets/MealForeground.webp';
import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { EmptyPage } from '../../components/EmptyPage/EmptyPage';
import Tabs from '../../components/Tabs/Tabs';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import { useAuth } from '../Auth/useAuth/useAuth';
import {
  useUserWeeklyHistoryQuery,
  useWeeklyHistoryQuery,
} from '../../api/useApiQueries';
import type { WeeklyHistoryFilterParams } from '../../api/Services/MealSelectionServices';
import { DAY_ORDER, formatDay, exportWeeklyReportToPdf } from '../../utils/exportMealReportPdf';
import { formatWeekDateRange, formatDayDate } from '../../utils/dateHelpers';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import { isAdminRole } from '../../utils/Enums/Role';

export function History() {
  const { profile } = useAuth();
  const isAdminOrHr = isAdminRole(profile?.user);

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

  // Expanded weeks state
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});

  // Expanded meal details state in admin view
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

  const handleQuickRange = (weeksLimit: number) => {
    setStartYear('');
    setStartWeek('');
    setEndYear('');
    setEndWeek('');
    setLimit(weeksLimit);
    setOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    startYear || startWeek || endYear || endWeek || order !== 'desc' || limit !== 20,
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-32 text-text-primary font-sans">
      {/* Header */}
      <TitleBar
        extraActions={
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              hasActiveFilters || isFilterOpen
                ? 'border-primary bg-primary-light text-primary font-bold'
                : 'border-border bg-surface text-text-secondary hover:bg-surface-muted'
            }`}
            aria-label="Toggle filter panel"
          >
            <Filter size={15} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="flex h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        }
      />

      {/* Main Content Area */}
      <div className="flex flex-col gap-5 px-4 pt-5 sm:px-6">
        {/* Title & Description */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
            Selection History
          </h1>
          <p className="text-xs text-text-secondary sm:text-sm">
            Browse through past weekly menus, view meal selections, and review dietary choices across week ranges and years.
          </p>
        </div>

        {/* Tab Switcher for Admin/HR */}
        {isAdminOrHr && (
          <Tabs
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val as 'my-history' | 'admin-report');
              setPage(1);
            }}
          >
            <Tabs.Options>
              <Tabs.Option value="my-history" icon={<User size={16} />}>
                My Selection History
              </Tabs.Option>
              <Tabs.Option value="admin-report" icon={<Users size={16} />}>
                Admin Report History
              </Tabs.Option>
            </Tabs.Options>
          </Tabs>
        )}

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs transition-all sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <Calendar size={16} className="text-primary" />
                <span>Week & Year Range Filters</span>
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-text-muted hover:bg-danger-light hover:text-danger transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>

            {/* Quick Filter Presets */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary mr-1">Quick ranges:</span>
              <button
                type="button"
                onClick={() => handleQuickRange(4)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  limit === 4 && !startYear && !endYear
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-muted text-text-secondary hover:bg-surface'
                }`}
              >
                Last 4 Weeks
              </button>
              <button
                type="button"
                onClick={() => handleQuickRange(12)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  limit === 12 && !startYear && !endYear
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-muted text-text-secondary hover:bg-surface'
                }`}
              >
                Last 12 Weeks
              </button>
              <button
                type="button"
                onClick={() => handleQuickRange(20)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  limit === 20 && !startYear && !endYear
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-muted text-text-secondary hover:bg-surface'
                }`}
              >
                Last 20 Weeks (Default)
              </button>
            </div>

            {/* Range Inputs Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="history-from-year" className="mb-1.5 block text-xs font-semibold text-text-secondary">
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
                  className="h-10 w-full rounded-xl border border-border bg-surface-muted px-3.5 text-xs font-medium text-text-primary placeholder:text-text-muted transition-all hover:bg-surface hover:border-border-hover focus:bg-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="history-from-week" className="mb-1.5 block text-xs font-semibold text-text-secondary">
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
                  className="h-10 w-full rounded-xl border border-border bg-surface-muted px-3.5 text-xs font-medium text-text-primary placeholder:text-text-muted transition-all hover:bg-surface hover:border-border-hover focus:bg-surface focus:border-primary focus:outline-none"
                />
                {startWeek && Number(startWeek) >= 1 && Number(startWeek) <= 53 && (
                  <span className="mt-1 block text-[11px] font-semibold text-primary">
                    {formatWeekDateRange(Number(startWeek), Number(startYear) || new Date().getFullYear())}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="history-to-year" className="mb-1.5 block text-xs font-semibold text-text-secondary">
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
                  className="h-10 w-full rounded-xl border border-border bg-surface-muted px-3.5 text-xs font-medium text-text-primary placeholder:text-text-muted transition-all hover:bg-surface hover:border-border-hover focus:bg-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="history-to-week" className="mb-1.5 block text-xs font-semibold text-text-secondary">
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
                  className="h-10 w-full rounded-xl border border-border bg-surface-muted px-3.5 text-xs font-medium text-text-primary placeholder:text-text-muted transition-all hover:bg-surface hover:border-border-hover focus:bg-surface focus:border-primary focus:outline-none"
                />
                {endWeek && Number(endWeek) >= 1 && Number(endWeek) <= 53 && (
                  <span className="mt-1 block text-[11px] font-semibold text-primary">
                    {formatWeekDateRange(Number(endWeek), Number(endYear) || new Date().getFullYear())}
                  </span>
                )}
              </div>
            </div>

            {/* Secondary Controls: Limit and Order */}
            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">Sort:</span>
                  <div className="relative">
                    <select
                      id="history-sort-order"
                      value={order}
                      onChange={(e) => {
                        setOrder(e.target.value as 'asc' | 'desc');
                        setPage(1);
                      }}
                      className="h-9 cursor-pointer appearance-none rounded-xl border border-border bg-surface py-1.5 pl-3 pr-8 text-xs font-semibold text-text-primary shadow-2xs transition-all hover:border-border-hover focus:border-primary focus:outline-none"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary whitespace-nowrap">Per page:</span>
                  <div className="relative">
                    <select
                      id="history-per-page-limit"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="h-9 cursor-pointer appearance-none rounded-xl border border-border bg-surface py-1.5 pl-3 pr-8 text-xs font-semibold text-text-primary shadow-2xs transition-all hover:border-border-hover focus:border-primary focus:outline-none"
                    >
                      <option value={10}>10 weeks</option>
                      <option value={20}>20 weeks (Default)</option>
                      <option value={50}>50 weeks</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  </div>
                </div>
              </div>

              <div className="flex items-center self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary border border-border">
                  Total matching: <strong className="font-bold text-text-primary">{totalWeeks}</strong> {totalWeeks === 1 ? 'week' : 'weeks'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isQueryLoading && (
          <div className="py-16 flex flex-col items-center gap-2 text-text-secondary">
            <LoadingSpinner />
            <p className="text-xs">Loading history...</p>
          </div>
        )}

        {/* Error Alert */}
        {isQueryError && (
          <div className="rounded-2xl border border-danger/30 bg-danger-light p-4 text-center text-sm font-medium text-danger">
            Unable to load meal selection history. Please check your connection and try again.
          </div>
        )}

        {/* Empty State */}
        {!isQueryLoading && !isQueryError && totalWeeks === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <EmptyPage removeAdd={true} item="meal selection history records" />
            {hasActiveFilters && (
              <Button
                variant="primary"
                className="mt-4"
                label="Clear Filters"
                onClick={handleResetFilters}
              />
            )}
          </div>
        )}

        {/* Data List: User History View */}
        {!isQueryLoading &&
          !isQueryError &&
          (activeTab === 'my-history' || !isAdminOrHr) &&
          userHistoryData?.data
            ?.filter((weekItem) => weekItem.selection?.createdById != null)
            .map((weekItem) => {
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
                  className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xs transition-all"
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
                    className="flex cursor-pointer items-center justify-between bg-surface-muted/50 px-4 py-3.5 hover:bg-surface-muted transition-colors sm:px-6"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white shadow-2xs">
                        <Layers size={13} />
                        <span>
                          Week {weekItem.week} • {weekItem.menu.title}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-secondary shadow-2xs">
                        <Calendar size={12} className="text-primary" />
                        <span>{formatWeekDateRange(weekItem.week, weekItem.year)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={weekItem.selection.selectionStatus === 'SUBMITTED' ? 'success' : 'warning'}
                        size="xs"
                        label={weekItem.selection.selectionStatus ?? 'PENDING'}
                      />
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-text-muted" />
                      ) : (
                        <ChevronDown size={18} className="text-text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Week Details Body */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 sm:p-6">
                      {daysWithSelections.length === 0 ? (
                        <p className="py-4 text-center text-xs text-text-muted">
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
                                className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface-muted/40 p-3 shadow-2xs"
                              >
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface border border-border/50 shadow-2xs">
                                  <img
                                    src={selection?.mealImagePath || MealForeground}
                                    alt={selection?.mealName || 'Meal'}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
                                      {formatDay(day)}
                                    </span>
                                    <span className="text-[10px] font-medium text-text-secondary bg-surface px-1.5 py-0.2 rounded border border-border/50">
                                      {formatDayDate(weekItem.week, weekItem.year, day)}
                                    </span>
                                  </div>
                                  <h4 className="truncate text-xs sm:text-sm font-bold text-text-primary">
                                    {isUnavailable
                                      ? 'Unavailable'
                                      : isHoliday
                                      ? 'Holiday'
                                      : selection?.mealName || 'No selection'}
                                  </h4>

                                  <div className="mt-1 flex items-center gap-2 text-[11px] text-text-secondary">
                                    {selection?.calories && (
                                      <span className="flex items-center gap-0.5 text-warning-dark font-medium">
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
                className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xs transition-all"
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
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 bg-surface-muted/50 px-4 py-3.5 hover:bg-surface-muted transition-colors sm:px-6"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-white shadow-2xs">
                      <Layers size={13} />
                      <span>
                        Week {weekItem.week} • {weekItem.year}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-secondary shadow-2xs">
                      <Calendar size={12} className="text-primary" />
                      <span>{formatWeekDateRange(weekItem.week, weekItem.year)}</span>
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                      {weekItem.menu.title}
                    </span>
                    <Badge variant="neutral" size="xs" label={`${weekItem.totalResponses} Total Orders`} />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportWeeklyReportToPdf({
                          report: weekItem.selections,
                          titlePrefix: `Week ${weekItem.week} (${formatWeekDateRange(weekItem.week, weekItem.year)}) Report`,
                        });
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-text-secondary shadow-2xs hover:bg-surface-muted cursor-pointer"
                      title="Export PDF"
                    >
                      <Download size={13} />
                      <span>PDF</span>
                    </button>

                    {isExpanded ? (
                      <ChevronUp size={18} className="text-text-muted" />
                    ) : (
                      <ChevronDown size={18} className="text-text-muted" />
                    )}
                  </div>
                </div>

                {/* Week Breakdown Table / List */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-border p-4 sm:p-6">
                    {daysEntries.length === 0 ? (
                      <p className="py-4 text-center text-xs text-text-muted">
                        No aggregated meal orders recorded for this scheduled week.
                      </p>
                    ) : (
                      daysEntries.map(([day, data]) => (
                        <div
                          key={day}
                          className="rounded-2xl border border-border bg-surface-muted/30 p-4"
                        >
                          <div className="mb-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                                {formatDay(day)}
                              </span>
                              <span className="rounded-md bg-surface border border-border px-2 py-0.5 text-[11px] font-semibold text-text-secondary shadow-2xs">
                                {formatDayDate(weekItem.week, weekItem.year, day)}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-text-secondary">
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
                                  className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs transition-all"
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
                                    className="flex cursor-pointer flex-col p-3 transition-colors hover:bg-surface-muted sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <Utensils size={15} className="text-primary shrink-0" />
                                      <span className="text-xs font-bold text-text-primary">
                                        {dish.name}
                                      </span>
                                      {dish.foodCode && (
                                        <Badge variant="neutral" size="xs" label={dish.foodCode} />
                                      )}
                                    </div>

                                    <div className="mt-2 flex items-center justify-between gap-2.5 sm:mt-0">
                                      <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                        <Badge variant="success" size="xs" label={`${dish.count} selected`} />
                                        <span className="text-[11px] font-medium text-text-muted">
                                          ({dish.users.length} {dish.users.length === 1 ? 'user' : 'users'})
                                        </span>
                                      </div>

                                      <div className="flex items-center text-text-muted">
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
                                    <div className="border-t border-border bg-surface-muted/50 px-4 py-3">
                                      <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                                        Selected by / for ({dish.users.length}):
                                      </span>
                                      {dish.users.length === 0 ? (
                                        <p className="text-xs text-text-muted">No users found for this meal.</p>
                                      ) : (
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                          {dish.users.map((user, idx) => {
                                            const displayName = user.createdForName || (user.isGuest ? 'Guest Selection' : user.name);
                                            const showCreatedBy = user.createdByName && user.createdByName !== user.createdForName;

                                            return (
                                              <div
                                                key={`${user.id ?? 'guest'}-${idx}`}
                                                className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-1.5 shadow-2xs"
                                              >
                                                <div className="flex flex-col min-w-0 flex-1">
                                                  <div className="flex items-center gap-2 min-w-0">
                                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-primary border border-primary/20">
                                                      {displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="truncate text-xs font-medium text-text-primary" title={displayName}>
                                                      {displayName}
                                                    </span>
                                                  </div>
                                                  {showCreatedBy && (
                                                    <span className="text-[10px] text-text-muted ml-8 truncate -mt-0.5" title={`Selected by ${user.createdByName}`}>
                                                      by {user.createdByName}
                                                    </span>
                                                  )}
                                                </div>

                                                {user.quantity > 1 && (
                                                  <span className="ml-2 shrink-0 rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-text-secondary border border-border">
                                                    x{user.quantity}
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })}
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
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 shadow-xs">
            <span className="text-xs text-text-secondary">
              Page <strong className="text-text-primary">{page}</strong> of{' '}
              <strong className="text-text-primary">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                icon={<ChevronLeft size={15} />}
                label="Previous"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              />

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                label="Next"
                icon={<ChevronRight size={15} />}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              />
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
