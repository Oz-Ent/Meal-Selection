import { useState, useMemo } from 'react';
import {
  Ban,
  Calendar,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Loader2,
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
  const [companyFormData, setCompanyFormData] = useState<{
    title: string;
    startDate: string;
    endDate: string;
    description: string;
  }>({
    title: '',
    startDate: new Date().toISOString().split('T')[0]!,
    endDate: '',
    description: '',
  });

  const [adjustFormData, setAdjustFormData] = useState<{
    originalDate: string;
    title: string;
    isIgnored: boolean;
    adjustedDate: string;
    notes: string;
  }>({
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

  const rawPublicHolidays = holidaysQuery.data?.publicHolidays ?? [];
  const rawWeeklyHolidays = weeklyHolidaysQuery.data ?? [];

  // Helper to normalize holiday title for deduplication
  const normalizeHolidayTitle = (title: string) =>
    title
      .toLowerCase()
      .replace(/['’`"]/g, '')
      .replace(/\b(ul|el)\b/g, 'al')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  // Deduplicate public holidays: remove holidays with same name on same date, keep ones with different names
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

  // Deduplicate weekly holidays: remove holidays with same name on same date
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

  // Group company holidays by unique id or date + normalized title to avoid multi-day duplicate cards in list view
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

  // Filter holidays based on toggle scope (Upcoming vs All Year)
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
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <button
                type="button"
                aria-label="Previous Year"
                onClick={() => setSelectedYear((prev) => prev - 1)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-800 px-1">{selectedYear}</span>
              <button
                type="button"
                aria-label="Next Year"
                onClick={() => setSelectedYear((prev) => prev + 1)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Upcoming vs All Year Toggle */}
            <div
              role="group"
              aria-label="Filter holidays by date range"
              className="flex items-center bg-slate-100/90 border border-slate-200/80 p-0.5 rounded-xl shadow-2xs text-xs font-medium text-slate-600"
            >
              <button
                type="button"
                aria-pressed={filterScope === 'upcoming'}
                onClick={() => setFilterScope('upcoming')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterScope === 'upcoming'
                    ? 'bg-white font-bold text-primary shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles size={13} className={filterScope === 'upcoming' ? 'text-primary' : 'text-slate-400'} />
                <span>Upcoming</span>
              </button>
              <button
                type="button"
                aria-pressed={filterScope === 'all'}
                onClick={() => setFilterScope('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterScope === 'all'
                    ? 'bg-white font-bold text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays size={13} className={filterScope === 'all' ? 'text-slate-700' : 'text-slate-400'} />
                <span>All {selectedYear}</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddCompanyModal}
              className="flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-secondary-hover active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Mark Company Holiday</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600 mb-4 max-w-xl">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white font-bold text-slate-900 shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            All ({displayedCompanyHolidays.length + displayedPublicHolidays.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('week')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'week'
                ? 'bg-white font-bold text-secondary shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Selection Week ({weeklyEffectiveHolidays.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'public'
                ? 'bg-white font-bold text-slate-900 shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Public ({displayedPublicHolidays.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'company'
                ? 'bg-white font-bold text-slate-900 shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Company ({displayedCompanyHolidays.length})
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="px-4 sm:px-6 space-y-5">
        {isLoading && (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3">
            <LoadingSpinner />
            <p className="text-xs text-slate-500">Synchronizing holiday feeds...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {/* WEEKLY SELECTION HOLIDAYS INSPECTION & ADJUSTMENT TAB */}
            {activeTab === 'week' && (
              <section className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Clock size={14} className="text-secondary" />
                      <span>Meal Selection Week {selectedWeek}, {selectedYear}</span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      View and adjust holidays that take effect during the scheduled meal selection week.
                    </p>
                  </div>

                  {/* Week Navigator */}
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="font-bold px-2">Week {selectedWeek}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedWeek((w) => Math.min(52, w + 1))}
                      className="p-1 text-slate-500 hover:text-slate-900"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {weeklyEffectiveHolidays.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <Check size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Normal Working Week</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      No public or company holidays active for Week {selectedWeek}. All weekdays are open for meal selection.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weeklyEffectiveHolidays.map((holiday, idx) => (
                      <div
                        key={`${holiday.date}-${idx}`}
                        className="rounded-3xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-2xs flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-amber-950">{holiday.title}</h3>
                            <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                              {holiday.source === 'COMPANY' ? 'Company Holiday' : 'Public Holiday'}
                            </span>
                          </div>
                          <p className="text-xs text-amber-800 mt-1 flex items-center gap-1.5 font-medium">
                            <Calendar size={13} className="text-amber-700" />
                            <span>
                              {holiday.date} ({holiday.dayName})
                            </span>
                          </p>
                          <p className="text-[11px] text-amber-700 mt-1">
                            Selection for this day automatically defaults to Holiday and locks menu meals.
                          </p>
                        </div>

                        {holiday.source !== 'COMPANY' && (
                          <button
                            type="button"
                            onClick={() => handleToggleWorkingDay(holiday)}
                            className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 shadow-2xs transition-all cursor-pointer"
                          >
                            Override to Work Day
                          </button>
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Statutory & Global Public Holidays (Ghana)</span>
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    {displayedPublicHolidays.length} {filterScope === 'upcoming' ? 'upcoming' : 'official'} {displayedPublicHolidays.length === 1 ? 'day' : 'days'}
                  </span>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Live API & Google Calendar Synchronized</p>
                    <p className="text-slate-600 mt-0.5 text-[11px]">
                      Holidays are fetched real-time from Nager.Date & Google Calendar feeds with statutory weekend roll-over support. You can override any statutory holiday below if your company operates on that day.
                    </p>
                  </div>
                </div>

                {displayedPublicHolidays.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                      <Sparkles size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {filterScope === 'upcoming'
                        ? `No Upcoming Public Holidays in ${selectedYear}`
                        : `No Public Holidays Found for ${selectedYear}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {filterScope === 'upcoming'
                        ? `All public holidays for ${selectedYear} have passed, or none are scheduled.`
                        : `No official public holidays recorded for ${selectedYear}.`}
                    </p>
                    {filterScope === 'upcoming' && publicHolidays.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterScope('all')}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
                      >
                        <CalendarDays size={13} />
                        <span>View All {selectedYear} Holidays ({publicHolidays.length})</span>
                      </button>
                    )}
                  </div>
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
                              ? 'bg-slate-50/80 border-slate-200 text-slate-500'
                              : 'bg-white border-slate-100 hover:shadow-md hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3
                                  className={`text-sm font-bold ${
                                    isIgnored ? 'line-through text-slate-500' : 'text-slate-900'
                                  }`}
                                >
                                  {item.title}
                                </h3>

                                {isIgnored ? (
                                  <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                    Overridden: Working Day
                                  </span>
                                ) : isAdjusted ? (
                                  <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                                    Adjusted Date
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                                    Public Holiday
                                  </span>
                                )}

                                {isToday ? (
                                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    Today
                                  </span>
                                ) : isPast ? (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                    Past
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    Upcoming
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-400" />
                                <span>
                                  {item.date} ({item.dayName.toLowerCase()})
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Actions for Public Holiday */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleToggleWorkingDay(item)}
                              className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                                isIgnored
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <Ban size={13} />
                              <span>{isIgnored ? 'Re-enable Holiday' : 'Mark as Working Day'}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openAdjustModal(item)}
                                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 size={13} />
                                <span>Adjust</span>
                              </button>

                              {item.isOverridden && (
                                <button
                                  type="button"
                                  aria-label="Reset Override"
                                  onClick={() => handleResetOverride(item)}
                                  className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
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
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Palmtree size={14} className="text-primary" />
                    <span>Company-Specific Holidays</span>
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    {displayedCompanyHolidays.length} {filterScope === 'upcoming' ? 'upcoming' : 'configured'}
                  </span>
                </div>

                {displayedCompanyHolidays.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                      <Palmtree size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {filterScope === 'upcoming'
                        ? `No Upcoming Company Holidays in ${selectedYear}`
                        : `No Custom Company Holidays for ${selectedYear}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {filterScope === 'upcoming'
                        ? `No upcoming company closures scheduled for the remainder of ${selectedYear}.`
                        : `No custom company holidays configured for ${selectedYear}.`}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                      {filterScope === 'upcoming' && uniqueCompanyHolidays.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterScope('all')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
                        >
                          <CalendarDays size={13} />
                          <span>View All ({uniqueCompanyHolidays.length})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={openAddCompanyModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-xs font-semibold text-white hover:bg-primary-hover transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus size={13} />
                        <span>Mark Company Holiday</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {displayedCompanyHolidays.map((item) => {
                      const effectiveEndDate = item.endDate || item.date;
                      const isPast = effectiveEndDate < todayStr;
                      const isToday = item.date <= todayStr && (item.endDate ? item.endDate >= todayStr : item.date >= todayStr);

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-slate-100 bg-white p-4 shadow-2xs flex items-center justify-between gap-3 hover:shadow-md hover:border-slate-200 transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                              <span className="rounded-md bg-primary-light px-2 py-0.5 text-[10px] font-bold text-primary">
                                Company
                              </span>
                              {isToday ? (
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  Active Today
                                </span>
                              ) : isPast ? (
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  Past
                                </span>
                              ) : (
                                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Upcoming
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <CalendarDays size={13} className="text-slate-400" />
                              <span>
                                {item.date} {item.endDate ? `to ${item.endDate}` : ''}
                              </span>
                            </p>
                            {item.description && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              aria-label="Edit Holiday"
                              onClick={() => openEditCompanyModal(item)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete Holiday"
                              onClick={() => setDeleteConfirmHoliday(item)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
          <form onSubmit={handleSaveCompanyHoliday} className="p-4 pt-6 text-slate-900 font-sans w-full flex flex-col">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              {editingHoliday ? 'Edit Company Holiday' : 'Mark Company Holiday'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Schedule a special company closure or team day off. Meal selections automatically lock for this date.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Title *</label>
                <input
                  type="text"
                  required
                  value={companyFormData.title}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, title: e.target.value })}
                  placeholder="e.g., Company Retreat / End of Year Break"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={companyFormData.startDate}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={companyFormData.endDate}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={companyFormData.description}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                  placeholder="Optional details or note for employees..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              <span>{editingHoliday ? 'Save Changes' : 'Confirm Holiday'}</span>
            </button>
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
          <form onSubmit={handleSaveAdjustment} className="p-4 pt-6 text-slate-900 font-sans w-full flex flex-col">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Adjust Statutory Holiday
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Shift observed date or customize company status for <span className="font-bold text-slate-800">"{adjustingHoliday.title}"</span>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Display Title</label>
                <input
                  type="text"
                  value={adjustFormData.title}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Original Date</label>
                  <input
                    type="text"
                    disabled
                    value={adjustingHoliday.date}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adjusted Observed Date</label>
                  <input
                    type="date"
                    value={adjustFormData.adjustedDate}
                    onChange={(e) => setAdjustFormData({ ...adjustFormData, adjustedDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Working day toggle */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Treat as Normal Working Day</p>
                  <p className="text-[11px] text-slate-500">Allow employees to order meals on this day</p>
                </div>
                <input
                  type="checkbox"
                  checked={adjustFormData.isIgnored}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, isIgnored: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Reason / Notes</label>
                <textarea
                  rows={2}
                  value={adjustFormData.notes}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, notes: e.target.value })}
                  placeholder="e.g. Government Executive Instrument observance shift"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              <span>Save Adjustment</span>
            </button>
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
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete Holiday</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-800">"{deleteConfirmHoliday.title}"</span>? Menu selections for this day will revert to normal operation.
            </p>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => setDeleteConfirmHoliday(null)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDeleteCompanyHoliday}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-xs cursor-pointer"
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
