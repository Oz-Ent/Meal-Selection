import { useState, useMemo } from 'react';
import {
  Ban,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Palmtree,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import Badge from '../../../components/Badge/Badge';
import Button from '../../../components/Button/Button';
import Tabs from '../../../components/Tabs/Tabs';
import InputField from '../../../components/InputField/InputField';
import Checkbox from '../../../components/Checkbox/Checkbox';
import EmptyState from '../../../components/EmptyState/EmptyState';
import NotificationBanner from '../../../components/NotificationBanner/NotificationBanner';

import {
  useCreateHolidayMutation,
  useCreateHolidayOverrideMutation,
  useDeleteHolidayMutation,
  useDeleteHolidayOverrideMutation,
  useHolidaysQuery,
  useUpdateHolidayMutation,
  useWeeklyHolidaysQuery,
} from '../../../api/useApiQueries';
import type { HolidayItem } from '../../../api/Services/HolidayServices';
import { getISOWeekAndYear } from '../../../utils/dateHelpers';

export function MarkHolidays() {
  const currentYear = new Date().getFullYear();
  const currentWeekInfo = useMemo(() => getISOWeekAndYear(), []);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeekInfo.week);
  const [activeTab, setActiveTab] = useState<'all' | 'company' | 'public' | 'week'>('all');
  const [filterScope, setFilterScope] = useState<'upcoming' | 'all'>('upcoming');

  // Modal states
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayItem | null>(null);
  const [adjustingHoliday, setAdjustingHoliday] = useState<HolidayItem | null>(null);
  const [deleteConfirmHoliday, setDeleteConfirmHoliday] = useState<HolidayItem | null>(null);

  // Form states
  const [companyFormData, setCompanyFormData] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0]!,
    endDate: '',
    description: '',
  });

  const [adjustFormData, setAdjustFormData] = useState({
    originalDate: '',
    title: '',
    isIgnored: false,
    adjustedDate: '',
    notes: '',
  });

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  // Queries & Mutations
  const holidaysQuery = useHolidaysQuery(selectedYear);
  const weeklyHolidaysQuery = useWeeklyHolidaysQuery(selectedWeek, selectedYear);

  const createMutation = useCreateHolidayMutation();
  const updateMutation = useUpdateHolidayMutation();
  const deleteMutation = useDeleteHolidayMutation();
  const overrideMutation = useCreateHolidayOverrideMutation();
  const deleteOverrideMutation = useDeleteHolidayOverrideMutation();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  const rawPublicHolidays = useMemo(() => holidaysQuery.data?.publicHolidays ?? [], [holidaysQuery.data]);
  const rawWeeklyHolidays = useMemo(() => weeklyHolidaysQuery.data ?? [], [weeklyHolidaysQuery.data]);

  // Helper to normalize holiday title for deduplication
  const normalizeHolidayTitle = (title: string) =>
    title
      .toLowerCase()
      .replace(/['’`"]/g, '')
      .replace(/\b(ul|el)\b/g, 'al')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Deduplicate public holidays
  const publicHolidays = useMemo(() => {
    const map = new Map<string, HolidayItem>();
    for (const item of rawPublicHolidays) {
      const effectiveDate = item.adjustedDate || item.date;
      const key = `${effectiveDate}|${normalizeHolidayTitle(item.title)}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
    return Array.from(map.values());
  }, [rawPublicHolidays]);

  // Deduplicate weekly holidays
  const weeklyEffectiveHolidays = useMemo(() => {
    const map = new Map<string, HolidayItem>();
    for (const item of rawWeeklyHolidays) {
      const key = `${item.date}|${normalizeHolidayTitle(item.title)}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
    return Array.from(map.values());
  }, [rawWeeklyHolidays]);

  // Group company holidays
  const uniqueCompanyHolidays = useMemo(() => {
    const companyHolidays = holidaysQuery.data?.companyHolidays ?? [];
    const map = new Map<string, HolidayItem>();
    for (const item of companyHolidays) {
      const key = item.id ? `id-${item.id}` : `${item.date}|${normalizeHolidayTitle(item.title)}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
    return Array.from(map.values());
  }, [holidaysQuery.data?.companyHolidays]);

  // Today's ISO date string in local time (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Filter holidays based on toggle scope
  const displayedPublicHolidays = useMemo(() => {
    if (filterScope === 'all') return publicHolidays;
    return publicHolidays.filter((item) => {
      const effectiveDate = item.adjustedDate || item.date;
      return effectiveDate >= todayStr;
    });
  }, [publicHolidays, filterScope, todayStr]);

  const displayedCompanyHolidays = useMemo(() => {
    if (filterScope === 'all') return uniqueCompanyHolidays;
    return uniqueCompanyHolidays.filter((item) => {
      const effectiveEndDate = item.endDate || item.date;
      return effectiveEndDate >= todayStr;
    });
  }, [uniqueCompanyHolidays, filterScope, todayStr]);

  // Company Holiday Modal Handlers
  const openAddCompanyModal = () => {
    setEditingHoliday(null);
    setCompanyFormData({
      title: '',
      startDate: new Date().toISOString().split('T')[0]!,
      endDate: '',
      description: '',
    });
    setIsCompanyModalOpen(true);
  };

  const openEditCompanyModal = (holiday: HolidayItem) => {
    setEditingHoliday(holiday);
    setCompanyFormData({
      title: holiday.title,
      startDate: holiday.date,
      endDate: holiday.endDate || '',
      description: holiday.description || '',
    });
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompanyHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyFormData.title.trim() || !companyFormData.startDate) {
      showToast('error', 'Please provide a title and start date.');
      return;
    }

    try {
      const year = new Date(companyFormData.startDate).getFullYear();
      if (editingHoliday && editingHoliday.id) {
        await updateMutation.mutateAsync({
          id: editingHoliday.id,
          data: {
            title: companyFormData.title.trim(),
            startDate: companyFormData.startDate,
            endDate: companyFormData.endDate ? companyFormData.endDate : null,
            description: companyFormData.description.trim() || undefined,
            year,
            isCompany: true,
          },
        });
        showToast('success', 'Holiday updated successfully.');
      } else {
        await createMutation.mutateAsync({
          title: companyFormData.title.trim(),
          startDate: companyFormData.startDate,
          endDate: companyFormData.endDate ? companyFormData.endDate : null,
          description: companyFormData.description.trim() || undefined,
          year,
          isCompany: true,
        });
        showToast('success', 'Company holiday added successfully.');
      }
      setIsCompanyModalOpen(false);
    } catch {
      showToast('error', 'Failed to save holiday. Please try again.');
    }
  };

  const handleDeleteCompanyHoliday = async () => {
    if (!deleteConfirmHoliday?.id) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirmHoliday.id);
      showToast('success', 'Holiday removed successfully.');
      setDeleteConfirmHoliday(null);
    } catch {
      showToast('error', 'Failed to delete holiday.');
    }
  };

  // Public Holiday Override Handlers
  const handleToggleWorkingDay = async (holiday: HolidayItem) => {
    try {
      const isCurrentlyIgnored = Boolean(holiday.isIgnored);
      await overrideMutation.mutateAsync({
        originalDate: holiday.date,
        title: holiday.title,
        year: selectedYear,
        isIgnored: !isCurrentlyIgnored,
        adjustedDate: holiday.adjustedDate ?? null,
      });

      showToast(
        'success',
        !isCurrentlyIgnored
          ? `Marked "${holiday.title}" as a Working Day. Meal selection is now enabled.`
          : `Re-activated "${holiday.title}" as a Public Holiday.`,
      );
    } catch {
      showToast('error', 'Failed to update holiday override.');
    }
  };

  const openAdjustModal = (holiday: HolidayItem) => {
    setAdjustingHoliday(holiday);
    setAdjustFormData({
      originalDate: holiday.date,
      title: holiday.title,
      isIgnored: Boolean(holiday.isIgnored),
      adjustedDate: holiday.adjustedDate || holiday.date,
      notes: '',
    });
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingHoliday) return;

    try {
      await overrideMutation.mutateAsync({
        originalDate: adjustingHoliday.date,
        title: adjustFormData.title.trim() || adjustingHoliday.title,
        year: selectedYear,
        isIgnored: adjustFormData.isIgnored,
        adjustedDate:
          adjustFormData.adjustedDate !== adjustingHoliday.date
            ? adjustFormData.adjustedDate
            : null,
        notes: adjustFormData.notes.trim() || undefined,
      });

      showToast('success', 'Holiday adjustment applied successfully.');
      setIsAdjustModalOpen(false);
    } catch {
      showToast('error', 'Failed to save holiday adjustment.');
    }
  };

  const handleResetOverride = async (holiday: HolidayItem) => {
    if (!holiday.overrideId) return;
    try {
      await deleteOverrideMutation.mutateAsync(holiday.overrideId);
      showToast('success', `Reset "${holiday.title}" to standard statutory default.`);
    } catch {
      showToast('error', 'Failed to reset holiday override.');
    }
  };

  const isLoading = holidaysQuery.isLoading;
  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    overrideMutation.isPending ||
    deleteOverrideMutation.isPending;

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      <NavBar title="Mark & Override Holidays" backUrl="/admin/activities" />

      {/* Header Controls */}
      <section className="px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          {/* Left Controls: Year selector & Scope Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Year selector pill */}
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-2.5 py-1.5 shadow-2xs">
              <button
                type="button"
                aria-label="Previous Year"
                onClick={() => setSelectedYear((prev) => prev - 1)}
                className="p-1 text-text-secondary hover:text-text-primary rounded transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-text-primary px-1">{selectedYear}</span>
              <button
                type="button"
                aria-label="Next Year"
                onClick={() => setSelectedYear((prev) => prev + 1)}
                className="p-1 text-text-secondary hover:text-text-primary rounded transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Upcoming vs All Year Toggle */}
            <Tabs
              value={filterScope}
              onChange={(val) => setFilterScope(val as 'upcoming' | 'all')}
              className="w-auto"
            >
              <Tabs.Options>
                <Tabs.Option value="upcoming" icon={<Sparkles size={13} />}>
                  Upcoming
                </Tabs.Option>
                <Tabs.Option value="all" icon={<CalendarDays size={13} />}>
                  All {selectedYear}
                </Tabs.Option>
              </Tabs.Options>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<Plus size={16} />}
              label="Mark Company Holiday"
              onClick={openAddCompanyModal}
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="mb-4 max-w-xl">
          <Tabs
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'all' | 'company' | 'public' | 'week')}
          >
            <Tabs.Options>
              <Tabs.Option
                value="all"
                badge={`(${displayedCompanyHolidays.length + displayedPublicHolidays.length})`}
              >
                All
              </Tabs.Option>
              <Tabs.Option
                value="week"
                badge={`(${weeklyEffectiveHolidays.length})`}
              >
                Selection Week
              </Tabs.Option>
              <Tabs.Option
                value="public"
                badge={`(${displayedPublicHolidays.length})`}
              >
                Public
              </Tabs.Option>
              <Tabs.Option
                value="company"
                badge={`(${displayedCompanyHolidays.length})`}
              >
                Company
              </Tabs.Option>
            </Tabs.Options>
          </Tabs>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="px-4 sm:px-6 space-y-5">
        {isLoading && (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3">
            <LoadingSpinner />
            <p className="text-xs text-text-secondary">Synchronizing holiday feeds...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* WEEKLY SELECTION HOLIDAYS TAB */}
            {activeTab === 'week' && (
              <section className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                      <Clock size={14} className="text-secondary" />
                      <span>Meal Selection Week {selectedWeek}, {selectedYear}</span>
                    </h2>
                    <p className="text-[11px] text-text-secondary">
                      View and adjust holidays that take effect during the scheduled meal selection week.
                    </p>
                  </div>

                  {/* Week Navigator */}
                  <div className="flex items-center gap-1 bg-surface border border-border rounded-xl px-2 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
                      className="p-1 text-text-secondary hover:text-text-primary cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="font-bold px-2 text-text-primary">Week {selectedWeek}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedWeek((w) => Math.min(52, w + 1))}
                      className="p-1 text-text-secondary hover:text-text-primary cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {weeklyEffectiveHolidays.length === 0 ? (
                  <EmptyState
                    title="Normal Working Week"
                    description={`No public or company holidays active for Week ${selectedWeek}. All weekdays are open for meal selection.`}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weeklyEffectiveHolidays.map((holiday, idx) => (
                      <div
                        key={`${holiday.date}-${idx}`}
                        className="rounded-3xl border border-warning/30 bg-warning-light/40 p-4 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-text-primary">{holiday.title}</h3>
                            <Badge
                              variant={holiday.source === 'COMPANY' ? 'primary' : 'warning'}
                              size="xs"
                              label={holiday.source === 'COMPANY' ? 'Company Holiday' : 'Public Holiday'}
                            />
                          </div>
                          <p className="text-xs text-warning-dark mt-1 flex items-center gap-1.5 font-medium">
                            <Calendar size={13} className="text-warning" />
                            <span>
                              {holiday.date} ({holiday.dayName})
                            </span>
                          </p>
                          <p className="text-[11px] text-text-secondary mt-1">
                            Selection for this day automatically defaults to Holiday and locks menu meals.
                          </p>
                        </div>

                        {holiday.source !== 'COMPANY' && (
                          <Button
                            variant="outline"
                            size="sm"
                            label="Override to Work Day"
                            onClick={() => handleToggleWorkingDay(holiday)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* PUBLIC & STATUTORY HOLIDAYS SECTION */}
            {(activeTab === 'all' || activeTab === 'public') && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Statutory & Global Public Holidays (Ghana)</span>
                  </h2>
                  <span className="text-[11px] text-text-muted">
                    {displayedPublicHolidays.length} {filterScope === 'upcoming' ? 'upcoming' : 'official'} {displayedPublicHolidays.length === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <NotificationBanner
                  variant="warning"
                  icon={<Sparkles size={18} className="text-warning shrink-0 mt-0.5" />}
                  title="Live API & Google Calendar Synchronized"
                  description="Holidays are fetched real-time from Nager.Date & Google Calendar feeds with statutory weekend roll-over support. You can override any statutory holiday below if your company operates on that day."
                />

                {displayedPublicHolidays.length === 0 ? (
                  <EmptyState
                    title={
                      filterScope === 'upcoming'
                        ? `No Upcoming Public Holidays in ${selectedYear}`
                        : `No Public Holidays Found for ${selectedYear}`
                    }
                    description={
                      filterScope === 'upcoming'
                        ? `All public holidays for ${selectedYear} have passed, or none are scheduled.`
                        : `No official public holidays recorded for ${selectedYear}.`
                    }
                    buttonLabel={filterScope === 'upcoming' && publicHolidays.length > 0 ? `View All ${selectedYear} Holidays (${publicHolidays.length})` : undefined}
                    buttonIcon={<CalendarDays size={13} />}
                    buttonAction={() => setFilterScope('all')}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayedPublicHolidays.map((item, idx) => {
                      const effectiveDate = item.adjustedDate || item.date;
                      const isPast = effectiveDate < todayStr;
                      const isToday = effectiveDate === todayStr;
                      const isIgnored = Boolean(item.isIgnored);
                      const isAdjusted = Boolean(item.adjustedDate && item.adjustedDate !== item.date);

                      return (
                        <div
                          key={`${item.date}-${idx}`}
                          className={`rounded-3xl border p-4 shadow-2xs flex flex-col justify-between gap-3 transition-all ${
                            isIgnored
                              ? 'bg-surface-muted border-border text-text-muted'
                              : 'bg-surface border-border hover:shadow-md hover:border-border-hover'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3
                                  className={`text-sm font-bold ${
                                    isIgnored ? 'line-through text-text-muted' : 'text-text-primary'
                                  }`}
                                >
                                  {item.title}
                                </h3>

                                {isIgnored ? (
                                  <Badge
                                    variant="neutral"
                                    size="xs"
                                    label="Overridden: Working Day"
                                  />
                                ) : isAdjusted ? (
                                  <Badge
                                    variant="info"
                                    size="xs"
                                    label="Adjusted Date"
                                  />
                                ) : (
                                  <Badge
                                    variant="warning"
                                    size="xs"
                                    label="Public Holiday"
                                  />
                                )}

                                {isToday ? (
                                  <Badge variant="success" size="xs" label="Today" />
                                ) : isPast ? (
                                  <Badge variant="neutral" size="xs" label="Past" />
                                ) : (
                                  <Badge variant="success" size="xs" label="Upcoming" />
                                )}
                              </div>

                              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                                <Calendar size={13} className="text-text-muted" />
                                <span>
                                  {item.date} ({item.dayName.toLowerCase()})
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Actions for Public Holiday */}
                          <div className="flex items-center justify-between pt-2 border-t border-border gap-2 flex-wrap">
                            <Button
                              variant={isIgnored ? 'primary' : 'outline'}
                              size="sm"
                              icon={<Ban size={13} />}
                              label={isIgnored ? 'Re-enable Holiday' : 'Mark as Working Day'}
                              onClick={() => handleToggleWorkingDay(item)}
                            />

                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Edit2 size={13} />}
                                label="Adjust"
                                onClick={() => openAdjustModal(item)}
                              />

                              {item.isOverridden && (
                                <button
                                  type="button"
                                  aria-label="Reset Override"
                                  onClick={() => handleResetOverride(item)}
                                  className="p-1.5 text-warning-dark hover:bg-warning-light rounded-lg transition-colors cursor-pointer"
                                  title="Reset to statutory default"
                                >
                                  <RotateCcw size={15} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* COMPANY HOLIDAYS SECTION */}
            {(activeTab === 'all' || activeTab === 'company') && (
              <section className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                    <Palmtree size={14} className="text-primary" />
                    <span>Company-Specific Holidays</span>
                  </h2>
                  <span className="text-[11px] text-text-muted">
                    {displayedCompanyHolidays.length} {filterScope === 'upcoming' ? 'upcoming' : 'configured'}
                  </span>
                </div>

                {displayedCompanyHolidays.length === 0 ? (
                  <EmptyState
                    icon={<Palmtree size={20} />}
                    title={
                      filterScope === 'upcoming'
                        ? `No Upcoming Company Holidays in ${selectedYear}`
                        : `No Custom Company Holidays for ${selectedYear}`
                    }
                    description={
                      filterScope === 'upcoming'
                        ? `No upcoming company closures scheduled for the remainder of ${selectedYear}.`
                        : `No custom company holidays configured for ${selectedYear}.`
                    }
                    buttonLabel="Mark Company Holiday"
                    buttonIcon={<Plus size={13} />}
                    buttonAction={openAddCompanyModal}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayedCompanyHolidays.map((item) => {
                      const effectiveEndDate = item.endDate || item.date;
                      const isPast = effectiveEndDate < todayStr;
                      const isToday = item.date <= todayStr && (item.endDate ? item.endDate >= todayStr : item.date >= todayStr);

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-border bg-surface p-4 shadow-2xs flex items-center justify-between gap-3 hover:shadow-md hover:border-border-hover transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-text-primary">{item.title}</h3>
                              <Badge
                                variant="primary"
                                size="xs"
                                label="Company"
                              />
                              {isToday ? (
                                <Badge variant="success" size="xs" label="Active Today" />
                              ) : isPast ? (
                                <Badge variant="neutral" size="xs" label="Past" />
                              ) : (
                                <Badge variant="success" size="xs" label="Upcoming" />
                              )}
                            </div>
                            <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                              <CalendarDays size={13} className="text-text-muted" />
                              <span>
                                {item.date} {item.endDate ? `to ${item.endDate}` : ''}
                              </span>
                            </p>
                            {item.description && (
                              <p className="text-xs text-text-muted mt-1 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              aria-label="Edit Holiday"
                              onClick={() => openEditCompanyModal(item)}
                              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete Holiday"
                              onClick={() => setDeleteConfirmHoliday(item)}
                              className="p-1.5 text-danger hover:text-danger-dark hover:bg-danger-light rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* CREATE / EDIT COMPANY HOLIDAY MODAL */}
      {isCompanyModalOpen && (
        <Modal
          isOpen={isCompanyModalOpen}
          onClose={() => !isSaving && setIsCompanyModalOpen(false)}
          variant="bottom"
          showCloseButton={!isSaving}
        >
          <form onSubmit={handleSaveCompanyHoliday} className="p-4 pt-6 text-text-primary font-sans w-full flex flex-col">
            <h2 className="text-base font-bold text-text-primary mb-1">
              {editingHoliday ? 'Edit Company Holiday' : 'Mark Company Holiday'}
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Schedule a special company closure or team day off. Meal selections automatically lock for this date.
            </p>

            <div className="space-y-3">
              <InputField
                label="Holiday Title *"
                required
                value={companyFormData.title}
                onChange={(e) => setCompanyFormData({ ...companyFormData, title: e.target.value })}
                placeholder="e.g., Company Retreat / End of Year Break"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <InputField
                  label="Start Date *"
                  type="date"
                  required
                  value={companyFormData.startDate}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, startDate: e.target.value })}
                />

                <InputField
                  label="End Date (Optional)"
                  type="date"
                  value={companyFormData.endDate}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, endDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
                <textarea
                  rows={2}
                  value={companyFormData.description}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                  placeholder="Optional details or note for employees..."
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <Button
                type="submit"
                variant="primary"
                pending={isSaving}
                className="w-full"
                label={editingHoliday ? 'Save Changes' : 'Confirm Holiday'}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* ADJUST / OVERRIDE PUBLIC HOLIDAY MODAL */}
      {isAdjustModalOpen && adjustingHoliday && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => !isSaving && setIsAdjustModalOpen(false)}
          variant="bottom"
          showCloseButton={!isSaving}
        >
          <form onSubmit={handleSaveAdjustment} className="p-4 pt-6 text-text-primary font-sans w-full flex flex-col">
            <h2 className="text-base font-bold text-text-primary mb-1">
              Adjust Statutory Holiday
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Shift observed date or customize company status for <span className="font-bold text-text-primary">"{adjustingHoliday.title}"</span>.
            </p>

            <div className="space-y-3">
              <InputField
                label="Holiday Display Title"
                value={adjustFormData.title}
                onChange={(e) => setAdjustFormData({ ...adjustFormData, title: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <InputField
                  label="Original Date"
                  disabled
                  value={adjustingHoliday.date}
                  onChange={() => {}}
                />

                <InputField
                  label="Adjusted Observed Date"
                  type="date"
                  value={adjustFormData.adjustedDate}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, adjustedDate: e.target.value })}
                />
              </div>

              {/* Working day toggle */}
              <div className="rounded-xl bg-surface-muted border border-border p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-text-primary">Treat as Normal Working Day</p>
                  <p className="text-[11px] text-text-secondary">Allow employees to order meals on this day</p>
                </div>
                <Checkbox
                  variant="toggle"
                  checked={adjustFormData.isIgnored}
                  onChange={(checked) => setAdjustFormData({ ...adjustFormData, isIgnored: checked })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Adjustment Reason / Notes</label>
                <textarea
                  rows={2}
                  value={adjustFormData.notes}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, notes: e.target.value })}
                  placeholder="e.g. Government Executive Instrument observance shift"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <Button
                type="submit"
                variant="primary"
                pending={isSaving}
                className="w-full"
                label="Save Adjustment"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmHoliday && (
        <Modal
          isOpen={Boolean(deleteConfirmHoliday)}
          onClose={() => setDeleteConfirmHoliday(null)}
          variant="center"
        >
          <div className="p-3 text-center font-sans">
            <h3 className="text-base font-bold text-text-primary mb-2">Delete Holiday</h3>
            <p className="text-xs text-text-secondary mb-5 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-text-primary">"{deleteConfirmHoliday.title}"</span>? Menu selections for this day will revert to normal operation.
            </p>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                label="Cancel"
                onClick={() => setDeleteConfirmHoliday(null)}
              />
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDeleteCompanyHoliday}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-danger text-white hover:bg-danger-hover shadow-xs cursor-pointer"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* TOAST NOTIFICATION */}
      <BottomToast
        isOpen={toastState.isOpen}
        type={toastState.type}
        message={toastState.message}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
      />
    </div>
  );
}

export default MarkHolidays;
