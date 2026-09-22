import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Loader2,
  Lock,
  Pencil,
  Plus,
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
import Button from '../../../components/Button/Button';
import Badge from '../../../components/Badge/Badge';
import EmptyState from '../../../components/EmptyState/EmptyState';
import SearchBar from '../../../components/SearchBar/SearchBar';
import { Card } from '../../../components/Card/Card';
import StatCard from '../../../components/StatCard/StatCard';
import NavigationArrows from '../../../components/NavigationArrows/NavigationArrows';

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
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import type { User } from '../../../api/Services/UserServices';
import type { WeeklyGuestSelectionItem, UserWithoutWeeklySelections } from '../../../api/Services/MealSelectionServices';
import { DeleteGuestSelectionModal } from './DeleteGuestSelectionModal';
import { ViewUserSelectionsModal } from './ViewUserSelectionsModal';
import Tabs from '../../../components/Tabs/Tabs';
import Checkbox from '../../../components/Checkbox/Checkbox';

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

  const currentSchedule = weekScheduleQuery.data;
  const isScheduleActive = currentSchedule?.status === 'ACTIVE';
  const hasSchedule = Boolean(currentSchedule);

  // Filter only ACTIVE users from all users list
  const allActiveUsers = useMemo<User[]>(() => {
    return allUsersQuery.data ?? [];
  }, [allUsersQuery.data]);

  // Derive users lists based on active user filtering
  const rawPendingUsers = useMemo<UserWithoutWeeklySelections[]>(() => {
    if (!hasSchedule) return [];
    return noSelectionsQuery.data ?? [];
  }, [hasSchedule, noSelectionsQuery.data]);

  const rawSubmittedUsers = useMemo<User[]>(() => {
    if (!hasSchedule) return [];
    return withSelectionsQuery.data ?? [];
  }, [hasSchedule, withSelectionsQuery.data]);

  const rawGuestSelections = useMemo<WeeklyGuestSelectionItem[]>(() => {
    return guestSelectionsQuery.data ?? [];
  }, [guestSelectionsQuery.data]);

  // Search filtering
  const filteredPendingUsers = useMemo<UserWithoutWeeklySelections[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rawPendingUsers;
    return rawPendingUsers.filter(
      (u: UserWithoutWeeklySelections) =>
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)),
    );
  }, [rawPendingUsers, searchQuery]);

  const filteredSubmittedUsers = useMemo<User[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rawSubmittedUsers;
    return rawSubmittedUsers.filter(
      (u: User) =>
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)),
    );
  }, [rawSubmittedUsers, searchQuery]);

  const filteredGuestSelections = useMemo<WeeklyGuestSelectionItem[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rawGuestSelections;
    return rawGuestSelections.filter((g: WeeklyGuestSelectionItem) => {
      const day = g.menuDay?.day || '';
      const dish = g.dayMeal?.meal?.name || '';
      const createdBy = g.createdByUser?.name || '';
      return (
        day.toLowerCase().includes(q) ||
        dish.toLowerCase().includes(q) ||
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

  const isRefreshing =
    weekScheduleQuery.isFetching ||
    noSelectionsQuery.isFetching ||
    withSelectionsQuery.isFetching ||
    guestSelectionsQuery.isFetching ||
    allUsersQuery.isFetching;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-28 text-text-primary font-sans">
      {/* Top Navigation */}
      <NavBar
        title="Selection Status"
        backUrl="/admin/activities"
        onRefreshClick={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-5">
        {/* Week Selector Bar */}
        <Card>
          <div className="flex flex-col items-center justify-center p-4 gap-5">
            <div className="flex flex-row items-center gap-2">
              {currentSchedule && (
                <>
                  <div className="flex items-center gap-1.5 uppercase text-sm font-semibold text-text-primary">
                    <span
                      className="truncate max-w-[160px] sm:max-w-[200px]"
                      title={currentSchedule.menu.title}
                    >
                      {currentSchedule.menu.title}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      isScheduleActive ? 'text-primary' : 'text-danger'
                    }`}
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      {isScheduleActive && (
                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                      )}
                      <span
                        className={`relative inline-flex h-2 w-2 rounded-full ${
                          isScheduleActive ? 'bg-primary animate-pulse' : 'bg-danger'
                        }`}
                      />
                    </span>
                    <span>{isScheduleActive ? 'OPEN' : 'CLOSED'}</span>
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
                <div className="flex flex-col items-center px-8">
                  <h2 className="text-3xl sm:text-3xl font-bold text-text-primary text-center">
                    Week {selectedWeek}
                  </h2>
                  <span className="text-xs text-text-secondary font-medium">
                    {formatWeekDateRange(selectedWeek, selectedYear)}
                  </span>
                </div>
              }
            />

            <div className="flex items-center justify-end">
              {currentSchedule ? (
                <Button
                  variant={isScheduleActive ? 'danger' : 'primary'}
                  icon={isScheduleActive ? <Lock size={16} /> : <Unlock size={16} />}
                  label={isScheduleActive ? 'Close Selection' : 'Reopen Selection'}
                  disabled={isUpdating || isLoading}
                  pending={isUpdating}
                  onClick={handleToggleClick}
                />
              ) : (
                <Button
                  variant="primary"
                  icon={<Utensils size={16} />}
                  label="Schedule Menu"
                  onClick={() => navigate('/admin/menu')}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Progress & Summary Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            title="Pending Users"
            value={isLoading ? '...' : pendingCount}
            subtitle="Yet to submit choices"
            icon={<UserX size={20} />}
            iconVariant="warning"
          />

          <StatCard
            title="Submitted"
            value={isLoading ? '...' : submittedCount}
            subtitle="Completed selections"
            icon={<UserCheck size={20} />}
            iconVariant="primary"
          />

          <StatCard
            title="Completion Rate"
            headerRight={
              <span className="text-xs font-bold text-primary">
                {isLoading ? '...' : `${completionPercentage}%`}
              </span>
            }
            progress={completionPercentage}
            subtitle={`${submittedCount} of ${totalUsersCount} active members`}
          />
        </section>

        {/* Status Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(val) => {
            setActiveTab(val as ActiveStatusTab);
            setSearchQuery('');
            setSelectedUserIds([]);
            setSelectedGuestIds([]);
          }}
        >
          <Tabs.Options>
            <Tabs.Option
              value="pending"
              icon={<UserX size={13} />}
              count={rawPendingUsers.length}
            >
              Pending
            </Tabs.Option>
            <Tabs.Option
              value="submitted"
              icon={<UserCheck size={13} />}
              count={rawSubmittedUsers.length}
            >
              Submitted
            </Tabs.Option>
            <Tabs.Option
              value="guests"
              icon={<Users size={13} />}
              count={totalGuestMealsCount}
            >
              Guests
            </Tabs.Option>
          </Tabs.Options>
        </Tabs>

        {/* Tab 1: Pending Users Section */}
        {activeTab === 'pending' && (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Users Without Selections ({filteredPendingUsers.length})
                </h3>
                <p className="text-xs text-text-secondary">
                  Users who haven't completed their meal selection for Week {selectedWeek}.
                </p>
              </div>

              {filteredPendingUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={isAllSelected ? 'primary' : 'outline'}
                    size="sm"
                    onClick={handleToggleSelectAll}
                    label={isAllSelected ? 'Deselect All' : `Select All (${filteredPendingUsers.length})`}
                  />

                  <Button
                    variant="tertiary"
                    size="sm"
                    icon={<Copy size={14} className={isCopied ? 'text-primary' : 'text-text-muted'} />}
                    label={isCopied ? 'Copied!' : 'Copy Names'}
                    onClick={handleCopyNames}
                  />
                </div>
              )}
            </div>

            {/* Search Box */}
            {rawPendingUsers.length > 0 && (
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search pending users by name or email..."
              />
            )}

            {/* Users List Container */}
            <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden flex flex-col">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
                  <LoadingSpinner />
                  <p className="mt-3 text-xs sm:text-sm">Fetching pending selections...</p>
                </div>
              ) : !currentSchedule ? (
                <div className="py-10 px-4">
                  <EmptyState
                    title={`No Menu Scheduled for Week ${selectedWeek}`}
                    description="There is currently no active menu schedule for this week. Please schedule a menu first."
                    buttonLabel="Schedule a Menu"
                    buttonAction={() => navigate('/admin/menu')}
                  />
                </div>
              ) : rawPendingUsers.length === 0 ? (
                <div className="py-10 px-4">
                  <EmptyState
                    icon={<CheckCircle2 size={28} className="text-primary" />}
                    title="All Selections Submitted! 🎉"
                    description={`Everyone has completed their meal selection for Week ${selectedWeek}, ${selectedYear}.`}
                  />
                </div>
              ) : filteredPendingUsers.length === 0 ? (
                <div className="py-10 px-4">
                  <EmptyState
                    title="No users found"
                    description={`No pending users match "${searchQuery}".`}
                  />
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto divide-y divide-border overscroll-contain">
                  {filteredPendingUsers.map((user: UserWithoutWeeklySelections) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    const initials = user.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={user.id}
                        className={`flex  sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 transition-colors ${
                          isSelected ? 'bg-primary-light/40 hover:bg-primary-light/50' : 'hover:bg-surface-muted/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleSelectUser(user.id)}
                          />
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-xs sm:text-sm border border-primary/20">
                            {initials || <Users size={16} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-text-primary truncate">
                              {user.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 self-end sm:self-center">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Utensils size={13} />}
                            label="Select for User"
                            onClick={() =>
                              navigate(
                                `/select-meal?forSomeone=true&userId=${user.id}&week=${selectedWeek}&year=${selectedYear}`,
                              )
                            }
                          />
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
                <h3 className="text-base font-bold text-text-primary">
                  Users With Submitted Choices ({filteredSubmittedUsers.length})
                </h3>
                <p className="text-xs text-text-secondary">
                  Active users who have submitted their meal choices for Week {selectedWeek}.
                </p>
              </div>
            </div>

            {/* Search Box */}
            {rawSubmittedUsers.length > 0 && (
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search submitted users by name or email..."
              />
            )}

            <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden flex flex-col">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
                  <LoadingSpinner />
                  <p className="mt-3 text-xs sm:text-sm">Fetching submitted users...</p>
                </div>
              ) : !currentSchedule ? (
                <div className="py-10 px-4">
                  <EmptyState
                    title="No active menu schedule"
                    description="Please schedule a menu first."
                  />
                </div>
              ) : rawSubmittedUsers.length === 0 ? (
                <div className="py-10 px-4">
                  <EmptyState
                    icon={<UserX size={26} className="text-text-muted" />}
                    title="No submissions yet"
                    description={`No users have completed their meal selection for Week ${selectedWeek} yet.`}
                  />
                </div>
              ) : filteredSubmittedUsers.length === 0 ? (
                <div className="py-10 px-4">
                  <EmptyState
                    title="No users found"
                    description={`No submitted users match "${searchQuery}".`}
                  />
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto divide-y divide-border overscroll-contain">
                  {filteredSubmittedUsers.map((user: User) => {
                    const initials = user.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={user.id}
                        className="flex sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-surface-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-xs sm:text-sm border border-primary/20">
                            {initials || <Users size={16} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-text-primary truncate">
                              {user.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center sm:self-center">
                          <Button
                            variant="tertiary"
                            size="sm"
                            icon={<Eye size={13} />}
                            aria-label="View selections"
                            className='rounded-r-none border-r-0'
                            onClick={() => setViewingUser(user)}
                          />

                          <Button
                            variant="tertiary"
                            size="sm"
                            icon={<Pencil size={13} />}
                            
                            className='rounded-l-none'
                            onClick={() =>
                              navigate(
                                `/select-meal?forSomeone=true&userId=${user.id}&week=${selectedWeek}&year=${selectedYear}`,
                              )
                            }
                          />
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
                <h3 className="text-base font-bold text-text-primary">
                  Guest Meal Selections ({totalGuestMealsCount} portions)
                </h3>
                <p className="text-xs text-text-secondary">
                  All guest meals scheduled for Week {selectedWeek}. Click ✕ to remove or decrement portions.
                </p>
              </div>

              {currentSchedule && (
                <Button
                  variant="primary"
                  icon={<Plus size={14} />}
                  label="Add Guest Selection"
                  onClick={() =>
                    navigate(
                      `/select-meal?isGuest=true&week=${selectedWeek}&year=${selectedYear}`,
                    )
                  }
                />
              )}
            </div>

            {/* Search Box */}
            {rawGuestSelections.length > 0 && (
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search guest meals by day, dish or requester..."
              />
            )}

            <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden flex flex-col relative">
              {/* Progress Indicator for Background Refetching / Mutations */}
              {(isGuestFetching || deleteGuestMutation.isPending || bulkDeleteGuestMutation.isPending) && (
                <div
                  data-testid="guest-fetching-indicator"
                  className="flex items-center justify-center gap-2 bg-primary-light border-b border-primary/20 py-2 px-3 text-xs font-semibold text-primary animate-pulse"
                >
                  <Loader2 size={13} className="animate-spin text-primary shrink-0" />
                  <span>Updating guest selections...</span>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
                  <LoadingSpinner />
                  <p className="mt-3 text-xs sm:text-sm">Fetching guest selections...</p>
                </div>
              ) : !currentSchedule ? (
                <div className="py-10 px-4">
                  <EmptyState
                    title="No active menu schedule"
                    description="Please schedule a menu first."
                  />
                </div>
              ) : rawGuestSelections.length === 0 ? (
                <div className="py-10 px-4">
                  <EmptyState
                    icon={<Users size={28} className="text-text-muted" />}
                    title="No guest selections yet"
                    description={`No guest meals have been selected for Week ${selectedWeek}.`}
                    buttonLabel="Add Guest Selection"
                    buttonAction={() =>
                      navigate(
                        `/select-meal?isGuest=true&week=${selectedWeek}&year=${selectedYear}`,
                      )
                    }
                  />
                </div>
              ) : filteredGuestSelections.length === 0 ? (
                <div className="py-10 px-4">
                  <EmptyState
                    title="No guest selections found"
                    description={`No guest selections match "${searchQuery}".`}
                  />
                </div>
              ) : (
                <>
                  {/* Guest List Header with Select All (1-portion items) */}
                  <div className="flex items-center justify-between border-b border-border bg-surface-muted px-3.5 sm:px-4 py-2 text-xs font-semibold text-text-secondary">
                    <div className="flex items-center gap-2.5">
                      {singlePortionGuestItems.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleToggleSelectAllGuest}
                          disabled={isGuestActionDisabled}
                          className="flex items-center gap-2 text-xs font-medium text-text-primary hover:text-primary cursor-pointer disabled:opacity-50"
                        >
                          <div
                            className={`flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                              isAllGuestSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-border bg-surface hover:border-border-hover'
                            }`}
                          >
                            {isAllGuestSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span>Select all 1-portion ({singlePortionGuestItems.length})</span>
                        </button>
                      ) : (
                        <span className="text-text-muted">Guest Meals List</span>
                      )}
                    </div>
                    <span className="text-text-muted font-normal">
                      {filteredGuestSelections.length} item{filteredGuestSelections.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto divide-y divide-border overscroll-contain">
                    {filteredGuestSelections.map((item: WeeklyGuestSelectionItem) => {
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
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-surface-muted/60 transition-colors ${
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
                                      : 'border-border bg-surface hover:border-border-hover'
                                  }`}
                                >
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                              </button>
                            ) : (
                              <div className="w-4 sm:w-5 shrink-0" />
                            )}

                            <span className="w-12 sm:w-14 text-xs font-bold text-text-secondary uppercase shrink-0">
                              {dayName.slice(0, 3)}
                            </span>

                            {item.selectionType === 'MEAL' && (
                              <img
                                src={imagePath}
                                alt={mealName}
                                className="h-10 w-10 shrink-0 rounded-lg object-cover bg-surface-muted border border-border/50"
                              />
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-text-primary truncate">
                                  {mealName}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  size="xs"
                                  label={`${item.guestCount} ${item.guestCount === 1 ? 'portion' : 'portions'}`}
                                />
                              </div>
                              {createdByName && (
                                <span className="text-xs text-text-muted block truncate">
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
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/20 bg-danger-light text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-40"
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
          <div className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl rounded-2xl border border-primary/20 bg-surface/95 text-text-primary p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                {selectedUserIds.length}
              </span>
              <span>
                user{selectedUserIds.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                label="Clear"
              />
              <Button
                variant="primary"
                size="sm"
                icon={<Utensils size={14} />}
                label="Select Meals"
                onClick={handleBatchSelectMeals}
              />
            </div>
          </div>
        )}

        {/* Batch Guest Delete Action Floating Bar (Guests tab only) */}
        {activeTab === 'guests' && selectedGuestIds.length > 0 && (
          <div className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl rounded-2xl border border-danger/20 bg-surface/95 text-text-primary p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white text-xs font-bold">
                {selectedGuestIds.length}
              </span>
              <span>
                guest meal{selectedGuestIds.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearGuestSelection}
                disabled={isGuestActionDisabled}
                label="Clear"
              />
              <Button
                variant="danger"
                size="sm"
                disabled={isGuestActionDisabled}
                pending={bulkDeleteGuestMutation.isPending}
                icon={<Trash2 size={14} />}
                label={`Delete Selected (${selectedGuestIds.length})`}
                onClick={() => setIsBulkGuestDeleteModalOpen(true)}
              />
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
        <div className="p-4 sm:p-6 text-text-primary font-sans flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-light text-danger">
            <Trash2 size={24} />
          </div>
          <h3 className="mb-2 text-base sm:text-lg font-bold text-text-primary">
            Delete {selectedGuestIds.length} Guest Selection{selectedGuestIds.length === 1 ? '' : 's'}?
          </h3>
          <p className="mb-6 text-xs sm:text-sm text-text-secondary max-w-sm leading-relaxed">
            Are you sure you want to delete {selectedGuestIds.length} selected guest meal{selectedGuestIds.length === 1 ? '' : 's'} for Week {selectedWeek}? This action cannot be undone.
          </p>
          <div className="flex w-full gap-2.5">
            <Button
              variant="outline"
              className="flex-1"
              disabled={bulkDeleteGuestMutation.isPending}
              onClick={() => setIsBulkGuestDeleteModalOpen(false)}
              label="Cancel"
            />
            <Button
              variant="danger"
              className="flex-1"
              disabled={bulkDeleteGuestMutation.isPending}
              pending={bulkDeleteGuestMutation.isPending}
              label="Confirm Delete"
              onClick={handleConfirmBulkDeleteGuest}
            />
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
        <div className="p-4 sm:p-6 text-text-primary flex flex-col items-center text-center font-sans">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
              targetStatusToSet === 'CLOSED'
                ? 'bg-danger-light text-danger'
                : 'bg-primary-light text-primary'
            }`}
          >
            {targetStatusToSet === 'CLOSED' ? <Lock size={26} /> : <Unlock size={26} />}
          </div>

          <h2 className="mb-2 text-base sm:text-lg font-bold text-text-primary">
            {targetStatusToSet === 'CLOSED'
              ? `Close Selection for Week ${selectedWeek}?`
              : `Reopen Selection for Week ${selectedWeek}?`}
          </h2>

          <p className="mb-6 text-xs sm:text-sm text-text-secondary max-w-sm leading-relaxed">
            {targetStatusToSet === 'CLOSED'
              ? `Closing the selection window will lock meal choices. ${pendingCount} active user(s) have not submitted selections yet.`
              : `Reopening the selection window will allow active users to make or update meal choices for Week ${selectedWeek}.`}
          </p>

          <div className="flex w-full gap-2.5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isUpdating}
              label="Cancel"
            />
            <Button
              variant={targetStatusToSet === 'CLOSED' ? 'danger' : 'primary'}
              className="flex-1"
              onClick={handleConfirmStatusChange}
              disabled={isUpdating}
              pending={isUpdating}
              label={targetStatusToSet === 'CLOSED' ? 'Yes, Close Selection' : 'Yes, Reopen Selection'}
            />
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

export default SelectionStatus;
