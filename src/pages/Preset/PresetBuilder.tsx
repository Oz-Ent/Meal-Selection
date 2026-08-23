import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { MealSelectionView, type DaySelectionValue } from '../../components/MealSelectionView/MealSelectionView';
import { BottomToast, type ToastType } from '../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Modal from '../../components/Modal/Modal';

import {
  useCreatePresetMutation,
  useMenuDaysQuery,
  useMenuMealsQuery,
  useMenuQuery,
} from '../../api/useApiQueries';
import { useAuth } from '../Auth/useAuth/useAuth';
import type { MenuDay } from '../../api/Services/MenuServices';

export function PresetBuilder() {
  const navigate = useNavigate();
  const params = useParams<{ menuId?: string }>();
  const [searchParams] = useSearchParams();
  const menuId = Number(params.menuId) || Number(searchParams.get('menuId')) || 0;
  const { profile } = useAuth();

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, DaySelectionValue>>({});
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');
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

  const menuQuery = useMenuQuery(menuId);
  const menuDaysQuery = useMenuDaysQuery(menuId);
  const menuDayMealsQuery = useMenuMealsQuery(menuId);
  const createPresetMutation = useCreatePresetMutation();

  const menu = menuQuery.data;
  const menuDays: MenuDay[] = menuDaysQuery.data ?? [];
  const menuDayMeals = menuDayMealsQuery.data ?? [];

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

  const handleOpenNameModal = () => {
    if (Object.keys(selections).length === 0) {
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Please select at least one meal before saving the preset.',
      });
      return;
    }
    setPresetNameInput('');
    setIsNameModalOpen(true);
  };

  const handleCreatePreset = async () => {
    const userId = profile?.user?.id;
    const trimmedName = presetNameInput.trim();

    if (!userId || !menuId || !trimmedName) {
      return;
    }

    setIsSaving(true);
    try {
      const formattedItems = Object.entries(selections).map(([mDayId, dMealId]) => ({
        menuDayId: Number(mDayId),
        dayMealId: Number(dMealId),
      }));

      const createdPreset = await createPresetMutation.mutateAsync({
        name: trimmedName,
        menuId,
        userId,
        presetItems: formattedItems,
      });

      setIsNameModalOpen(false);
      navigate(`/preset-meals/${createdPreset.id}`, {
        state: { toastMessage: 'Preset meal created successfully' },
      });
    } catch (error) {
      console.error('Failed to create preset:', error);
      setIsNameModalOpen(false);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while creating preset meal. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading =
    menuQuery.isLoading || menuDaysQuery.isLoading || menuDayMealsQuery.isLoading;

  const menuTitle = menu?.title ? `Preset ${menu.title}` : `Preset Menu ${menuId}`;

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto bg-app-bg text-text-primary flex flex-col font-sans relative pb-28">
      {/* Page Header */}
      <header className="flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 sticky top-0 z-40 shadow-2xs">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate('/preset-meals')}
          className="p-1.5 rounded-full text-secondary hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 text-center flex-1 pr-2">{menuTitle}</h1>

        <button
          type="button"
          aria-label="Save Preset"
          onClick={handleOpenNameModal}
          disabled={Object.keys(selections).length === 0 || isLoading}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs disabled:opacity-40 transition-all cursor-pointer"
        >
          <Check size={14} strokeWidth={2.5} />
          <span>Save</span>
        </button>
      </header>

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
            No days or meals configured for this menu.
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
          showPresetButton={false}
          mode="select"
          onToast={(type, message) => setToast({ isOpen: true, type, message })}
        />
      )}

      {/* Modal: New preset menu */}
      <Modal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        variant="bottom"
        showCloseButton={true}
      >
        <div className="p-4 pt-2 flex flex-col text-slate-900 font-sans w-full">
          <h2 className="text-base font-bold text-slate-900 mb-4 text-left">New preset menu</h2>

          <input
            type="text"
            value={presetNameInput}
            onChange={(e) => setPresetNameInput(e.target.value)}
            placeholder="Enter preset menu name"
            className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400 mb-4"
            autoFocus
          />

          <button
            type="button"
            disabled={!presetNameInput.trim() || isSaving}
            onClick={handleCreatePreset}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 disabled:text-white transition-colors"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            <span>Create preset menu</span>
          </button>
        </div>
      </Modal>

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
