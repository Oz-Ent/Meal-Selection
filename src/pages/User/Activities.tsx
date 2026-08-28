import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Search } from 'lucide-react';

import Modal from '../../components/Modal/Modal';
import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { WeeklyMealCarousel, type CarouselMealItem } from '../../components/WeeklyMealCarousel/WeeklyMealCarousel';
import MealForeground from '../../assets/MealForeground.webp';
import SelectMealIcon from '../../assets/admin/MenuIcon.webp';
import PresetsIcon from '../../assets/admin/PresetsIcon.webp';
import ClockIllustration from '../../assets/Clock Illustration.svg';
import ChipsIcon from '../../assets/chips.svg';
import MenuIcon from '../../assets/admin/MenuIcon.webp';

import { useAuth } from '../Auth/useAuth/useAuth';
import { days } from '../../utils/Enums/DayOfWeek';
import { useUsersQuery, useWeeklySelectionsQuery } from '../../api/useApiQueries';
import type { User } from '../../api/Services/UserServices';
import type { WeeklyUserMealSelection } from '../../api/Services/MealSelectionServices';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import MenuCard from '../../components/MenuCard/MenuCard';

export function UserActivities() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userId = profile?.user?.id;
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const selectionsQuery = useWeeklySelectionsQuery(userId, today);
  const usersQuery = useUsersQuery();
  const users = usersQuery.data ?? [];

  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForPicker, setSelectedUserForPicker] = useState<User | null>(null);

  const defaultCarouselIndex = useMemo(() => {
    const currentDayIndex = new Date().getDay() - 1; // 0 for Monday
    return currentDayIndex >= 0 && currentDayIndex < 5 ? currentDayIndex : 0;
  }, []);

  const carouselItems: CarouselMealItem[] = useMemo(() => {
    const rawData = selectionsQuery.data;
    if (!rawData) {
      return days.map((day, index) => ({
        day: index === defaultCarouselIndex ? 'Today' : day,
        dayName: day,
        mealName: 'No Meal Selected',
        imageUrl: MealForeground,
        hasSelection: false,
        isUnavailable: false,
        isHoliday: false,
        isToday: index === defaultCarouselIndex,
      }));
    }

    // Normalize different potential data structures (object with mealSelections, array of selections, wrapped in data)
    type RawMealSelection = Partial<WeeklyUserMealSelection> & {
      menuDay?: { day?: string };
      dayName?: string;
      day?: string;
      dayMeal?: { id?: number; meal?: { id?: number; name?: string; imagePath?: string } };
      dayMealId?: number;
      meal?: { id?: number; name?: string; imagePath?: string };
    };

    const mealSelectionsMap: Record<string, RawMealSelection> = {};
    const rawDataRecord = (rawData as unknown) as Record<string, unknown>;

    if (Array.isArray(rawData)) {
      for (const item of rawData as RawMealSelection[]) {
        const dayKey = (item.menuDay?.day || item.dayName || item.day || '')?.toString().toUpperCase();
        if (dayKey) {
          mealSelectionsMap[dayKey] = item;
        }
      }
    } else if (rawDataRecord.mealSelections && typeof rawDataRecord.mealSelections === 'object') {
      Object.assign(mealSelectionsMap, rawDataRecord.mealSelections as Record<string, RawMealSelection>);
    } else if (rawDataRecord.data && typeof rawDataRecord.data === 'object') {
      const dataObj = rawDataRecord.data as Record<string, unknown>;
      if (dataObj.mealSelections && typeof dataObj.mealSelections === 'object') {
        Object.assign(mealSelectionsMap, dataObj.mealSelections as Record<string, RawMealSelection>);
      } else if (Array.isArray(dataObj)) {
        for (const item of dataObj as RawMealSelection[]) {
          const dayKey = (item.menuDay?.day || item.dayName || item.day || '')?.toString().toUpperCase();
          if (dayKey) {
            mealSelectionsMap[dayKey] = item;
          }
        }
      }
    }

    const findSelectionForDay = (dayName: string) => {
      const target = dayName.toUpperCase();
      if (mealSelectionsMap[target]) return mealSelectionsMap[target];
      const foundKey = Object.keys(mealSelectionsMap).find(
        (key) => key.toUpperCase() === target
      );
      return foundKey ? mealSelectionsMap[foundKey] : undefined;
    };

    return days.map((day, index) => {
      const selection = findSelectionForDay(day);
      const isToday = index === defaultCarouselIndex;

      const selectionType = selection?.selectionType || (selection?.dayMeal ? 'MEAL' : undefined);
      const isUnavailable = selectionType === 'UNAVAILABLE' || selection?.mealName === 'Unavailable';
      const isHoliday = selectionType === 'HOLIDAY' || selection?.mealName === 'Holiday';

      const rawMealName =
        selection?.mealName ||
        selection?.dayMeal?.meal?.name ||
        selection?.meal?.name ||
        '';

      let displayName = 'No Meal Selected';
      if (isUnavailable) {
        displayName = 'Unavailable';
      } else if (isHoliday) {
        displayName = 'Holiday';
      } else if (rawMealName && rawMealName !== 'No Meal Selected' && rawMealName !== 'Not Selected') {
        displayName = rawMealName;
      }

      const imageUrl =
        selection?.mealImagePath ||
        (selection as unknown as { imageUrl?: string })?.imageUrl ||
        selection?.dayMeal?.meal?.imagePath ||
        (selection?.dayMeal?.meal as unknown as { imageUrl?: string })?.imageUrl ||
        selection?.meal?.imagePath ||
        (selection?.meal as unknown as { imageUrl?: string })?.imageUrl ||
        '';

      const hasSelection = Boolean(
        isUnavailable ||
        isHoliday ||
        (rawMealName && rawMealName !== 'No Meal Selected' && rawMealName !== 'Not Selected') ||
        selection?.mealID ||
        selection?.dayMealId ||
        selection?.dayMeal ||
        (selection?.id && displayName !== 'No Meal Selected')
      );

      return {
        day: isToday ? 'Today' : day,
        dayName: day,
        mealName: displayName,
        imageUrl,
        hasSelection,
        isUnavailable,
        isHoliday,
        isToday,
      };
    });
  }, [defaultCarouselIndex, selectionsQuery.data]);

  const hasSelections = useMemo(() => {
    return carouselItems.some((item) => item.hasSelection);
  }, [carouselItems]);

  const roleName = profile?.user?.roleName?.toLowerCase();
  const isAdminOrHr = roleName === 'admin' || roleName === 'hr';

  const openGuestSelection = () => {
    setIsSelectionOpen(false);
    navigate('/select-meal?isGuest=true');
  };

  const openSelfSelection = () => {
    setIsSelectionOpen(false);
    navigate('/select-meal');
  };

  const openOtherUserSelection = () => {
    setIsSelectionOpen(false);
    setUserSearchTerm('');
    setSelectedUserForPicker(null);
    setIsUserPickerOpen(true);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-28 text-text-primary font-sans">
      {/* Top Bar Header */}
    <TitleBar/>

      <div className="px-4 sm:px-6 pt-4 flex flex-col gap-5">
        {/* Banner Area */}
        <section className="w-full">
          {selectionsQuery.isLoading ? (
            /* Loading Progress Indicator replacing the carousel */
            <div
              data-testid="carousel-loading-indicator"
              className="flex min-h-36.25 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs"
              role="status"
              aria-label="Loading selections"
            >
              <div className="h-8 w-8">
                <LoadingSpinner />
              </div>
              <p className="text-sm font-medium text-slate-500">Loading your selections...</p>
            </div>
          ) : !hasSelections ? (
            /* When user HAS NO MEALS SELECTED / needs to plan */
            <div
              onClick={() => setIsSelectionOpen(true)}
              className="relative flex min-h-36.25 items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs overflow-hidden cursor-pointer transition-all hover:border-slate-200 hover:shadow-sm"
            >
              {/* Chips SVG icon top left */}
              <img
                src={ChipsIcon}
                alt=""
                className="absolute top-3 left-3.5 h-10 w-10 object-contain"
              />

              <div className="flex flex-col justify-center pt-8 max-w-50 sm:max-w-md">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Time To Plan Your Week!!
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Choose your meals for the upcoming week before the window closes.
                </p>
              </div>

              {/* 3D Clock Illustration right */}
              <div className="shrink-0 pl-2">
                <img
                  src={ClockIllustration}
                  alt="Clock Illustration"
                  className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
                />
              </div>
            </div>
          ) : (
            /* When meals ARE SELECTED by user (Dark Carousel Banner matching design) */
            <WeeklyMealCarousel
              items={carouselItems}
              defaultIndex={defaultCarouselIndex}
              onEdit={() => navigate('/select-meal')}
            />
          )}
        </section>

        {/* Activities Section */}
        <section className="w-full">
          <h2 className="mb-3 text-base font-bold text-text-primary">Activities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Select Meals */}
          <MenuCard
          label='Select Meals'
          subtitle='Pick dishes for the upcoming week for yourself or on behalf of other users.'
          onClick={() => setIsSelectionOpen(true)}
          icon={SelectMealIcon}
          />
            {/* Card 2: Preset Meals */}

          <MenuCard
          label="Preset Meals"
          subtitle='Create reusable dish combo templates to avoid repetitive meal selections.'
          path="/preset-meals"
          icon={PresetsIcon}
          />
          </div>
        </section>
      </div>

      {/* Select Meals Choice Sheet Modal */}
      <Modal
        isOpen={isSelectionOpen}
        onClose={() => setIsSelectionOpen(false)}
        variant="bottom"
        showCloseButton
      >
        <section className="p-4 py-10 text-msTextPrimary flex flex-col items-center text-center">
          <div className="mb-4 flex h-28 w-28 items-center justify-center">
            <img src={MenuIcon} alt="Menu" className="h-full w-full object-contain" />
          </div>
          <h2 className="mb-3 w-full text-left text-base font-bold text-slate-900">Select meals</h2>
          <button
            type="button"
            onClick={openSelfSelection}
            className="mb-2 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm font-medium hover:bg-slate-100"
          >
            <span>For yourself</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <button
            type="button"
            onClick={openOtherUserSelection}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm font-medium hover:bg-slate-100"
          >
            <span>For another user</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          {isAdminOrHr && (
            <button
              type="button"
              onClick={openGuestSelection}
              className="mt-2 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm font-medium hover:bg-slate-100"
            >
              <span>For guests</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          )}
        </section>
      </Modal>

      {/* Select User Modal Sheet */}
      <Modal
        isOpen={isUserPickerOpen}
        onClose={() => setIsUserPickerOpen(false)}
        variant="bottom"
        showCloseButton
      >
        <section className="p-4 pt-6 text-msTextPrimary flex flex-col font-sans w-full">
          <h2 className="mb-3 text-base font-bold text-slate-900">Select user</h2>

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
                const name = (u.name || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const refEmail = (u.referenceEmail || '').toLowerCase();
                return (
                  name.includes(query) ||
                  email.includes(query) ||
                  refEmail.includes(query)
                );
              })
              .map((user) => {
                const isSelected = selectedUserForPicker?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserForPicker(user)}
                    className={`flex w-full items-center justify-between p-3 rounded-xl text-left transition-colors ${
                      isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email || user.referenceEmail}</p>
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
            disabled={!selectedUserForPicker}
            onClick={() => {
              if (selectedUserForPicker) {
                setIsUserPickerOpen(false);
                navigate(`/select-meal?userId=${selectedUserForPicker.id}`);
              }
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:bg-primary-hover disabled:opacity-50"
          >
            <ArrowRight size={18} />
            <span>Continue</span>
          </button>
        </section>
      </Modal>


      {/* Bottom Navigation Bar */}
      <BottomNavbar activeTab="home" />
    </main>
  );
}
