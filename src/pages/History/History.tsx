import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Users,
} from 'lucide-react';
import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { EmptyPage } from '../../components/EmptyPage/EmptyPage';
import Tabs from '../../components/Tabs/Tabs';
import Button from '../../components/Button/Button';
import { BottomToast, type ToastType } from '../../components/BottomToast/BottomToast';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import { useAuth } from '../Auth/useAuth/useAuth';
import {
  useUserWeeklyHistoryQuery,
  useWeeklyHistoryQuery,
} from '../../api/useApiQueries';
import { isAdminRole } from '../../utils/Enums/Roles';
import type { UserWeeklyHistoryItem } from '../../api/Services/MealSelectionServices';

import { useHistoryFilters } from './useHistoryFilters';
import { HistoryFilterPanel } from './components/HistoryFilterPanel';
import { UserHistoryCard } from './components/UserHistoryCard';
import { AdminHistoryCard } from './components/AdminHistoryCard';
import { SavePresetModal } from './components/SavePresetModal';

export function History() {
  const { profile } = useAuth();
  const isAdminOrHr = isAdminRole(profile?.user);

  // Tabs for Admin/HR: 'my-history' | 'admin-report'
  const [activeTab, setActiveTab] = useState<'my-history' | 'admin-report'>('my-history');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Consolidated Filter State via Reducer
  const {
    state: filterState,
    filterParams,
    hasActiveFilters,
    setField,
    setPage,
    setQuickRange,
    resetFilters,
  } = useHistoryFilters();

  // Preset Modal State & Feedback Toast
  const [presetModalItem, setPresetModalItem] = useState<UserWeeklyHistoryItem | null>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  // Queries - only execute when the corresponding view is active
  const isUserViewActive = !isAdminOrHr || activeTab === 'my-history';
  const isAdminViewActive = isAdminOrHr && activeTab === 'admin-report';

  const userHistoryQuery = useUserWeeklyHistoryQuery(
    profile?.user?.id,
    filterParams,
    { enabled: isUserViewActive },
  );

  const adminHistoryQuery = useWeeklyHistoryQuery(filterParams, {
    enabled: isAdminViewActive,
  });

  const isQueryLoading = isUserViewActive
    ? userHistoryQuery.isLoading
    : adminHistoryQuery.isLoading;

  const isQueryError = isUserViewActive
    ? userHistoryQuery.isError
    : adminHistoryQuery.isError;

  const userHistoryData = userHistoryQuery.data;
  const adminHistoryData = adminHistoryQuery.data;

  const pagination = isUserViewActive
    ? userHistoryData?.pagination
    : adminHistoryData?.pagination;

  const totalWeeks = pagination?.totalWeeks ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

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
          <HistoryFilterPanel
            state={filterState}
            totalWeeks={totalWeeks}
            onSetField={setField}
            onQuickRange={setQuickRange}
            onResetFilters={resetFilters}
          />
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
                onClick={resetFilters}
              />
            )}
          </div>
        )}

        {/* Data List: User History View */}
        {!isQueryLoading &&
          !isQueryError &&
          isUserViewActive &&
          userHistoryData?.data
            ?.filter((weekItem) => weekItem.selection?.createdById != null)
            .map((weekItem) => (
              <UserHistoryCard
                key={weekItem.weekMenuScheduleId}
                weekItem={weekItem}
                onOpenSavePreset={(item) => setPresetModalItem(item)}
              />
            ))}

        {/* Data List: Admin Report History View */}
        {!isQueryLoading &&
          !isQueryError &&
          isAdminViewActive &&
          adminHistoryData?.data?.map((weekItem) => (
            <AdminHistoryCard
              key={weekItem.weekMenuScheduleId}
              weekItem={weekItem}
            />
          ))}

        {/* Pagination Bar */}
        {!isQueryLoading && !isQueryError && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 shadow-xs">
            <span className="text-xs text-text-secondary">
              Page <strong className="text-text-primary">{filterState.page}</strong> of{' '}
              <strong className="text-text-primary">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filterState.page <= 1}
                icon={<ChevronLeft size={15} />}
                label="Previous"
                onClick={() => setPage(Math.max(filterState.page - 1, 1))}
              />

              <Button
                variant="outline"
                size="sm"
                disabled={filterState.page >= totalPages}
                label="Next"
                icon={<ChevronRight size={15} />}
                onClick={() => setPage(Math.min(filterState.page + 1, totalPages))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar activeTab="history" />

      {/* Save as Preset Modal */}
      <SavePresetModal
        presetModalItem={presetModalItem}
        userId={profile?.user?.id}
        onClose={() => setPresetModalItem(null)}
        onSuccessToast={(message) => setToast({ isOpen: true, type: 'success', message })}
        onErrorToast={(message) => setToast({ isOpen: true, type: 'error', message })}
      />

      {/* Toast Notification */}
      <BottomToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </main>
  );
}

export default History;
