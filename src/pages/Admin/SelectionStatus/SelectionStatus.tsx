import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  ExternalLink,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unlock,
  UserCheck,
  UserX,
  Users,
  Utensils,
  X,
} from 'lucide-react';

import { NavBar } from '../../../components/NavBar/NavBar';
import Modal from '../../../components/Modal/Modal';
import { BottomToast, type ToastType } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import {
  useBulkDeleteGuestSelectionsMutation,
  useDeleteGuestSelectionMutation,
  useSubmitWeeklySelectionsMutation,
  useUpdateWeekScheduleMutation,
  useUsersQuery,
  useWeeklyGuestSelectionsQuery,
  useWeeklyNoSelectionsQuery,
  useWeeklyWithSelectionsQuery,
  useWeekScheduleQuery,
} from '../../../api/useApiQueries';
import { formatWeekDateRange, getDateFromISOWeek, getISOWeekAndYear } from '../../../utils/dateHelpers';
import { formatPendingUsersForClipboard } from '../../../utils/pendingUsersHelpers';
import { Card } from '../../../components/Card/Card';
import NavigationArrows from '../../../components/NavigationArrows/NavigationArrows';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import type { User } from '../../../api/Services/UserServices';
import type { WeeklyGuestSelectionItem } from '../../../api/Services/MealSelectionServices';
import { DeleteGuestSelectionModal } from './DeleteGuestSelectionModal';
import { ViewUserSelectionsModal } from './ViewUserSelectionsModal';

type ActiveStatusTab = 'pending' | 'submitted' | 'guests';

export function SelectionStatus() {
  const navigate = useNavigate();
  const currentWeekInfo = useMemo(() => getISOWeekAndYear(), []);

  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeekInfo.week);
  const [selectedYear, setSelectedYear] = useState<number>(currentWeekInfo.year);
  const [activeTab, setActiveTab] = useState<ActiveStatusTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedGuestIds, setSelectedGuestIds] = useState<number[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBulkGuestDeleteModalOpen, setIsBulkGuestDeleteModalOpen] = useState(false);
  const [targetStatusToSet, setTargetStatusToSet] = useState<'ACTIVE' | 'CLOSED'>('CLOSED');
  const [isCopied, setIsCopied] = useState(false);

  // Modals for guest selection deletion and user selection viewing
  const [deletingGuestItem, setDeletingGuestItem] = useState<WeeklyGuestSelectionItem | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const showToast = (type: ToastType, message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  // Queries
  const weekScheduleQuery = useWeekScheduleQuery(selectedWeek, selectedYear);
  const targetDateString = useMemo(() => {
    return getDateFromISOWeek(selectedWeek, selectedYear).toISOString();
  }, [selectedWeek, selectedYear]);

  const noSelectionsQuery = useWeeklyNoSelectionsQuery(targetDateString);
  const withSelectionsQuery = useWeeklyWithSelectionsQuery(targetDateString);
  const guestSelectionsQuery = useWeeklyGuestSelectionsQuery(targetDateString);
  const allUsersQuery = useUsersQuery();

  // Mutations
  const updateScheduleMutation = useUpdateWeekScheduleMutation();
  const submitWeeklyMutation = useSubmitWeeklySelectionsMutation();
  const deleteGuestMutation = useDeleteGuestSelectionMutation();
  const bulkDeleteGuestMutation = useBulkDeleteGuestSelectionsMutation();

  const currentSchedule = weekScheduleQuery.data ?? null;
  const hasSchedule = Boolean(currentSchedule);
  const isScheduleActive = currentSchedule?.status === 'ACTIVE';
  const rawPendingUsers = useMemo(() => noSelectionsQuery.data ?? [], [noSelectionsQuery.data]);
  const rawSubmittedUsers = useMemo(
    () => (hasSchedule ? withSelectionsQuery.data ?? [] : []),
    [hasSchedule, withSelectionsQuery.data],
  );
  const rawGuestSelections = useMemo(() => guestSelectionsQuery.data ?? [], [guestSelectionsQuery.data]);

  const allActiveUsers = useMemo(
    () => (allUsersQuery.data ?? []).filter((u) => u.status === 'ACTIVE' || !u.status),
    [allUsersQuery.data],
  );

  // Filter pending users based on search
  const filteredPendingUsers = useMemo(() => {
    if (!searchQuery.trim()) return rawPendingUsers;
    const q = searchQuery.toLowerCase().trim();
    return rawPendingUsers.filter(
      (user) =>
        (user.name || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q),
    );
  }, [rawPendingUsers, searchQuery]);

  // Filter submitted users based on search
  const filteredSubmittedUsers = useMemo(() => {
    if (!searchQuery.trim()) return rawSubmittedUsers;
    const q = searchQuery.toLowerCase().trim();
    return rawSubmittedUsers.filter(
      (user) =>
        (user.name || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q),
    );
  }, [rawSubmittedUsers, searchQuery]);

  // Filter guest selections based on search
  const filteredGuestSelections = useMemo(() => {
    if (!searchQuery.trim()) return rawGuestSelections;
    const q = searchQuery.toLowerCase().trim();
    return rawGuestSelections.filter((item) => {
      const mealName = item.dayMeal?.meal?.name || item.selectionType || '';
      const dayName = item.menuDay?.day || '';
      const createdBy = item.createdByUser?.name || '';
      return (
        mealName.toLowerCase().includes(q) ||
        dayName.toLowerCase().includes(q) ||
        createdBy.toLowerCase().includes(q)
      );
    });
  }, [rawGuestSelections, searchQuery]);

  // Statistics
  const totalUsersCount = allActiveUsers.length || (rawPendingUsers.length + rawSubmittedUsers.length);
  const pendingCount = hasSchedule ? rawPendingUsers.length : 0;
  const submittedCount = hasSchedule ? rawSubmittedUsers.length : 0;
  const completionPercentage =
    hasSchedule && totalUsersCount > 0 ? Math.round((submittedCount / totalUsersCount) * 100) : 0;

  const totalGuestMealsCount = useMemo(
    () => rawGuestSelections.reduce((sum, g) => sum + (g.guestCount || 1), 0),
    [rawGuestSelections],
  );

  // Handlers for week navigation
  const handlePrevWeek = () => {
    setSelectedUserIds([]);
    setSelectedGuestIds([]);
    if (selectedWeek === 1) {
      setSelectedWeek(52);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedWeek((prev) => prev - 1);
    }
  };

  const handleNextWeek = () => {
    setSelectedUserIds([]);
    setSelectedGuestIds([]);
    if (selectedWeek === 52) {
      setSelectedWeek(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedWeek((prev) => prev + 1);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      weekScheduleQuery.refetch(),
      noSelectionsQuery.refetch(),
      withSelectionsQuery.refetch(),
      guestSelectionsQuery.refetch(),
      allUsersQuery.refetch(),
    ]);
    showToast('success', 'Selection status refreshed');
  };

  // Open confirmation modal for toggle
  const handleToggleClick = () => {
    if (!currentSchedule) {
      showToast('error', 'Cannot toggle status: No menu is scheduled for this week.');
      return;
    }
    const nextStatus = isScheduleActive ? 'CLOSED' : 'ACTIVE';
    setTargetStatusToSet(nextStatus);
    setIsConfirmModalOpen(true);
  };

  // Confirm status change
  const handleConfirmStatusChange = async () => {
    if (!currentSchedule) return;
    try {
      await updateScheduleMutation.mutateAsync({
        id: currentSchedule.id,
        data: { status: targetStatusToSet },
      });

      if (targetStatusToSet === 'CLOSED') {
        try {
          await submitWeeklyMutation.mutateAsync({
            weekNumber: selectedWeek,
            year: selectedYear,
            status: 'SUBMITTED',
          });
        } catch {
          // Non-blocking submission update
        }
      }

      setIsConfirmModalOpen(false);
      showToast(
        'success',
        targetStatusToSet === 'CLOSED'
          ? `Meal selection for Week ${selectedWeek} has been CLOSED.`
          : `Meal selection for Week ${selectedWeek} is now OPEN.`,
      );
      void weekScheduleQuery.refetch();
      void noSelectionsQuery.refetch();
      void withSelectionsQuery.refetch();
      void guestSelectionsQuery.refetch();
    } catch {
      showToast('error', 'Failed to update selection status. Please try again.');
    }
  };

  // Selection handlers
  const handleToggleSelectUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const isAllSelected =
    filteredPendingUsers.length > 0 &&
    filteredPendingUsers.every((u) => selectedUserIds.includes(u.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const visibleIds = new Set(filteredPendingUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const visibleIds = filteredPendingUsers.map((u) => u.id);
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
  };

  const handleBatchSelectMeals = () => {
    if (selectedUserIds.length === 0) return;
    navigate(
      `/select-meal?forSomeone=true&userIds=${selectedUserIds.join(',')}&week=${selectedWeek}&year=${selectedYear}`,
    );
  };

  // Copy user names list to clipboard
  const handleCopyNames = async () => {
    if (!filteredPendingUsers.length) return;
    const formattedText = formatPendingUsersForClipboard(filteredPendingUsers);
    if (!formattedText) return;
    try {
      await navigator.clipboard.writeText(formattedText);
      setIsCopied(true);
      showToast(
        'success',
        `Copied ${filteredPendingUsers.length} user name${filteredPendingUsers.length === 1 ? '' : 's'} to clipboard!`,
      );
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showToast('error', 'Failed to copy names to clipboard.');
    }
  };

  // Guest selection state and handlers
  const isGuestFetching = guestSelectionsQuery.isFetching && !guestSelectionsQuery.isLoading;
  const isGuestActionDisabled =
    deleteGuestMutation.isPending ||
    bulkDeleteGuestMutation.isPending ||
    guestSelectionsQuery.isFetching;

  const singlePortionGuestItems = useMemo(
    () => filteredGuestSelections.filter((item) => item.guestCount === 1),
    [filteredGuestSelections],
  );

  const isAllGuestSelected =
    singlePortionGuestItems.length > 0 &&
    singlePortionGuestItems.every((item) => selectedGuestIds.includes(item.id));

  const handleToggleSelectGuest = (id: number) => {
    setSelectedGuestIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAllGuest = () => {
    if (isAllGuestSelected) {
      const visibleSinglePortionIds = new Set(singlePortionGuestItems.map((item) => item.id));
      setSelectedGuestIds((prev) => prev.filter((id) => !visibleSinglePortionIds.has(id)));
    } else {
      const visibleSinglePortionIds = singlePortionGuestItems.map((item) => item.id);
      setSelectedGuestIds((prev) => Array.from(new Set([...prev, ...visibleSinglePortionIds])));
    }
  };

  const handleClearGuestSelection = () => {
    setSelectedGuestIds([]);
  };

  const handleConfirmBulkDeleteGuest = async () => {
    if (selectedGuestIds.length === 0) return;
    try {
      const countToDelete = selectedGuestIds.length;
      const result = await bulkDeleteGuestMutation.mutateAsync(selectedGuestIds);
      setSelectedGuestIds([]);
      setIsBulkGuestDeleteModalOpen(false);
      showToast('success', result.message || `Deleted ${countToDelete} guest selection(s).`);
      void guestSelectionsQuery.refetch();
    } catch {
      showToast('error', 'Failed to delete selected guest meals. Please try again.');
    }
  };

  // Guest selection deletion handling - opens modal for confirmation/portion selection
  const handleGuestDeleteClick = (item: WeeklyGuestSelectionItem) => {
    setDeletingGuestItem(item);
  };

  const handleConfirmDeleteGuestModal = async (
    item: WeeklyGuestSelectionItem,
    count: number,
  ) => {
    try {
      const result = await deleteGuestMutation.mutateAsync({ id: item.id, count });
      setDeletingGuestItem(null);
      showToast('success', result.message || 'Guest selection updated.');
      void guestSelectionsQuery.refetch();
    } catch {
      showToast('error', 'Failed to delete guest selection. Please try again.');
    }
  };

  const isUpdating = updateScheduleMutation.isPending || submitWeeklyMutation.isPending;
  const isLoading =
    weekScheduleQuery.isLoading ||
    noSelectionsQuery.isLoading ||
    withSelectionsQuery.isLoading ||
    guestSelectionsQuery.isLoading;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-28 text-text-primary font-sans">
      {/* Top Navigation */}
      <NavBar
        title="Selection Status"
        backUrl="/admin/activities"
        rightElement={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 p-1 text-secondary hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Refresh Status"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-5">
        {/* Week Selector Bar */}
        <Card>
          <div className="flex flex-col items-center justify-center p-4 gap-5">
            <div className="flex flex-row">
              {currentSchedule && (
                <>
                  <div className="flex items-center gap-1.5 uppercase text-sm font-semibold text-slate-700">
                    <span
                      className="truncate max-w-[160px] sm:max-w-[200px]"
                      title={currentSchedule.menu.title}
                    >
                      {currentSchedule.menu.title}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isScheduleActive ? 'text-primary' : 'text-rose-800'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isScheduleActive ? 'bg-primary animate-pulse' : 'bg-rose-600'
                      }`}
                    />
                    {isScheduleActive ? 'OPEN' : 'CLOSED'}
                  </span>
                </>
              )}
            </div>

            <NavigationArrows
              ariaSectionName="week"
              prevDisabled={false}
              nextDisabled={false}
              onNextClick={handleNextWeek}
              onPrevClick={handlePrevWeek}
              centerContent={
                <div className="flex flex-col items-center px-12">
                  <h2 className="text-3xl sm:text-3xl font-bold text-slate-900">
                    Week {selectedWeek}
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    {formatWeekDateRange(selectedWeek, selectedYear)}
                  </span>
                </div>
              }
            />

            <div className="flex items-center justify-end">
              {currentSchedule ? (
                <button
                  type="button"
                  onClick={handleToggleClick}
                  disabled={isUpdating || isLoading}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50 ${
                    isScheduleActive
                      ? 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-2 focus:ring-rose-300'
                      : 'bg-primary text-white hover:bg-primary-hover focus:ring-2 focus:ring-primary/40'
                  }`}
                >
                  {isScheduleActive ? (
                    <>
                      <Lock size={16} />
                      <span>Close Selection</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={16} />
                      <span>Reopen Selection</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/admin/menu')}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <Utensils size={16} />
                  <span>Schedule Menu</span>
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Progress & Summary Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Pending Count */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Users
              </p>
              <h4 className="mt-1 text-2xl font-bold text-slate-900">
                {isLoading ? '...' : pendingCount}
              </h4>
              <span className="text-[11px] text-slate-400">Yet to submit choices</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <UserX size={20} />
            </div>
          </div>

          {/* Card 2: Submitted Count */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Submitted
              </p>
              <h4 className="mt-1 text-2xl font-bold text-slate-900">
                {isLoading ? '...' : submittedCount}
              </h4>
              <span className="text-[11px] text-slate-400">Completed selections</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <UserCheck size={20} />
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Completion Rate
              </p>
              <span className="text-xs font-bold text-primary">
                {isLoading ? '...' : `${completionPercentage}%`}
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="mt-1 text-[11px] text-slate-400">
              {submittedCount} of {totalUsersCount} active members
            </span>
          </div>
        </section>

        {/* Status Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pending');
              setSearchQuery('');
              setSelectedUserIds([]);
              setSelectedGuestIds([]);
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserX size={15} />
            <span>Pending Users</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                activeTab === 'pending'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {rawPendingUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('submitted');
              setSearchQuery('');
              setSelectedUserIds([]);
              setSelectedGuestIds([]);
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'submitted'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserCheck size={15} />
            <span>Submitted</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                activeTab === 'submitted'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {rawSubmittedUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('guests');
              setSearchQuery('');
              setSelectedUserIds([]);
              setSelectedGuestIds([]);
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'guests'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users size={15} />
            <span>Guest Meals</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                activeTab === 'guests'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalGuestMealsCount}
            </span>
          </button>
        </div>

        {/* Tab 1: Pending Users Section */}
        {activeTab === 'pending' && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Users Without Selections ({filteredPendingUsers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Users who haven't completed their meal selection for Week {selectedWeek}.
                </p>
              </div>

              {filteredPendingUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
                      isAllSelected
                        ? 'border-primary bg-primary-light text-primary font-bold'
                        : 'border-slate-200 bg-white text-secondary hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        isAllSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isAllSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span>
                      {isAllSelected
                        ? 'Deselect All'
                        : `Select All (${filteredPendingUsers.length})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyNames}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-secondary hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Copy
                      size={14}
                      className={isCopied ? 'text-primary' : 'text-slate-500'}
                    />
                    <span>{isCopied ? 'Copied!' : 'Copy Names'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Search Box */}
            {rawPendingUsers.length > 0 && (
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pending users by name or email..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>
            )}

            {/* Users List Container */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-2xs overflow-hidden flex flex-col">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <LoadingSpinner />
                  <p className="mt-3 text-xs sm:text-sm">Fetching pending selections...</p>
                </div>
              ) : !currentSchedule ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-3">
                    <Calendar size={26} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    No Menu Scheduled for Week {selectedWeek}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    There is currently no active menu schedule for this week. Please schedule a menu first.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/menu')}
                    className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer shadow-2xs"
                  >
                    Schedule a Menu
                  </button>
                </div>
              ) : rawPendingUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary mb-3">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    All Selections Submitted! 🎉
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    Everyone has completed their meal selection for Week {selectedWeek}, {selectedYear}.
                  </p>
                </div>
              ) : filteredPendingUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Search size={24} className="text-slate-400 mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">No users found</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    No pending users match "{searchQuery}".
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                  {filteredPendingUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    const initials = user.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={user.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 transition-colors ${
                          isSelected ? 'bg-primary-light/40 hover:bg-primary-light/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectUser(user.id)}
                            aria-label={`Select ${user.name}`}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-slate-300 bg-white hover:border-primary text-transparent'
                            }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-xs sm:text-sm">
                            {initials || <Users size={16} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {user.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/select-meal?forSomeone=true&userId=${user.id}&week=${selectedWeek}&year=${selectedYear}`,
                              )
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-slate-50 hover:text-text-primary transition-colors cursor-pointer shadow-2xs"
                          >
                            <Utensils size={13} className="text-primary" />
                            <span>Select for User</span>
                            <ExternalLink size={11} className="text-slate-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 2: Submitted Users Section */}
        {activeTab === 'submitted' && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Users With Submitted Choices ({filteredSubmittedUsers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Active users who have submitted their meal choices for Week {selectedWeek}.
                </p>
              </div>
            </div>

            {/* Search Box */}
            {rawSubmittedUsers.length > 0 && (
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search submitted users by name or email..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white shadow-2xs overflow-hidden flex flex-col">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <LoadingSpinner />
                  <p className="mt-3 text-xs sm:text-sm">Fetching submitted users...</p>
                </div>
              ) : !currentSchedule ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                  <Calendar size={26} className="text-amber-500 mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">No active menu schedule</h4>
                  <p className="mt-1 text-xs text-slate-500">Please schedule a menu first.</p>
                </div>
              ) : rawSubmittedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                  <UserX size={26} className="text-slate-400 mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">No submissions yet</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    No users have completed their meal selection for Week {selectedWeek} yet.
                  </p>
                </div>
              ) : filteredSubmittedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Search size={24} className="text-slate-400 mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">No users found</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    No submitted users match "{searchQuery}".
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                  {filteredSubmittedUsers.map((user) => {
                    const initials = user.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={user.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-xs sm:text-sm">
                            {initials || <Users size={16} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {user.name}
                            </h4>
                            <span className="text-xs text-slate-400 truncate block">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setViewingUser(user)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Eye size={13} className="text-primary" />
                            <span>View Selections</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/select-meal?forSomeone=true&userId=${user.id}&week=${selectedWeek}&year=${selectedYear}`,
                              )
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            <Utensils size={13} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 3: Guest Selections Section */}
        {activeTab === 'guests' && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Guest Meal Selections ({totalGuestMealsCount} portions)
                </h3>
                <p className="text-xs text-slate-500">
                  All guest meals scheduled for Week {selectedWeek}. Click ✕ to remove or decrement portions.
                </p>
              </div>

              {currentSchedule && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/select-meal?isGuest=true&week=${selectedWeek}&year=${selectedYear}`,
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>Add Guest Selection</span>
                </button>
              )}
            </div>

            {/* Search Box */}
            {rawGuestSelections.length > 0 && (
              <div className="relative w-full">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guest meals by day, dish or requester..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-white shadow-2xs overflow-hidden flex flex-col relative">
              {/* Progress Indicator for Background Refetching / Mutations */}
              {(isGuestFetching || deleteGuestMutation.isPending || bulkDeleteGuestMutation.isPending) && (
                <div
                  data-testid="guest-fetching-indicator"
                  className="flex items-center justify-center gap-2 bg-primary-light/80 border-b border-primary/20 py-2 px-3 text-xs font-semibold text-primary animate-pulse"
                >
                  <Loader2 size={13} className="animate-spin text-primary shrink-0" />
                  <span>Updating guest selections...</span>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <LoadingSpinner />
                  <p className="mt-3 text-xs sm:text-sm">Fetching guest selections...</p>
                </div>
              ) : !currentSchedule ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                  <Calendar size={26} className="text-amber-500 mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">No active menu schedule</h4>
                  <p className="mt-1 text-xs text-slate-500">Please schedule a menu first.</p>
                </div>
              ) : rawGuestSelections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                  <Users size={28} className="text-slate-400 mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">No guest selections yet</h4>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    No guest meals have been selected for Week {selectedWeek}.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/select-meal?isGuest=true&week=${selectedWeek}&year=${selectedYear}`,
                      )
                    }
                    className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover transition-colors cursor-pointer shadow-2xs"
                  >
                    Add Guest Selection
                  </button>
                </div>
              ) : filteredGuestSelections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Search size={24} className="text-slate-400 mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">No guest selections found</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    No guest selections match "{searchQuery}".
                  </p>
                </div>
              ) : (
                <>
                  {/* Guest List Header with Select All (1-portion items) */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3.5 sm:px-4 py-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2.5">
                      {singlePortionGuestItems.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleToggleSelectAllGuest}
                          disabled={isGuestActionDisabled}
                          className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer disabled:opacity-50"
                        >
                          <div
                            className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                              isAllGuestSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-slate-300 bg-white hover:border-slate-400'
                            }`}
                          >
                            {isAllGuestSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span>Select all 1-portion ({singlePortionGuestItems.length})</span>
                        </button>
                      ) : (
                        <span className="text-slate-500">Guest Meals List</span>
                      )}
                    </div>
                    <span className="text-slate-400 font-normal">
                      {filteredGuestSelections.length} item{filteredGuestSelections.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                    {filteredGuestSelections.map((item) => {
                      const dayName = item.menuDay?.day || 'Day';
                      const mealName =
                        item.selectionType === 'MEAL'
                          ? item.dayMeal?.meal?.name || 'Selected Dish'
                          : item.selectionType === 'HOLIDAY'
                          ? 'Holiday'
                          : 'Unavailable';

                      const imagePath =
                        item.dayMeal?.meal?.imagePath || FALLBACK_MEAL_IMAGE_URL;

                      const createdByName = item.createdByUser?.name;
                      const isSelected = selectedGuestIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors ${
                            isGuestActionDisabled ? 'opacity-70 pointer-events-none' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {item.guestCount === 1 ? (
                              <button
                                type="button"
                                onClick={() => handleToggleSelectGuest(item.id)}
                                disabled={isGuestActionDisabled}
                                className="cursor-pointer shrink-0"
                                aria-label={`Select guest meal ${mealName}`}
                              >
                                <div
                                  className={`flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded border transition-colors ${
                                    isSelected
                                      ? 'border-primary bg-primary text-white'
                                      : 'border-slate-300 bg-white hover:border-slate-400'
                                  }`}
                                >
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                              </button>
                            ) : (
                              <div className="w-4 sm:w-5 shrink-0" />
                            )}

                            <span className="w-12 sm:w-14 text-xs font-bold text-slate-700 uppercase shrink-0">
                              {dayName.slice(0, 3)}
                            </span>

                            {item.selectionType === 'MEAL' && (
                              <img
                                src={imagePath}
                                alt={mealName}
                                className="h-10 w-10 shrink-0 rounded-lg object-cover bg-slate-100"
                              />
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {mealName}
                                </h4>
                                <span className="rounded-full bg-secondary text-white text-[11px] font-bold px-2 py-0.5">
                                  {item.guestCount} {item.guestCount === 1 ? 'portion' : 'portions'}
                                </span>
                              </div>
                              {createdByName && (
                                <span className="text-xs text-slate-400 block truncate">
                                  Requested by: {createdByName}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleGuestDeleteClick(item)}
                              disabled={isGuestActionDisabled}
                              aria-label={`Delete guest selection for ${mealName}`}
                              title={
                                item.guestCount > 1
                                  ? 'Choose portions to remove'
                                  : 'Delete this guest selection'
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-40"
                            >
                              <X size={15} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Batch Selection Action Floating Bar (Pending tab only) */}
        {activeTab === 'pending' && selectedUserIds.length > 0 && (
          <div className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl rounded-2xl border border-primary/20 bg-slate-900/95 text-white p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                {selectedUserIds.length}
              </span>
              <span>
                user{selectedUserIds.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleBatchSelectMeals}
                className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors cursor-pointer"
              >
                <Utensils size={14} />
                <span>Select Meals</span>
              </button>
            </div>
          </div>
        )}

        {/* Batch Guest Delete Action Floating Bar (Guests tab only) */}
        {activeTab === 'guests' && selectedGuestIds.length > 0 && (
          <div className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl rounded-2xl border border-rose-500/20 bg-slate-900/95 text-white p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white text-xs font-bold">
                {selectedGuestIds.length}
              </span>
              <span>
                guest meal{selectedGuestIds.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearGuestSelection}
                disabled={isGuestActionDisabled}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsBulkGuestDeleteModalOpen(true)}
                disabled={isGuestActionDisabled}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {bulkDeleteGuestMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span>Delete Selected ({selectedGuestIds.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Bulk Guest Delete */}
      <Modal
        isOpen={isBulkGuestDeleteModalOpen}
        onClose={() => !bulkDeleteGuestMutation.isPending && setIsBulkGuestDeleteModalOpen(false)}
        variant="center"
        showCloseButton={!bulkDeleteGuestMutation.isPending}
      >
        <div className="p-4 sm:p-6 text-slate-900 font-sans flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Trash2 size={24} />
          </div>
          <h3 className="mb-2 text-base sm:text-lg font-bold text-slate-900">
            Delete {selectedGuestIds.length} Guest Selection{selectedGuestIds.length === 1 ? '' : 's'}?
          </h3>
          <p className="mb-6 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
            Are you sure you want to delete {selectedGuestIds.length} selected guest meal{selectedGuestIds.length === 1 ? '' : 's'} for Week {selectedWeek}? This action cannot be undone.
          </p>
          <div className="flex w-full gap-2.5">
            <button
              type="button"
              disabled={bulkDeleteGuestMutation.isPending}
              onClick={() => setIsBulkGuestDeleteModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={bulkDeleteGuestMutation.isPending}
              onClick={handleConfirmBulkDeleteGuest}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {bulkDeleteGuestMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Confirm Delete</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Selection Window Toggle */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        variant="center"
        showCloseButton
      >
        <div className="p-4 sm:p-6 text-msTextPrimary flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
              targetStatusToSet === 'CLOSED'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-primary-light text-primary'
            }`}
          >
            {targetStatusToSet === 'CLOSED' ? <Lock size={26} /> : <Unlock size={26} />}
          </div>

          <h2 className="mb-2 text-base sm:text-lg font-bold text-slate-900">
            {targetStatusToSet === 'CLOSED'
              ? `Close Selection for Week ${selectedWeek}?`
              : `Reopen Selection for Week ${selectedWeek}?`}
          </h2>

          <p className="mb-6 text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
            {targetStatusToSet === 'CLOSED'
              ? `Closing the selection window will lock meal choices. ${pendingCount} active user(s) have not submitted selections yet.`
              : `Reopening the selection window will allow active users to make or update meal choices for Week ${selectedWeek}.`}
          </p>

          <div className="flex w-full gap-2.5">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isUpdating}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmStatusChange}
              disabled={isUpdating}
              className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50 ${
                targetStatusToSet === 'CLOSED'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-primary hover:bg-primary-hover'
              }`}
            >
              {isUpdating
                ? 'Updating...'
                : targetStatusToSet === 'CLOSED'
                ? 'Yes, Close Selection'
                : 'Yes, Reopen Selection'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Guest Selection Modal for Multi-portion entries */}
      <DeleteGuestSelectionModal
        isOpen={Boolean(deletingGuestItem)}
        onClose={() => setDeletingGuestItem(null)}
        guestItem={deletingGuestItem}
        onConfirm={handleConfirmDeleteGuestModal}
        isDeleting={deleteGuestMutation.isPending}
      />

      {/* View User Selections Modal */}
      <ViewUserSelectionsModal
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
        targetDateString={targetDateString}
        selectedWeek={selectedWeek}
        selectedYear={selectedYear}
      />

      {/* Bottom Toast Notifications */}
      <BottomToast
        isOpen={toastState.isOpen}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
        type={toastState.type}
        message={toastState.message}
      />
    </main>
  );
}
