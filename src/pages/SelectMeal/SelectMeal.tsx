import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, Search } from 'lucide-react';
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(isForSomeone && !userIdParam);

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
  const menuDays: MenuDay[] = menuDaysQuery.data ?? [];
  const menuDayMeals = menuDayMealsQuery.data ?? [];
  const weeklyHolidays = weeklyHolidaysQuery.data ?? [];
  const currentUserId = profile?.user?.id;
  const targetUserId = isGuest ? null : selectedUser ? selectedUser.id : currentUserId;
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const weeklySelectionsQuery = useWeeklySelectionsQuery(
    targetUserId ?? undefined,
    today,
  );

  const initializedUserIdRef = useRef<number | null | undefined>(undefined);

  // Synchronize target user from URL param if available
  useEffect(() => {
    if (!userIdParam || users.length === 0) return;
    const target = users.find((u) => u.id === Number(userIdParam));
    if (target) {
      const timer = setTimeout(() => setSelectedUser(target), 0);
      return () => clearTimeout(timer);
    }
  }, [userIdParam, users]);

  // Reset initialized flag when targetUserId changes
  useEffect(() => {
    initializedUserIdRef.current = undefined;
  }, [targetUserId]);

  // Pre-populate holidays into selections
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

  // Pre-populate existing weekly selections if available for this week
  useEffect(() => {
    if (!menuDays.length || !menuDayMeals.length) return;

    const userMealSelections = weeklySelectionsQuery.data?.mealSelections;
    if (!userMealSelections || Object.keys(userMealSelections).length === 0) return;

    // Only pre-populate once per target user so user tweaks are preserved
    if (initializedUserIdRef.current === targetUserId) return;
    initializedUserIdRef.current = targetUserId;

    const loadedExistingIds: Record<number, number> = {};

    setSelections((prev) => {
      const next = { ...prev };
      let changed = false;

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
          if (next[day.id] !== 'HOLIDAY') {
            next[day.id] = 'HOLIDAY';
            changed = true;
          }
          continue;
        }

        if (existingSelection.selectionType === 'UNAVAILABLE') {
          if (next[day.id] !== 'UNAVAILABLE') {
            next[day.id] = 'UNAVAILABLE';
            changed = true;
          }
        } else if (existingSelection.selectionType === 'HOLIDAY') {
          if (next[day.id] !== 'HOLIDAY') {
            next[day.id] = 'HOLIDAY';
            changed = true;
          }
        } else if (existingSelection.mealID || existingSelection.mealName) {
          const matchingMeal = menuDayMeals.find(
            (item) =>
              item.menuDayId === day.id &&
              item.isActive &&
              (item.meal?.id === existingSelection.mealID ||
                (existingSelection.mealName &&
                  item.meal?.name?.toLowerCase() === existingSelection.mealName.toLowerCase())),
          );
          if (matchingMeal && next[day.id] !== matchingMeal.id) {
            next[day.id] = matchingMeal.id;
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });

    if (Object.keys(loadedExistingIds).length > 0) {
      setExistingSelectionIds((prev) => ({ ...prev, ...loadedExistingIds }));
    }
  }, [menuDays, menuDayMeals, weeklySelectionsQuery.data, weeklyHolidays, targetUserId]);

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
        (details as any).items &&
        typeof (details as any).items === 'object' &&
        menuDays.length > 0
      ) {
        for (const [dayName, item] of Object.entries((details as any).items)) {
          const itemObj = item as { dayMealId?: number };
          if (itemObj?.dayMealId) {
            const matchedDay = menuDays.find(
              (d) => d.day?.toUpperCase() === dayName?.toUpperCase(),
            );
            if (matchedDay && nextSelections[matchedDay.id] !== 'HOLIDAY') {
              nextSelections[matchedDay.id] = itemObj.dayMealId;
            }
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
    if (!weekMenuSchedule || (!isGuest && !targetUserId)) {
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while submitting choices. Please try again.',
      });
      setIsConfirmModalOpen(false);
      return;
    }

    const payload: CreateSelectionRequest[] = [];

    for (const mDay of menuDays) {
      const selection = selections[mDay.id];
      if (selection === undefined) continue;

      const targetUserId: number | null = isGuest
        ? null
        : selectedUser
          ? selectedUser.id
          : (currentUserId ?? null);
      const existingId = existingSelectionIds[mDay.id];

      if (selection === 'UNAVAILABLE') {
        payload.push({
          ...(existingId ? { id: existingId } : {}),
          dayMealId: null,
          selectionType: 'UNAVAILABLE',
          createdFor: targetUserId,
          ...(isGuest ? { guestCount: Math.max(1, guestCount) } : {}),
          weekMenuScheduleId: weekMenuSchedule.id,
          menuDayId: mDay.id,
        });
      } else if (selection === 'HOLIDAY') {
        payload.push({
          ...(existingId ? { id: existingId } : {}),
          dayMealId: null,
          selectionType: 'HOLIDAY',
          createdFor: targetUserId,
          ...(isGuest ? { guestCount: Math.max(1, guestCount) } : {}),
          weekMenuScheduleId: weekMenuSchedule.id,
          menuDayId: mDay.id,
        });
      } else {
        payload.push({
          ...(existingId ? { id: existingId } : {}),
          dayMealId: selection,
          selectionType: 'MEAL',
          createdFor: targetUserId,
          ...(isGuest ? { guestCount: Math.max(1, guestCount) } : {}),
          weekMenuScheduleId: weekMenuSchedule.id,
          menuDayId: mDay.id,
        });
      }
    }

    const isSelectionComplete =
      menuDays.length > 0 && menuDays.every((day) => selections[day.id] !== undefined);

    if (menuDays.length === 0 || !isSelectionComplete || payload.length !== menuDays.length) {
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
      const shouldUseAdminOverride = isAdminOrHr && (Boolean(selectedUser) || isGuest);
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

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto bg-app-bg text-text-primary flex flex-col font-sans relative pb-28">
      <div className="sr-only">
        <TitleBar />
      </div>

      {/* Full Page Header */}
      <header className="flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 sticky top-0 z-40 shadow-2xs">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate('/activities')}
          className="p-1.5 rounded-full text-secondary hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 text-center flex-1">Select Meal</h1>

        <button
          type="button"
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={!isSelectionComplete || isSubmitting || isLoading}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs disabled:opacity-40 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} strokeWidth={2.5} />
          )}
          <span>Save {menuDays.length > 0 ? `(${selectedCount}/${menuDays.length})` : ''}</span>
        </button>
      </header>

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

      {selectedUser && !isGuest && (
        <div className="bg-primary-light py-2 px-4 text-center text-xs font-semibold text-primary border-b border-slate-100">
          Selecting for: {selectedUser.name}
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
          <h3 className="text-lg font-bold mb-3 text-slate-900 text-left">Select user</h3>

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
            {users
              .filter((u) => {
                const query = userSearchTerm.trim().toLowerCase();
                if (!query) return true;
                return (
                  u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
                );
              })
              .map((user) => {
                const isSelected = selectedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className={`flex w-full items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    {isSelected && <Check size={18} className="text-slate-700 shrink-0" />}
                  </button>
                );
              })}
            {users.length === 0 && (
              <p className="text-sm text-slate-500 py-6 text-center">No users found.</p>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedUser}
            onClick={() => setIsUserModalOpen(false)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:bg-primary-hover disabled:opacity-50"
          >
            <ArrowRight size={18} />
            <span>Continue</span>
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
          <h3 className="text-xl font-bold mb-2.5 text-slate-900 text-left">Confirm Meal</h3>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed text-left">
            Please confirm that you are satisfied with your food choices for this week.
          </p>
          <div className="flex items-center gap-3 w-full mt-2">
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
