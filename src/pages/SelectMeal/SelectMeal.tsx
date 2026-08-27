import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Ban, Check, Loader2, Search, AlertCircle } from 'lucide-react';
import { NavBar } from '../../components/NavBar/NavBar';
import Modal from '../../components/Modal/Modal';
import { SuccessModal } from './SuccessModal';
import { SelectPresetModal } from './SelectPresetModal';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import { BottomToast, type ToastType } from '../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { MealSelectionView, type DaySelectionValue, type GuestDaySelection } from '../../components/MealSelectionView/MealSelectionView';

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
import { getISOWeekAndYear, isMenuDayPast, isMenuDayToday } from '../../utils/dateHelpers';
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
  const [guestSelections, setGuestSelections] = useState<Record<number, GuestDaySelection>>({});
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

  const currentUserId = profile?.user?.id;
  const targetUserId = isGuest || selectedUsers.length > 1
    ? undefined
    : selectedUsers.length === 1
      ? selectedUsers[0].id
      : currentUserId;
  const isBatchMode = !isGuest && selectedUsers.length > 1;

  const menuId = weekMenuScheduleQuery.data?.menu?.id ?? 0;
  const menuDaysQuery = useMenuDaysQuery(menuId);
  const menuDayMealsQuery = useMenuMealsQuery(menuId, targetUserId);

  const createMealSelectionsMutation = useCreateMealSelectionsMutation();
  const adminOverrideSelectionsMutation = useAdminOverrideSelectionsMutation();

  const users = usersQuery.data ?? [];
  const weekMenuSchedule = weekMenuScheduleQuery.data;
  const menuDays: MenuDay[] = menuDaysQuery.data ?? [];
  const menuDayMeals = menuDayMealsQuery.data ?? [];
  const weeklyHolidays = weeklyHolidaysQuery.data ?? [];

  const menuDaysById = useMemo(
    () => new Map(menuDays.map((day) => [day.id, day])),
    [menuDays],
  );

  const menuDayMealsById = useMemo(
    () => new Map(menuDayMeals.map((dayMeal) => [dayMeal.id, dayMeal])),
    [menuDayMeals],
  );

  const holidayDayNames = useMemo(
    () =>
      new Set(
        weeklyHolidays
          .map((holiday) => holiday.dayName?.toUpperCase())
          .filter((dayName): dayName is string => Boolean(dayName)),
      ),
    [weeklyHolidays],
  );


  const isScheduleClosed = Boolean(weekMenuSchedule && weekMenuSchedule.status !== 'ACTIVE');

  // Determine which menu days are in the past for this scheduled week
  const pastDayIds = useMemo(() => {
    if (!menuDays.length) return [];
    return menuDays
      .filter((day) => day.day && isMenuDayPast(week, year, day.day))
      .map((day) => day.id);
  }, [menuDays, week, year]);

  const todayDayId = useMemo(() => {
    if (!menuDays.length) return undefined;
    return menuDays.find((day) => day.day && isMenuDayToday(week, year, day.day))?.id;
  }, [menuDays, week, year]);

  const pastDayIdSet = useMemo(() => new Set(pastDayIds), [pastDayIds]);

  const today = new Date().toISOString().split('T')[0];
  const weeklySelectionsQuery = useWeeklySelectionsQuery(targetUserId, today);

  const isTargetUserAlreadySelected = useMemo(() => {
    if (isAdminOrHr || isGuest || !targetUserId || targetUserId === currentUserId) return false;
    const userSelections = weeklySelectionsQuery.data?.mealSelections;
    return Boolean(userSelections && Object.keys(userSelections).length > 0);
  }, [isAdminOrHr, isGuest, targetUserId, currentUserId, weeklySelectionsQuery.data]);

  const initializedUserIdRef = useRef<number | undefined>(undefined);
  const hasInitializedDayIndexRef = useRef(false);

  // Set initial day index to the first upcoming/editable day when days load
  useEffect(() => {
    if (!menuDays.length || hasInitializedDayIndexRef.current) return;
    const firstUpcomingIndex = menuDays.findIndex((d) => !pastDayIdSet.has(d.id));
    if (firstUpcomingIndex > 0) {
      setCurrentDayIndex(firstUpcomingIndex);
    }
    hasInitializedDayIndexRef.current = true;
  }, [menuDays, pastDayIdSet]);

  const selectedMeals = useMemo(() => {
    return Object.entries(selections).map(([menuDayId, selection]) => {
      const day = menuDaysById.get(Number(menuDayId));
      const menuDayMeal =
        typeof selection === 'number'
          ? menuDayMealsById.get(selection)
          : undefined;

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
  }, [selections, menuDaysById, menuDayMealsById]);

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

  const getInitialDefaultSelections = useCallback((): Record<number, DaySelectionValue> => {
    const defaultSelections: Record<number, DaySelectionValue> = {};
    for (const day of menuDays) {
      const hasHoliday = Boolean(day.day && holidayDayNames.has(day.day.toUpperCase()));
      if (hasHoliday) {
        defaultSelections[day.id] = 'HOLIDAY';
      } else if (pastDayIdSet.has(day.id)) {
        defaultSelections[day.id] = 'UNAVAILABLE';
      }
    }
    return defaultSelections;
  }, [menuDays, holidayDayNames, pastDayIdSet]);

  // Reset selections and existing IDs whenever target user(s) or guest mode changes
  useEffect(() => {
    if (prevTargetKeyRef.current !== targetKey) {
      prevTargetKeyRef.current = targetKey;
      initializedUserIdRef.current = undefined;
      setSelections(getInitialDefaultSelections());
      setGuestSelections({});
      setExistingSelectionIds({});
      const firstUpcomingIndex = menuDays.findIndex((d) => !pastDayIdSet.has(d.id));
      setCurrentDayIndex(firstUpcomingIndex >= 0 ? firstUpcomingIndex : 0);
    }
  }, [targetKey, getInitialDefaultSelections, menuDays, pastDayIdSet]);

  // Pre-populate holidays and past days defaults into selections
  useEffect(() => {
    if (!menuDays.length) return;
    if (isGuest) {
      setGuestSelections((prev) => {
        let updated = false;
        const next = { ...prev };
        for (const day of menuDays) {
          const hasHoliday = Boolean(day.day && holidayDayNames.has(day.day.toUpperCase()));
          if (hasHoliday && next[day.id]?.nonMeal !== 'HOLIDAY') {
            next[day.id] = { mealQuantities: {}, nonMeal: 'HOLIDAY' };
            updated = true;
          } else if (pastDayIdSet.has(day.id) && !next[day.id]) {
            next[day.id] = { mealQuantities: {}, nonMeal: 'UNAVAILABLE' };
            updated = true;
          }
        }
        return updated ? next : prev;
      });
    } else {
      setSelections((prev) => {
        let updated = false;
        const next = { ...prev };
        for (const day of menuDays) {
          const hasHoliday = Boolean(day.day && holidayDayNames.has(day.day.toUpperCase()));
          if (hasHoliday && next[day.id] !== 'HOLIDAY') {
            next[day.id] = 'HOLIDAY';
            updated = true;
          } else if (pastDayIdSet.has(day.id) && next[day.id] === undefined) {
            next[day.id] = 'UNAVAILABLE';
            updated = true;
          }
        }
        return updated ? next : prev;
      });
    }
  }, [isGuest, menuDays, holidayDayNames, pastDayIdSet]);

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
    const next: Record<number, DaySelectionValue> = getInitialDefaultSelections();
    const normalizedSelections = new Map(
      Object.entries(userMealSelections).map(([key, value]) => [key.toUpperCase(), value]),
    );

    for (const day of menuDays) {
      const dayUpper = day.day?.toUpperCase();
      if (!dayUpper) continue;
      const existingSelection = normalizedSelections.get(dayUpper);

      if (!existingSelection) {
        // If past day with no previous selection, default to holiday or unavailable
        if (pastDayIdSet.has(day.id) && next[day.id] === undefined) {
          const isHolidayDay = holidayDayNames.has(dayUpper);
          next[day.id] = isHolidayDay ? 'HOLIDAY' : 'UNAVAILABLE';
        }
        continue;
      }

      if (existingSelection.id) {
        loadedExistingIds[day.id] = existingSelection.id;
      }

      // Skip holiday days from being overwritten by regular selection
      const isHolidayDay = holidayDayNames.has(dayUpper);
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
                item.meal?.name?.trim().toLowerCase() ===
                  existingSelection.mealName.trim().toLowerCase())),
        );
        if (matchingMeal) {
          next[day.id] = matchingMeal.id;
        }
      }
    }

    setExistingSelectionIds(loadedExistingIds);
    setSelections(next);
  }, [
    isBatchMode,
    isGuest,
    targetUserId,
    weeklySelectionsQuery.data,
    weeklySelectionsQuery.isLoading,
    weeklySelectionsQuery.isFetching,
    menuDays,
    menuDayMeals,
    holidayDayNames,
    pastDayIdSet,
    getInitialDefaultSelections,
  ]);

  const handleSelectionChange = useCallback((menuDayId: number, value: DaySelectionValue | undefined) => {
    setSelections((prev) => {
      if (value === undefined) {
        const next = { ...prev };
        delete next[menuDayId];
        return next;
      }
      return {
        ...prev,
        [menuDayId]: value,
      };
    });
  }, []);

  const handleGuestMealQuantityChange = useCallback((menuDayId: number, dayMealId: number, qty: number) => {
    setGuestSelections((prev) => {
      const currentDay = prev[menuDayId] || { mealQuantities: {} };
      const nextQuantities = { ...currentDay.mealQuantities };
      if (qty <= 0) {
        delete nextQuantities[dayMealId];
      } else {
        nextQuantities[dayMealId] = qty;
      }
      return {
        ...prev,
        [menuDayId]: {
          mealQuantities: nextQuantities,
          nonMeal: undefined,
        },
      };
    });
  }, []);

  const handleGuestNonMealChange = useCallback((menuDayId: number, nonMeal: 'UNAVAILABLE' | 'HOLIDAY' | undefined) => {
    setGuestSelections((prev) => {
      if (!nonMeal) {
        const next = { ...prev };
        delete next[menuDayId];
        return next;
      }
      return {
        ...prev,
        [menuDayId]: {
          mealQuantities: {},
          nonMeal,
        },
      };
    });
  }, []);

  const handleClearDaySelection = useCallback((menuDayId: number) => {
    if (isGuest) {
      setGuestSelections((prev) => {
        const next = { ...prev };
        delete next[menuDayId];
        return next;
      });
    } else {
      setSelections((prev) => {
        const next = { ...prev };
        delete next[menuDayId];
        return next;
      });
    }
  }, [isGuest]);

  const handleClearAllSelections = useCallback(() => {
    if (isGuest) {
      const defaultGuest: Record<number, GuestDaySelection> = {};
      for (const day of menuDays) {
        const hasHoliday = Boolean(day.day && holidayDayNames.has(day.day.toUpperCase()));
        if (hasHoliday) {
          defaultGuest[day.id] = { mealQuantities: {}, nonMeal: 'HOLIDAY' };
        } else if (pastDayIdSet.has(day.id)) {
          defaultGuest[day.id] = { mealQuantities: {}, nonMeal: 'UNAVAILABLE' };
        }
      }
      setGuestSelections(defaultGuest);
    } else {
      setSelections(getInitialDefaultSelections());
    }
  }, [isGuest, menuDays, holidayDayNames, pastDayIdSet, getInitialDefaultSelections]);

  const isGuestDayComplete = useCallback((dayId: number) => {
    const daySel = guestSelections[dayId];
    if (!daySel) return false;
    if (daySel.nonMeal === 'UNAVAILABLE' || daySel.nonMeal === 'HOLIDAY') return true;
    return Object.values(daySel.mealQuantities).some((qty) => qty > 0);
  }, [guestSelections]);

  const isSelectionComplete = useMemo(() => {
    if (!menuDays.length) return false;
    return isGuest
      ? menuDays.every((d) => isGuestDayComplete(d.id))
      : menuDays.every((d) => selections[d.id] !== undefined);
  }, [isGuest, menuDays, isGuestDayComplete, selections]);

  const selectedCount = useMemo(() => {
    return isGuest
      ? menuDays.filter((d) => isGuestDayComplete(d.id)).length
      : menuDays.filter((d) => selections[d.id] !== undefined).length;
  }, [isGuest, menuDays, isGuestDayComplete, selections]);

  const handleApplyPreset = async (preset: Preset) => {
    try {
      const detailedPreset = await presetService.getWithDetails(preset.id);
      const newSelections: Record<number, DaySelectionValue> = getInitialDefaultSelections();

      if (Array.isArray(detailedPreset.presetItems) && detailedPreset.presetItems.length > 0) {
        for (const item of detailedPreset.presetItems) {
          if (item.menuDayId && item.dayMealId) {
            if (newSelections[item.menuDayId] !== 'HOLIDAY' && !pastDayIdSet.has(item.menuDayId)) {
              newSelections[item.menuDayId] = item.dayMealId;
            }
          } else if (item.menuDay?.day && item.dayMealId) {
            const matchedDay = menuDays.find(
              (d) => d.day?.toUpperCase() === item.menuDay?.day?.toUpperCase(),
            );
            if (matchedDay && newSelections[matchedDay.id] !== 'HOLIDAY' && !pastDayIdSet.has(matchedDay.id)) {
              newSelections[matchedDay.id] = item.dayMealId;
            }
          }
        }
      }

      setSelections(newSelections);
      setToast({
        isOpen: true,
        type: 'success',
        message: `${preset.name || 'Preset'} combo applied successfully!`,
      });
      setIsPresetModalOpen(false);
    } catch {
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

    if (isScheduleClosed && !isAdminOrHr) {
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Meal selection for this week is closed.',
      });
      setIsConfirmModalOpen(false);
      return;
    }

    if (isTargetUserAlreadySelected) {
      setToast({
        isOpen: true,
        type: 'error',
        message: `${selectedUsers[0]?.name || 'The selected user'} has already made meal selections for this week.`,
      });
      setIsConfirmModalOpen(false);
      return;
    }

    const payload: CreateSelectionRequest[] = [];

    if (isGuest) {
      for (const mDay of menuDays) {
        const daySel = guestSelections[mDay.id];
        if (!daySel) continue;
        if (daySel.nonMeal === 'UNAVAILABLE') {
          payload.push({
            dayMealId: null,
            selectionType: 'UNAVAILABLE',
            createdFor: null,
            guestCount: 1,
            weekMenuScheduleId: weekMenuSchedule.id,
            menuDayId: mDay.id,
          });
        } else if (daySel.nonMeal === 'HOLIDAY') {
          payload.push({
            dayMealId: null,
            selectionType: 'HOLIDAY',
            createdFor: null,
            guestCount: 1,
            weekMenuScheduleId: weekMenuSchedule.id,
            menuDayId: mDay.id,
          });
        } else {
          for (const [dayMealIdStr, qty] of Object.entries(daySel.mealQuantities)) {
            if (qty > 0) {
              payload.push({
                dayMealId: Number(dayMealIdStr),
                selectionType: 'MEAL',
                createdFor: null,
                guestCount: qty,
                weekMenuScheduleId: weekMenuSchedule.id,
                menuDayId: mDay.id,
              });
            }
          }
        }
      }

      if (menuDays.length === 0 || !isSelectionComplete || payload.length === 0) {
        setToast({
          isOpen: true,
          type: 'error',
          message: `Please make a choice for all ${menuDays.length || 5} days (meal, unavailable, or holiday) before submitting.`,
        });
        setIsConfirmModalOpen(false);
        return;
      }
    } else {
      const targetUserIds = selectedUsers.length > 0
        ? selectedUsers.map((user) => user.id)
        : currentUserId
          ? [currentUserId]
          : [];

      for (const uid of targetUserIds) {
        for (const mDay of menuDays) {
          const selection = selections[mDay.id];
          if (selection === undefined) continue;

          const existingId =
            !isBatchMode && uid === targetUserId
              ? existingSelectionIds[mDay.id]
              : undefined;

          if (selection === 'UNAVAILABLE') {
            payload.push({
              ...(existingId ? { id: existingId } : {}),
              dayMealId: null,
              selectionType: 'UNAVAILABLE',
              createdFor: uid,
              weekMenuScheduleId: weekMenuSchedule.id,
              menuDayId: mDay.id,
            });
          } else if (selection === 'HOLIDAY') {
            payload.push({
              ...(existingId ? { id: existingId } : {}),
              dayMealId: null,
              selectionType: 'HOLIDAY',
              createdFor: uid,
              weekMenuScheduleId: weekMenuSchedule.id,
              menuDayId: mDay.id,
            });
          } else {
            payload.push({
              ...(existingId ? { id: existingId } : {}),
              dayMealId: typeof selection === 'number' ? selection : null,
              selectionType: 'MEAL',
              createdFor: uid,
              weekMenuScheduleId: weekMenuSchedule.id,
              menuDayId: mDay.id,
            });
          }
        }
      }

      const expectedCount = menuDays.length * targetUserIds.length;

      if (menuDays.length === 0 || !isSelectionComplete || payload.length !== expectedCount) {
        setToast({
          isOpen: true,
          type: 'error',
          message: `Please make a choice for all ${menuDays.length || 5} days (meal, unavailable, or holiday) before submitting.`,
        });
        setIsConfirmModalOpen(false);
        return;
      }
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
    } catch (error: any) {
      console.error('Failed to submit selections:', error);
      setIsConfirmModalOpen(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Something went wrong while submitting choices. Please try again.';
      setToast({
        isOpen: true,
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const overviewMeals = useMemo(() => {
    if (isGuest) {
      return menuDays.reduce<Record<string, OverviewMeal>>((mealsByDay, day) => {
        const daySel = guestSelections[day.id];
        const dayKey = day.day || `Day ${day.id}`;
        if (!daySel) return mealsByDay;

        if (daySel.nonMeal === 'UNAVAILABLE') {
          mealsByDay[dayKey] = {
            title: 'Unavailable',
            imageUrl: FALLBACK_MEAL_IMAGE_URL,
          };
        } else if (daySel.nonMeal === 'HOLIDAY') {
          mealsByDay[dayKey] = {
            title: 'Holiday',
            imageUrl: FALLBACK_MEAL_IMAGE_URL,
          };
        } else {
          const mealEntries = Object.entries(daySel.mealQuantities).filter(([_, qty]) => qty > 0);
          if (mealEntries.length > 0) {
            const firstMeal = menuDayMealsById.get(Number(mealEntries[0][0]))?.meal;
            const titles = mealEntries
              .map(([mid, q]) => {
                const m = menuDayMealsById.get(Number(mid))?.meal;
                return `${q}x ${m?.name || 'Meal'}`;
              })
              .join(', ');
            mealsByDay[dayKey] = {
              title: titles,
              imageUrl: firstMeal?.imagePath || FALLBACK_MEAL_IMAGE_URL,
            };
          }
        }
        return mealsByDay;
      }, {});
    }

    return menuDays.reduce<Record<string, OverviewMeal>>((mealsByDay, day) => {
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
        const meal = menuDayMealsById.get(selection)?.meal;

        mealsByDay[dayKey] = {
          title: meal?.name || 'Meal',
          imageUrl: meal?.imagePath || FALLBACK_MEAL_IMAGE_URL,
        };
      }

      return mealsByDay;
    }, {});
  }, [isGuest, guestSelections, selections, menuDays, menuDayMealsById]);

  const isLoading =
    weekMenuScheduleQuery.isLoading ||
    menuDaysQuery.isLoading ||
    menuDayMealsQuery.isLoading ||
    weeklyHolidaysQuery.isLoading;

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
          disabled:
            !isSelectionComplete ||
            isSubmitting ||
            isLoading ||
            (isScheduleClosed && !isAdminOrHr) ||
            isTargetUserAlreadySelected,
        }}
      />

      {/* Schedule Closed Notice */}
      {isScheduleClosed && (
        <div className="bg-rose-50 border-b border-rose-100 py-2.5 px-4 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <Ban size={16} className="text-rose-600 shrink-0" />
            <span className="font-medium">
              Meal selection for this week is currently {weekMenuSchedule?.status ? weekMenuSchedule.status.toLowerCase() : 'closed'}.
            </span>
          </div>
        </div>
      )}

      {/* Selected Target User Already Selected Notice */}
      {isTargetUserAlreadySelected && (
        <div className="bg-amber-50 border-b border-amber-100 py-2.5 px-4 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <span className="font-semibold">
            {selectedUsers[0]?.name || 'Selected user'} has already made meal selections for this week.
          </span>
        </div>
      )}

      {isGuest && (
        <div className="bg-primary-light py-2.5 px-4 flex items-center justify-between text-xs font-semibold text-primary border-b border-slate-100">
          <span>Selecting for: Guests</span>
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
          isGuestMode={isGuest}
          guestSelections={guestSelections}
          onGuestMealQuantityChange={handleGuestMealQuantityChange}
          onGuestNonMealChange={handleGuestNonMealChange}
          pastDayIds={pastDayIds}
          todayDayId={todayDayId}
          isScheduleClosed={isScheduleClosed && !isAdminOrHr}
          closedMessage={
            weekMenuSchedule
              ? `Meal selection for this week is ${weekMenuSchedule.status.toLowerCase()}. You can view your selections below.`
              : 'Meal selection for this week is closed.'
          }
          mode={
            isScheduleClosed && !isAdminOrHr
              ? 'view'
              : isTargetUserAlreadySelected
              ? 'view'
              : 'select'
          }
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
                Please confirm the food choices for{' '}
                <span className="font-semibold text-slate-800">guests</span>{' '}
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
            {isGuest ? (
              <div className="flex flex-col gap-2 border-2 rounded-xl border-gray-200 divide-y divide-gray-100 max-h-60 overflow-y-auto p-1">
                {menuDays.map((day) => {
                  const daySel = guestSelections[day.id];
                  const dayName = day.day || `Day ${day.id}`;
                  if (!daySel) return null;
                  if (daySel.nonMeal === 'UNAVAILABLE') {
                    return (
                      <div key={day.id} className="flex flex-col p-2.5">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{dayName}</span>
                        <span className="text-sm font-medium text-slate-700">Unavailable</span>
                      </div>
                    );
                  }
                  if (daySel.nonMeal === 'HOLIDAY') {
                    return (
                      <div key={day.id} className="flex flex-col p-2.5">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{dayName}</span>
                        <span className="text-sm font-medium text-slate-700">Holiday</span>
                      </div>
                    );
                  }
                  const activeItems = Object.entries(daySel.mealQuantities).filter(([_, qty]) => qty > 0);
                  return (
                    <div key={day.id} className="flex flex-col p-2.5">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{dayName}</span>
                      <div className="flex flex-col gap-1 mt-1">
                        {activeItems.map(([dayMealIdStr, qty]) => {
                          const mealObj = menuDayMealsById.get(Number(dayMealIdStr))?.meal;
                          return (
                            <div key={dayMealIdStr} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-slate-800">{mealObj?.name || 'Meal'}</span>
                              <span className="rounded bg-primary-light px-2 py-0.5 text-xs font-bold text-primary border border-primary/20">
                                Qty: {qty}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-2 rounded-md border-gray-200">
                {selectedMeals.map((item) => (
                  <div key={item.menuDayId} className="flex flex-col border-b p-2 border-gray-100 last:border-0">
                    <span className="text-xs text-slate-500">{item.dayName}</span>
                    <span className="text-base">{item.mealName}</span>
                  </div>
                ))}
              </div>
            )}
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
              ? 'guests'
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
