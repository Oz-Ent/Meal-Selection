import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Edit3, Loader2 } from 'lucide-react';
import { MealSelectionView, type DaySelectionValue } from '../../components/MealSelectionView/MealSelectionView';
import { BottomToast, type ToastType } from '../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

import {
  useMenuDaysQuery,
  useMenuMealsQuery,
  usePresetWithDetailsQuery,
  useUpdatePresetMutation,
} from '../../api/useApiQueries';
import type { MenuDay } from '../../api/Services/MenuServices';

export function PresetDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { presetId: presetIdParam } = useParams<{ presetId: string }>();
  const presetId = Number(presetIdParam) || 0;

  const [isEditing, setIsEditing] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, DaySelectionValue>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const presetQuery = usePresetWithDetailsQuery(presetId);
  const preset = presetQuery.data;
  const menuId = preset?.menuId ?? 0;

  const menuDaysQuery = useMenuDaysQuery(menuId);
  const menuDayMealsQuery = useMenuMealsQuery(menuId);
  const updatePresetMutation = useUpdatePresetMutation();

  const menuDays: MenuDay[] = menuDaysQuery.data ?? [];
  const menuDayMeals = menuDayMealsQuery.data ?? [];

  // Handle toast from navigation state (e.g. from preset creation)
  useEffect(() => {
    if (location.state && typeof location.state.toastMessage === 'string') {
      setToast({
        isOpen: true,
        type: 'success',
        message: location.state.toastMessage,
      });
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Populate selections from preset details when preset data or menuDays are loaded
  useEffect(() => {
    if (!preset) return;

    const initialMap: Record<number, DaySelectionValue> = {};

    // 1. Check presetItems array
    if (Array.isArray(preset.presetItems) && preset.presetItems.length > 0) {
      for (const item of preset.presetItems) {
        if (item.menuDayId && item.dayMealId) {
          initialMap[item.menuDayId] = item.dayMealId;
        } else if (item.menuDay?.day && item.dayMealId) {
          const matchedDay = menuDays.find(
            (d) => d.day.toUpperCase() === item.menuDay.day.toUpperCase(),
          );
          if (matchedDay) {
            initialMap[matchedDay.id] = item.dayMealId;
          }
        }
      }
    }

    // 2. Fallback: check items object (keyed by day name)
    if (
      Object.keys(initialMap).length === 0 &&
      (preset as any).items &&
      typeof (preset as any).items === 'object' &&
      menuDays.length > 0
    ) {
      for (const [dayName, item] of Object.entries((preset as any).items)) {
        const itemObj = item as { dayMealId?: number };
        if (itemObj?.dayMealId) {
          const matchedDay = menuDays.find(
            (d) => d.day.toUpperCase() === dayName.toUpperCase(),
          );
          if (matchedDay) {
            initialMap[matchedDay.id] = itemObj.dayMealId;
          }
        }
      }
    }

    setSelections(initialMap);
  }, [preset, menuDays]);

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
    setSelections({});
  };

  const handleSaveChanges = async () => {
    if (!preset) return;
    setIsSaving(true);
    try {
      const formattedItems = Object.entries(selections)
        .filter(([, dMealId]) => typeof dMealId === 'number' && dMealId > 0)
        .map(([mDayId, dMealId]) => ({
          menuDayId: Number(mDayId),
          dayMealId: Number(dMealId),
        }));

      await updatePresetMutation.mutateAsync({
        id: presetId,
        data: {
          presetItems: formattedItems,
        },
      });

      setIsEditing(false);
      setToast({
        isOpen: true,
        type: 'success',
        message: `Changes to ${preset.name || 'Preset'} saved successfully`,
      });
    } catch (error) {
      console.error('Failed to save preset changes:', error);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while updating preset meal. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading =
    presetQuery.isLoading || menuDaysQuery.isLoading || menuDayMealsQuery.isLoading;

  const presetTitle = isEditing
    ? `Editing ${preset?.name || 'Preset'}...`
    : preset?.name || `Preset Menu ${presetId}`;

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto bg-app-bg text-text-primary flex flex-col font-sans relative pb-28">
      {/* Page Header */}
      <header className="flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 sticky top-0 z-40 shadow-2xs">
        <button
          type="button"
          aria-label="Back"
          onClick={() => {
            if (isEditing) {
              setIsEditing(false);
            } else {
              navigate('/preset-meals');
            }
          }}
          className="p-1.5 rounded-full text-secondary hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 text-center flex-1 pr-2 truncate">
          {presetTitle}
        </h1>

        {!isLoading && (
          isEditing ? (
            <button
              type="button"
              aria-label="Save Changes"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs disabled:opacity-40 transition-all cursor-pointer"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} strokeWidth={2.5} />
              )}
              <span>Save</span>
            </button>
          ) : (
            <button
              type="button"
              aria-label="Edit Preset"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
          )
        )}
      </header>

      {/* Loading Progress Indicator */}
      {isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8">
            <LoadingSpinner />
          </div>
          <p className="text-sm text-slate-500">Loading preset details...</p>
        </div>
      )}

      {/* Empty / Error State */}
      {!isLoading && !preset && (
        <div className="flex flex-col items-center justify-center px-8 pt-20 text-center">
          <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
            Preset meal not found or could not be loaded.
          </p>
        </div>
      )}

      {/* Reusable Meal Selection View Component */}
      {!isLoading && preset && (
        <MealSelectionView
          menuDays={menuDays}
          menuDayMeals={menuDayMeals}
          selections={selections}
          onSelectionChange={handleSelectionChange}
          onClearDaySelection={handleClearDaySelection}
          onClearAllSelections={handleClearAllSelections}
          currentDayIndex={currentDayIndex}
          onDayIndexChange={setCurrentDayIndex}
          showPresetButton={false}
          mode={isEditing ? 'select' : 'view'}
          onToast={(type, message) => setToast({ isOpen: true, type, message })}
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
