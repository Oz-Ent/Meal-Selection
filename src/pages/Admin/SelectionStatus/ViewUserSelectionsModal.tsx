import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, ExternalLink } from 'lucide-react';
import Modal from '../../../components/Modal/Modal';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { useWeeklySelectionsQuery } from '../../../api/useApiQueries';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import { days } from '../../../utils/Enums/DayOfWeek';
import type { User } from '../../../api/Services/UserServices';

interface ViewUserSelectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  targetDateString: string;
  selectedWeek: number;
  selectedYear: number;
}

export function ViewUserSelectionsModal({
  isOpen,
  onClose,
  user,
  targetDateString,
  selectedWeek,
  selectedYear,
}: ViewUserSelectionsModalProps) {
  const navigate = useNavigate();
  const userId = user?.id;

  const selectionsQuery = useWeeklySelectionsQuery(
    isOpen && userId ? userId : undefined,
    targetDateString,
  );

  const mealSelectionsMap = useMemo(() => {
    const rawData = selectionsQuery.data;
    if (!rawData) return {};

    type RawMealItem = {
      menuDay?: { day?: string };
      dayName?: string;
      day?: string;
      dayMeal?: { id?: number; meal?: { id?: number; name?: string; imagePath?: string; calories?: number } };
      dayMealId?: number;
      meal?: { id?: number; name?: string; imagePath?: string; calories?: number };
      mealName?: string;
      mealImagePath?: string;
      selectionType?: 'MEAL' | 'UNAVAILABLE' | 'HOLIDAY';
    };

    const map: Record<string, RawMealItem> = {};

    if (Array.isArray(rawData)) {
      for (const item of rawData as RawMealItem[]) {
        const dayKey = (item.menuDay?.day || item.dayName || item.day || '')?.toString().toUpperCase();
        if (dayKey) map[dayKey] = item;
      }
    } else if (typeof rawData === 'object' && rawData !== null) {
      const record = (rawData as unknown) as Record<string, unknown>;
      if (record.mealSelections && typeof record.mealSelections === 'object') {
        Object.assign(map, record.mealSelections);
      }
    }

    return map;
  }, [selectionsQuery.data]);

  const isSelfSelected = useMemo(() => {
    const rawData = selectionsQuery.data;
    if (!rawData) return false;
    const createdById = rawData.createdById;
    const createdForId = rawData.createdForId ?? userId;
    return createdById !== null && createdById !== undefined && createdById === createdForId;
  }, [selectionsQuery.data, userId]);

  const selectedByOtherName = useMemo(() => {
    const rawData = selectionsQuery.data;
    if (!rawData) return null;
    const createdById = rawData.createdById;
    const createdForId = rawData.createdForId ?? userId;
    if (createdById !== null && createdById !== undefined && createdById !== createdForId) {
      return rawData.createdBy || 'another user';
    }
    return null;
  }, [selectionsQuery.data, userId]);

  if (!user) return null;

  const handleEditForUser = () => {
    onClose();
    navigate(
      `/select-meal?forSomeone=true&userId=${user.id}&week=${selectedWeek}&year=${selectedYear}`,
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="center" showCloseButton>
      <div className="p-4 sm:p-6 text-slate-900 max-w-lg mx-auto">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {user.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <p className="text-xs text-slate-500 truncate">
                Week {selectedWeek}, {selectedYear} Selections
              </p>
              {isSelfSelected ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Self-selected
                </span>
              ) : selectedByOtherName ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                  Selected by {selectedByOtherName}
                </span>
              ) : null}
            </div>
          </div>
          {!isSelfSelected && (
            <button
              type="button"
              onClick={handleEditForUser}
              className="flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <Utensils size={13} />
              <span>Edit Meals</span>
              <ExternalLink size={11} className="opacity-80" />
            </button>
          )}
        </div>

        {selectionsQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
            <p className="mt-3 text-xs text-slate-500">Loading user selections...</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto overscroll-contain pr-1">
            {days.map((day) => {
              const selection = mealSelectionsMap[day.toUpperCase()];
              const selectionType = selection?.selectionType || (selection?.dayMeal ? 'MEAL' : undefined);
              const isUnavailable = selectionType === 'UNAVAILABLE' || selection?.mealName === 'Unavailable';
              const isHoliday = selectionType === 'HOLIDAY' || selection?.mealName === 'Holiday';

              const mealName =
                selection?.mealName ||
                selection?.dayMeal?.meal?.name ||
                selection?.meal?.name ||
                (isUnavailable ? 'Unavailable' : isHoliday ? 'Holiday' : 'No selection');

              const imagePath =
                selection?.mealImagePath ||
                selection?.dayMeal?.meal?.imagePath ||
                selection?.meal?.imagePath ||
                FALLBACK_MEAL_IMAGE_URL;

              const calories =
                selection?.dayMeal?.meal?.calories || selection?.meal?.calories;

              return (
                <div
                  key={day}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 sm:p-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-12 text-xs font-bold text-slate-700 shrink-0">
                      {day.slice(0, 3)}
                    </span>

                    {!isUnavailable && !isHoliday && selection?.dayMeal && (
                      <img
                        src={imagePath}
                        alt={mealName}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover bg-slate-100"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {mealName}
                      </p>
                      {calories && !isUnavailable && !isHoliday ? (
                        <span className="text-[11px] text-slate-400">
                          {calories} kcal
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    {isUnavailable ? (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        Unavailable
                      </span>
                    ) : isHoliday ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Holiday
                      </span>
                    ) : selection?.dayMeal ? (
                      <span className="rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-bold text-primary">
                        Selected
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                        None
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
