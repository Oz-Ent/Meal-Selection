import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  RefreshCw,
  Search,
  Unlock,
  UserCheck,
  UserX,
  Users,
  Utensils,
} from 'lucide-react';

import { NavBar } from '../../../components/NavBar/NavBar';
import Modal from '../../../components/Modal/Modal';
import { BottomToast, type ToastType } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import {
  useSubmitWeeklySelectionsMutation,
  useUpdateWeekScheduleMutation,
  useUsersQuery,
  useWeeklyNoSelectionsQuery,
  useWeekScheduleQuery,
} from '../../../api/useApiQueries';
import { formatWeekDateRange, getDateFromISOWeek, getISOWeekAndYear } from '../../../utils/dateHelpers';
import { formatPendingUsersForClipboard } from '../../../utils/pendingUsersHelpers';
import { Card } from '../../../components/Card/Card';
import NavigationArrows from '../../../components/NavigationArrows/NavigationArrows';

export function SelectionStatus() {
  const navigate = useNavigate();
  const currentWeekInfo = useMemo(() => getISOWeekAndYear(), []);

  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeekInfo.week);
  const [selectedYear, setSelectedYear] = useState<number>(currentWeekInfo.year);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [targetStatusToSet, setTargetStatusToSet] = useState<'ACTIVE' | 'CLOSED'>('CLOSED');
  const [isCopied, setIsCopied] = useState(false);

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
  const allUsersQuery = useUsersQuery();

  // Mutations
  const updateScheduleMutation = useUpdateWeekScheduleMutation();
  const submitWeeklyMutation = useSubmitWeeklySelectionsMutation();

  const currentSchedule = weekScheduleQuery.data ?? null;
  const isScheduleActive = currentSchedule?.status === 'ACTIVE';
  const rawPendingUsers = useMemo(() => noSelectionsQuery.data ?? [], [noSelectionsQuery.data]);
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

  // Statistics
  const totalUsersCount = allActiveUsers.length || rawPendingUsers.length;
  const pendingCount = rawPendingUsers.length;
  const submittedCount = Math.max(0, totalUsersCount - pendingCount);
  const completionPercentage =
    totalUsersCount > 0 ? Math.round((submittedCount / totalUsersCount) * 100) : 0;

  // Handlers for week navigation
  const handlePrevWeek = () => {
    if (selectedWeek === 1) {
      setSelectedWeek(52);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedWeek((prev) => prev - 1);
    }
  };

  const handleNextWeek = () => {
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
    navigate(`/select-meal?forSomeone=true&userIds=${selectedUserIds.join(',')}`);
  };

  // Copy user names list to clipboard (copies currently visible/filtered list)
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

  const isUpdating = updateScheduleMutation.isPending || submitWeeklyMutation.isPending;
  const isLoading = weekScheduleQuery.isLoading || noSelectionsQuery.isLoading;

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
        <div className='flex flex-col items-center justify-center p-4 gap-5'>
            <div className='flex flex-row'>
            {currentSchedule &&
            <>
              <div className="flex items-center gap-1.5 uppercase text-sm font-semibold text-slate-700">
                <span className="truncate max-w-[160px] sm:max-w-[200px]" title={currentSchedule.menu.title}>
                  {currentSchedule.menu.title}
                </span>
              </div>
            
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isScheduleActive
                    ? 'text-primary'
                    : 'text-rose-800'
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
            }
            </div>

          <NavigationArrows
            ariaSectionName="week"
            prevDisabled={false}
            nextDisabled={false}
            onNextClick={handleNextWeek}
            onPrevClick={handlePrevWeek}
            centerContent={
              <div className='flex flex-col items-center px-12'>
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

        {/* Pending Users Section */}
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
                  <span>{isAllSelected ? 'Deselect All' : `Select All (${filteredPendingUsers.length})`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyNames}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-secondary hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Copy size={14} className={isCopied ? 'text-primary' : 'text-slate-500'} />
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

          {/* Users List Card / Container - Scrollable internally */}
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
                            navigate(`/select-meal?forSomeone=true&userId=${user.id}`)
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

        {/* Batch Selection Action Floating Bar */}
        {selectedUserIds.length > 0 && (
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
      </div>

      {/* Confirmation Modal for Selection Window Toggle */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        variant="center"
        showCloseButton
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5 text-slate-600 text-xs sm:text-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              {targetStatusToSet === 'CLOSED'
                ? 'Close Selection for this Week?'
                : 'Reopen Selection for this Week?'}
            </h3>
          </div>

          <div
            className={`flex items-start gap-3 rounded-xl p-3.5 ${
              targetStatusToSet === 'CLOSED'
                ? 'bg-rose-50 border border-rose-100 text-rose-900'
                : 'bg-primary-light border border-primary/20 text-primary'
            }`}
          >
            {targetStatusToSet === 'CLOSED' ? (
              <Lock size={20} className="shrink-0 text-rose-600 mt-0.5" />
            ) : (
              <Unlock size={20} className="shrink-0 text-primary mt-0.5" />
            )}
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold">
                {targetStatusToSet === 'CLOSED'
                  ? `Closing Week ${selectedWeek} Selection`
                  : `Reopening Week ${selectedWeek} Selection`}
              </span>
              <span>
                {targetStatusToSet === 'CLOSED'
                  ? 'Once closed, regular users will no longer be able to make or modify meal selections for this week.'
                  : 'Reopening will allow hub members to submit or update their meal choices for this week.'}
              </span>
            </div>
          </div>

          <p>
            Scheduled Menu:{' '}
            <strong className="text-slate-900">{currentSchedule?.menu.title}</strong> (
            {formatWeekDateRange(selectedWeek, selectedYear)})
          </p>

          {targetStatusToSet === 'CLOSED' && rawPendingUsers.length > 0 && (
            <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs">
              ⚠️ Note: <strong>{rawPendingUsers.length} users</strong> have not submitted selections yet.
            </p>
          )}

          <div className="mt-2 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isUpdating}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs sm:text-sm font-semibold text-secondary hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmStatusChange}
              disabled={isUpdating}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer shadow-2xs ${
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

      {/* Toast Feedback */}
      <BottomToast
        isOpen={toastState.isOpen}
        type={toastState.type}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </main>
  );
}
