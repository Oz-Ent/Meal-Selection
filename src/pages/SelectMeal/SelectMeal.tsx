import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Loader2, Search } from 'lucide-react';
import { NavBar } from '../../components/NavBar/NavBar';
import Modal from '../../components/Modal/Modal';
import { SuccessModal } from './SuccessModal';
import { SelectPresetModal } from './SelectPresetModal';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import { BottomToast, type ToastType } from '../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { MealSelectionView, type DaySelectionValue } from '../../components/MealSelectionView/MealSelectionView';

// API Services
import { type User } from '../../api/Services/UserServices';
import { type MenuDay } from '../../api/Services/MenuServices';
import { type CreateSelectionRequest } from '../../api/Services/MealSelectionServices';
import { presetService, type Preset } from '../../api/Services/PresetServices';
import {
  useAdminOverrideSelectionsMutation,
  useCreateMealSelectionsMutation,
  useMenuDaysQuery,
  useMenuMealsQuery,
  useUsersQuery,
  useWeeklyHolidaysQuery,
  useWeeklySelectionsQuery,
  useWeekScheduleQuery,
} from '../../api/useApiQueries';

// Helpers
import { getISOWeekAndYear } from '../../utils/dateHelpers';
import { useAuth } from '../Auth/useAuth/useAuth';
import { type OverviewMeal } from './MealOverview';
import { FALLBACK_MEAL_IMAGE_URL } from '../../helpers/mealDefaults';

export default function SelectMealPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isForSomeone = searchParams.get('forSomeone') === 'true';
  const isGuest = searchParams.get('isGuest') === 'true';
  const userIdParam = searchParams.get('userId');
  const userIdsParam = searchParams.get('userIds');
  const { profile } = useAuth();
  const roleName = profile?.user?.roleName?.toLowerCase();
  const isAdminOrHr = roleName === 'admin' || roleName === 'hr';

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, DaySelectionValue>>({});
  const [existingSelectionIds, setExistingSelectionIds] = useState<Record<number, number>>({});
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [tempModalSelectedUsers, setTempModalSelectedUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(
    isForSomeone && !userIdParam && !userIdsParam,
  );

  const { week, year } = getISOWeekAndYear();
  const usersQuery = useUsersQuery();
  const weekMenuScheduleQuery = useWeekScheduleQuery(week, year);
  const weeklyHolidaysQuery = useWeeklyHolidaysQuery(week, year);
  const menuId = weekMenuScheduleQuery.data?.menu?.id ?? 0;
  const menuDaysQuery = useMenuDaysQuery(menuId);
  const menuDayMealsQuery = useMenuMealsQuery(menuId);
  const createMealSelectionsMutation = useCreateMealSelectionsMutation();
  const adminOverrideSelectionsMutation = useAdminOverrideSelectionsMutation();

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const weekMenuSchedule = weekMenuScheduleQuery.data;
  const menuDays: MenuDay[] = useMemo(() => menuDaysQuery.data ?? [], [menuDaysQuery.data]);
  const menuDayMeals = useMemo(() => menuDayMealsQuery.data ?? [], [menuDayMealsQuery.data]);
  const weeklyHolidays = useMemo(() => weeklyHolidaysQuery.data ?? [], [weeklyHolidaysQuery.data]);
  const currentUserId = profile?.user?.id;

  const isBatchMode = !isGuest && selectedUsers.length > 1;
  const isSingleUserMode = !isGuest && selectedUsers.length === 1;
  const targetUserId = isGuest ? null : isSingleUserMode ? selectedUsers[0].id : isBatchMode ? null : currentUserId;
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const weeklySelectionsQuery = useWeeklySelectionsQuery(
    targetUserId ?? undefined,
    today,
  );

  const initializedUserIdRef = useRef<number | null | undefined>(undefined);

  const selectedMeals = useMemo(() => {
    return Object.entries(selections).map(([menuDayId, selection]) => {
      const day = menuDays.find(
        (day) => day.id === Number(menuDayId)
      );

      const menuDayMeal =
        typeof selection === 'number'
          ? menuDayMeals.find(
              (item) =>
                item.id === selection &&
                item.menuDayId === Number(menuDayId)
            )
          : null;

      return {
        menuDayId: Number(menuDayId),
        dayName: day?.day ?? 'Unknown day',
        mealName:
          selection === 'UNAVAILABLE'
            ? 'Unavailable'
            : selection === 'HOLIDAY'
              ? 'Holiday'
              : menuDayMeal?.meal.name ?? 'Unknown meal',
        selection,
      };
    });
  }, [selections, menuDays, menuDayMeals]);

  // Synchronize target users from URL query params
  useEffect(() => {
    if (!users.length) return;
    if (userIdsParam) {
      const ids = userIdsParam
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));
      const matched = users.filter((u) => ids.includes(u.id));
      if (matched.length > 0) {
        setSelectedUsers(matched);
      }
    } else if (userIdParam) {
      const target = users.find((u) => u.id === Number(userIdParam));
      if (target) {
        setSelectedUsers([target]);
      }
    }
  }, [userIdParam, userIdsParam, users]);

  const targetKey = useMemo(() => {
    if (isGuest) return 'GUEST';
    if (selectedUsers.length > 0) {
      return selectedUsers
        .map((u) => u.id)
        .sort((a, b) => a - b)
        .join(',');
    }
    return `SELF_${currentUserId ?? 0}`;
  }, [isGuest, selectedUsers, currentUserId]);

  const prevTargetKeyRef = useRef<string>(targetKey);

  const getInitialHolidaySelections = useCallback((): Record<number, DaySelectionValue> => {
    const holidaySelections: Record<number, DaySelectionValue> = {};
    for (const day of menuDays) {
      const hasHoliday = weeklyHolidays.some(
        (h) => h.dayName?.toUpperCase() === day.day?.toUpperCase(),
      );
      if (hasHoliday) {
        holidaySelections[day.id] = 'HOLIDAY';
      }
    }
    return holidaySelections;
  }, [menuDays, weeklyHolidays]);

  // Reset selections and existing IDs whenever target user(s) or guest mode changes
  useEffect(() => {
    if (prevTargetKeyRef.current !== targetKey) {
      prevTargetKeyRef.current = targetKey;
      initializedUserIdRef.current = undefined;
      setSelections(getInitialHolidaySelections());
      setExistingSelectionIds({});
      setCurrentDayIndex(0);
    }
  }, [targetKey, getInitialHolidaySelections]);

  // Pre-populate holidays into selections when menu days or holidays load
  useEffect(() => {
    if (!menuDays.length || !weeklyHolidays.length) return;
    setSelections((prev) => {
      let updated = false;
      const next = { ...prev };
      for (const day of menuDays) {
        const hasHoliday = weeklyHolidays.some(
          (h) => h.dayName?.toUpperCase() === day.day?.toUpperCase(),
        );
        if (hasHoliday && next[day.id] !== 'HOLIDAY') {
          next[day.id] = 'HOLIDAY';
          updated = true;
        }
      }
      return updated ? next : prev;
    });
  }, [menuDays, weeklyHolidays]);

  // Pre-populate existing weekly selections if available for a single target user
  useEffect(() => {
    if (!menuDays.length || !menuDayMeals.length) return;
    if (isBatchMode || isGuest || !targetUserId) {
      initializedUserIdRef.current = targetUserId;
      return;
    }
    if (initializedUserIdRef.current === targetUserId) return;
    if (weeklySelectionsQuery.isLoading || weeklySelectionsQuery.isFetching) return;

    const userMealSelections = weeklySelectionsQuery.data?.mealSelections;
    if (!userMealSelections || Object.keys(userMealSelections).length === 0) {
      initializedUserIdRef.current = targetUserId;
      return;
    }

    initializedUserIdRef.current = targetUserId;
    const loadedExistingIds: Record<number, number> = {};
    const next: Record<number, DaySelectionValue> = getInitialHolidaySelections();

    for (const day of menuDays) {
      const dayUpper = day.day?.toUpperCase();
      if (!dayUpper) continue;
      const existingSelection =
        userMealSelections[dayUpper] ||
        userMealSelections[day.day] ||
        Object.entries(userMealSelections).find(
          ([k]) => k.toUpperCase() === dayUpper,
        )?.[1];

      if (!existingSelection) continue;

      if (existingSelection.id) {
        loadedExistingIds[day.id] = existingSelection.id;
      }

      // Skip holiday days from being overwritten by regular selection
      const isHolidayDay = weeklyHolidays.some(
        (h) => h.dayName?.toUpperCase() === dayUpper,
      );
      if (isHolidayDay) {
        next[day.id] = 'HOLIDAY';
        continue;
      }

      if (existingSelection.selectionType === 'UNAVAILABLE') {
        next[day.id] = 'UNAVAILABLE';
      } else if (existingSelection.selectionType === 'HOLIDAY') {
        next[day.id] = 'HOLIDAY';
      } else if (existingSelection.mealID || existingSelection.mealName) {
        const matchingMeal = menuDayMeals.find(
          (item) =>
            item.menuDayId === day.id &&
            item.isActive &&
            (item.meal?.id === existingSelection.mealID ||
              (existingSelection.mealName &&
                item.meal?.name?.toLowerCase() === (existingSelection.mealName || '').toLowerCase())),
        );
        if (matchingMeal) {
          next[day.id] = matchingMeal.id;
        }
      }
    }

    setSelections(next);
    setExistingSelectionIds(loadedExistingIds);
  }, [
    menuDays,
    menuDayMeals,
    weeklySelectionsQuery.data,
    weeklySelectionsQuery.isLoading,
    weeklySelectionsQuery.isFetching,
    weeklyHolidays,
    targetUserId,
    isBatchMode,
    isGuest,
    getInitialHolidaySelections,
  ]);

  const handleSelectionChange = (menuDayId: number, value: DaySelectionValue | undefined) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (value === undefined) {
        delete next[menuDayId];
      } else {
        next[menuDayId] = value;
      }
      return next;
    });
  };

  const handleClearDaySelection = (menuDayId: number) => {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[menuDayId];
      return next;
    });
  };

  const handleClearAllSelections = () => {
    const holidaySelections: Record<number, DaySelectionValue> = {};
    for (const day of menuDays) {
      const hasHoliday = weeklyHolidays.some(
        (h) => h.dayName?.toUpperCase() === day.day?.toUpperCase(),
      );
      if (hasHoliday) {
        holidaySelections[day.id] = 'HOLIDAY';
      }
    }
    setSelections(holidaySelections);
  };

  const handleApplyPreset = async (preset: Preset) => {
    try {
      const details = await presetService.getWithDetails(preset.id);
      const nextSelections: Record<number, DaySelectionValue> = {};

      // Keep holidays auto-marked
      for (const day of menuDays) {
        const isHoliday = weeklyHolidays.some(
          (h) => h.dayName?.toUpperCase() === day.day?.toUpperCase(),
        );
        if (isHoliday) {
          nextSelections[day.id] = 'HOLIDAY';
        }
      }

      // Map preset items
      if (Array.isArray(details.presetItems) && details.presetItems.length > 0) {
        for (const item of details.presetItems) {
          if (item.menuDayId && item.dayMealId) {
            if (nextSelections[item.menuDayId] !== 'HOLIDAY') {
              nextSelections[item.menuDayId] = item.dayMealId;
            }
          } else if (item.menuDay?.day && item.dayMealId) {
            const matchedDay = menuDays.find(
              (d) => d.day?.toUpperCase() === item.menuDay?.day?.toUpperCase(),
            );
            if (matchedDay && nextSelections[matchedDay.id] !== 'HOLIDAY') {
              nextSelections[matchedDay.id] = item.dayMealId;
            }
          }
        }
      } else if (
        Array.isArray(details.presetItemsGrouped) &&
        details.presetItemsGrouped.length > 0 &&
        menuDays.length > 0
      ) {
        for (const group of details.presetItemsGrouped) {
          const matchedDay = menuDays.find(
            (d) => d.day?.toUpperCase() === group.day?.toUpperCase(),
          );
          if (!matchedDay || nextSelections[matchedDay.id] === 'HOLIDAY') continue;
          const firstItem = group.items?.[0];
          if (firstItem?.dayMealId) {
            nextSelections[matchedDay.id] = firstItem.dayMealId;
          }
        }
      }

      setSelections((prev) => ({
        ...prev,
        ...nextSelections,
      }));

      setToast({
        isOpen: true,
        type: 'success',
        message: `${preset.name || 'Preset'} preset menu applied.`,
      });
    } catch (error) {
      console.error('Failed to apply preset:', error);
      setToast({
        isOpen: true,
        type: 'error',
        message: `Something went wrong while applying ${preset.name || 'preset'} preset meal. Please try again.`,
      });
    }
  };

  const submitSelections = async () => {
    if (!weekMenuSchedule || (!isGuest && selectedUsers.length === 0 && !currentUserId)) {
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while submitting choices. Please try again.',
      });
      setIsConfirmModalOpen(false);
      return;
    }

    const payload: CreateSelectionRequest[] = [];
    const targetUserIdsList: (number | null)[] = isGuest
      ? [null]
      : selectedUsers.length > 0
        ? selectedUsers.map((u) => u.id)
        : [currentUserId ?? null];

    for (const uid of targetUserIdsList) {
      for (const mDay of menuDays) {
        const selection = selections[mDay.id];
        if (selection === undefined) continue;

        const existingId =
          !isBatchMode && !isGuest && uid === targetUserId
            ? existingSelectionIds[mDay.id]
            : undefined;

        if (selection === 'UNAVAILABLE') {
          payload.push({
            ...(existingId ? { id: existingId } : {}),
            dayMealId: null,
            selectionType: 'UNAVAILABLE',
            createdFor: uid,
            ...(isGuest ? { guestCount: Math.max(1, guestCount) } : {}),
            weekMenuScheduleId: weekMenuSchedule.id,
            menuDayId: mDay.id,
          });
        } else if (selection === 'HOLIDAY') {
          payload.push({
            ...(existingId ? { id: existingId } : {}),
            dayMealId: null,
            selectionType: 'HOLIDAY',
            createdFor: uid,
            ...(isGuest ? { guestCount: Math.max(1, guestCount) } : {}),
            weekMenuScheduleId: weekMenuSchedule.id,
            menuDayId: mDay.id,
          });
        } else {
          payload.push({
            ...(existingId ? { id: existingId } : {}),
            dayMealId: typeof selection === 'number' ? selection : null,
            selectionType: 'MEAL',
            createdFor: uid,
            ...(isGuest ? { guestCount: Math.max(1, guestCount) } : {}),
            weekMenuScheduleId: weekMenuSchedule.id,
            menuDayId: mDay.id,
          });
        }
      }
    }

    const isSelectionComplete =
      menuDays.length > 0 && menuDays.every((day) => selections[day.id] !== undefined);

    const expectedCount = menuDays.length * targetUserIdsList.length;

    if (menuDays.length === 0 || !isSelectionComplete || payload.length !== expectedCount) {
      setToast({
        isOpen: true,
        type: 'error',
        message: `Please make a choice for all ${menuDays.length || 5} days (meal, unavailable, or holiday) before submitting.`,
      });
      setIsConfirmModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const shouldUseAdminOverride = isAdminOrHr && (selectedUsers.length > 0 || isGuest);
      if (shouldUseAdminOverride) {
        await adminOverrideSelectionsMutation.mutateAsync(payload);
      } else {
        await createMealSelectionsMutation.mutateAsync(payload);
      }
      setIsConfirmed(true);
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Failed to submit selections:', error);
      setIsConfirmModalOpen(false);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while submitting choices. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const overviewMeals = menuDays.reduce<Record<string, OverviewMeal>>((mealsByDay, day) => {
    const selection = selections[day.id];
    if (selection === undefined) return mealsByDay;

    const dayKey = day.day || `Day ${day.id}`;

    if (selection === 'UNAVAILABLE') {
      mealsByDay[dayKey] = {
        title: 'Unavailable',
        imageUrl: FALLBACK_MEAL_IMAGE_URL,
      };
    } else if (selection === 'HOLIDAY') {
      mealsByDay[dayKey] = {
        title: 'Holiday',
        imageUrl: FALLBACK_MEAL_IMAGE_URL,
      };
    } else {
      const meal = menuDayMeals.find((item) => item.id === selection)?.meal;
      if (meal) {
        mealsByDay[dayKey] = {
          title: meal.name,
          imageUrl: meal.imagePath || FALLBACK_MEAL_IMAGE_URL,
        };
      }
    }
    return mealsByDay;
  }, {});

  const isLoading =
    weekMenuScheduleQuery.isLoading ||
    menuDaysQuery.isLoading ||
    menuDayMealsQuery.isLoading ||
    weeklyHolidaysQuery.isLoading;

  const isSelectionComplete =
    menuDays.length > 0 && menuDays.every((day) => selections[day.id] !== undefined);
  const selectedCount = menuDays.filter((day) => selections[day.id] !== undefined).length;

  const filteredUsersForModal = useMemo(() => {
    return users.filter((u) => {
      const query = userSearchTerm.trim().toLowerCase();
      if (!query) return true;
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const refEmail = (u.referenceEmail || '').toLowerCase();
      return name.includes(query) || email.includes(query) || refEmail.includes(query);
    });
  }, [users, userSearchTerm]);

  const isAllModalSelected =
    filteredUsersForModal.length > 0 &&
    filteredUsersForModal.every((u) => tempModalSelectedUsers.some((selected) => selected.id === u.id));

  const handleToggleSelectAllModal = () => {
    if (isAllModalSelected) {
      const visibleIds = new Set(filteredUsersForModal.map((u) => u.id));
      setTempModalSelectedUsers((prev) => prev.filter((u) => !visibleIds.has(u.id)));
    } else {
      const existingIds = new Set(tempModalSelectedUsers.map((u) => u.id));
      const newlyAdded = filteredUsersForModal.filter((u) => !existingIds.has(u.id));
      setTempModalSelectedUsers((prev) => [...prev, ...newlyAdded]);
    }
  };

  const handleToggleModalUser = (user: User) => {
    if (!isAdminOrHr) {
      setTempModalSelectedUsers([user]);
      return;
    }
    setTempModalSelectedUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto bg-app-bg text-text-primary flex flex-col font-sans relative pb-28">
      <div className="sr-only">
        <TitleBar />
      </div>

      {/* Full Page Header */}
      <NavBar
        title="Select Meal"
        backUrl="/activities"
        actionButton={{
          label: `Save ${menuDays.length > 0 ? `(${selectedCount}/${menuDays.length})` : ''}`,
          icon: isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} strokeWidth={2.5} />
          ),
          onClick: () => setIsConfirmModalOpen(true),
          disabled: !isSelectionComplete || isSubmitting || isLoading,
        }}
      />

      {isGuest && (
        <div className="bg-primary-light py-2.5 px-4 flex items-center justify-between text-xs font-semibold text-primary border-b border-slate-100">
          <span>Selecting for: Guests</span>
          <div className="flex items-center gap-2">
            <label htmlFor="guest-count" className="text-slate-600 font-medium">Headcount:</label>
            <input
              id="guest-count"
              type="number"
              min={1}
              max={500}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-14 px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-900 text-center text-xs font-bold"
            />
          </div>
        </div>
      )}

      {selectedUsers.length > 0 && !isGuest && (
        <div className="bg-primary-light py-2 px-4 flex items-center justify-between text-xs font-semibold text-primary border-b border-slate-100">
          <div className="flex items-center gap-2 truncate pr-2">
            {selectedUsers.length === 1 ? (
              <span className="truncate">Selecting for: {selectedUsers[0].name}</span>
            ) : (
              <span className="truncate">
                Selecting for: {selectedUsers.length} Users ({selectedUsers.map((u) => u.name).slice(0, 2).join(', ')}
                {selectedUsers.length > 2 ? ` +${selectedUsers.length - 2} more` : ''})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setTempModalSelectedUsers(selectedUsers);
              setIsUserModalOpen(true);
            }}
            className="text-xs font-bold text-primary underline hover:opacity-80 transition-opacity cursor-pointer shrink-0"
          >
            Change
          </button>
        </div>
      )}

      {/* Loading Progress Indicator */}
      {isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8">
            <LoadingSpinner />
          </div>
          <p className="text-sm text-slate-500">Loading meals...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && menuDays.length === 0 && (
        <div className="flex flex-col items-center justify-center px-8 pt-20 text-center">
          <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
            No active menu schedule found for this week.
          </p>
        </div>
      )}

      {/* Reusable Meal Selection View Component */}
      {!isLoading && menuDays.length > 0 && (
        <MealSelectionView
          menuDays={menuDays}
          menuDayMeals={menuDayMeals}
          selections={selections}
          onSelectionChange={handleSelectionChange}
          onClearDaySelection={handleClearDaySelection}
          onClearAllSelections={handleClearAllSelections}
          currentDayIndex={currentDayIndex}
          onDayIndexChange={setCurrentDayIndex}
          weeklyHolidays={weeklyHolidays}
          showPresetButton={true}
          onPresetClick={() => setIsPresetModalOpen(true)}
          onToast={(type, message) => setToast({ isOpen: true, type, message })}
        />
      )}

      {/* Select Preset Modal */}
      <SelectPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        menuId={menuId}
        userId={currentUserId}
        onApplyPreset={handleApplyPreset}
      />

      {/* User Selection Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        variant="bottom"
        showCloseButton={true}
      >
        <div className="p-4 pt-6 flex flex-col w-full text-slate-900 font-sans">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900 text-left">
              {isAdminOrHr ? 'Select user(s)' : 'Select user'}
            </h3>
            {isAdminOrHr && filteredUsersForModal.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAllModal}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {isAllModalSelected ? 'Deselect All' : `Select All (${filteredUsersForModal.length})`}
              </button>
            )}
          </div>

          <div className="relative mb-3 w-full">
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Search User"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none pr-10 focus:border-slate-400 placeholder:text-slate-400"
            />
            <Search
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
          </div>

          <div className="w-full flex-1 overflow-y-auto max-h-[50vh] divide-y divide-slate-100 pr-1 space-y-1">
            {filteredUsersForModal.map((user) => {
              const isSelected = tempModalSelectedUsers.some((u) => u.id === user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleToggleModalUser(user)}
                  className={`flex w-full items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary-light/40 hover:bg-primary-light/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email || user.referenceEmail}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredUsersForModal.length === 0 && (
              <p className="text-sm text-slate-500 py-6 text-center">No users found.</p>
            )}
          </div>

          <button
            type="button"
            disabled={tempModalSelectedUsers.length === 0}
            onClick={() => {
              setSelectedUsers(tempModalSelectedUsers);
              setIsUserModalOpen(false);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
          >
            <ArrowRight size={18} />
            <span>
              Continue{tempModalSelectedUsers.length > 0 ? ` (${tempModalSelectedUsers.length} user${tempModalSelectedUsers.length === 1 ? '' : 's'})` : ''}
            </span>
          </button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        variant="center"
      >
        <div className="p-6 sm:p-7 flex flex-col text-slate-900 w-full max-w-sm sm:max-w-md font-sans">
          <h3 className="text-xl font-bold mb-2.5 text-slate-900 text-left">Confirm Meals</h3>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed text-left">
            {isGuest ? (
              <>
                Please confirm that you are satisfied with the food choices for{' '}
                <span className="font-semibold text-slate-800">
                  {guestCount > 1 ? `${guestCount} guests` : 'a guest'}
                </span>{' '}
                for this week.
              </>
            ) : selectedUsers.length > 1 ? (
              <>
                Please confirm that you want to set these food choices for{' '}
                <span className="font-semibold text-slate-800">
                  {selectedUsers.length} selected users
                </span>{' '}
                ({selectedUsers.map((u) => u.name).slice(0, 3).join(', ')}
                {selectedUsers.length > 3 ? ` +${selectedUsers.length - 3} more` : ''}) for this week.
              </>
            ) : selectedUsers.length === 1 ? (
              <>
                Please confirm that you are satisfied with the food choices for{' '}
                <span className="font-semibold text-slate-800">{selectedUsers[0].name}</span> for this week.
              </>
            ) : (
              'Please confirm that you are satisfied with your food choices for this week.'
            )}
          </p>
          <section>
            <div className="flex flex-col gap-2 border-2 rounded-md border-gray-200">
              {selectedMeals.map((item) => (
                <div key={item.menuDayId} className="flex flex-col border-b p-2 border-gray-100 last:border-0">
                  <span className="text-xs text-slate-500">{item.dayName}</span>
                  <span className="text-base">{item.mealName}</span>
                </div>
              ))}
            </div>
          </section>
          <div className="flex items-center gap-3 w-full mt-4">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={submitSelections}
              className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shadow-2xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              <span>Confirm</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      {isConfirmed && (
        <SuccessModal
          selectedMeals={overviewMeals}
          targetName={
            isGuest
              ? guestCount > 1
                ? `${guestCount} guests`
                : 'a guest'
              : selectedUsers.length > 1
                ? `${selectedUsers.length} users`
                : selectedUsers[0]
                  ? selectedUsers[0].name
                  : undefined
          }
          onClose={() => {
            setIsConfirmed(false);
            navigate('/activities');
          }}
        />
      )}

      {/* Bottom Toast Banner */}
      <BottomToast
        isOpen={toast.isOpen}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
