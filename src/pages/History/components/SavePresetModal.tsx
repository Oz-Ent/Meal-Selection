import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/InputField/InputField';
import { useCreatePresetMutation } from '../../../api/useApiQueries';
import { menuService } from '../../../api/Services/MenuServices';
import { queryKeys } from '../../../api/queryKeys';
import type { UserWeeklyHistoryItem } from '../../../api/Services/MealSelectionServices';
import type { CreatePresetItemData } from '../../../api/Services/PresetServices';

interface SavePresetModalProps {
  presetModalItem: UserWeeklyHistoryItem | null;
  userId?: number;
  onClose: () => void;
  onSuccessToast: (message: string) => void;
  onErrorToast: (message: string) => void;
}

export function SavePresetModal({
  presetModalItem,
  userId,
  onClose,
  onSuccessToast,
  onErrorToast,
}: SavePresetModalProps) {
  const [presetNameInput, setPresetNameInput] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const queryClient = useQueryClient();
  const createPresetMutation = useCreatePresetMutation();

  useEffect(() => {
    if (presetModalItem) {
      setPresetNameInput(`${presetModalItem.menu?.title || 'Menu'} Preset`);
    }
  }, [presetModalItem]);

  const handleSavePreset = async () => {
    if (!presetModalItem) return;

    const trimmedName =
      presetNameInput.trim() || `${presetModalItem.menu?.title || 'Menu'} Preset`;
    const menuId = presetModalItem.menu.id;

    if (!userId || !menuId) {
      onErrorToast('User or menu information is missing.');
      return;
    }

    setIsSavingPreset(true);
    try {
      const [menuDays, menuDayMeals] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: queryKeys.menuDays(menuId),
          queryFn: () => menuService.getDays(menuId),
        }),
        queryClient.fetchQuery({
          queryKey: queryKeys.menuMeals(menuId, userId),
          queryFn: () => menuService.getMeals(menuId, userId),
        }),
      ]);

      const rawSelections = (presetModalItem.selection?.mealSelections as Record<
        string,
        {
          id?: number;
          mealName?: string;
          selectionType?: string;
          dayMealId?: number;
          menuDayId?: number;
          mealID?: number | null;
        }
      >) || {};

      const presetItems: CreatePresetItemData[] = [];

      for (const [dayName, sel] of Object.entries(rawSelections)) {
        if (!sel) continue;
        if (
          sel.selectionType === 'UNAVAILABLE' ||
          sel.selectionType === 'HOLIDAY' ||
          sel.mealName === 'Unavailable' ||
          sel.mealName === 'Holiday'
        ) {
          continue;
        }

        if (sel.menuDayId && sel.dayMealId) {
          presetItems.push({
            menuDayId: sel.menuDayId,
            dayMealId: sel.dayMealId,
          });
          continue;
        }

        const matchedDay = (Array.isArray(menuDays) ? menuDays : [])?.find(
          (d) => d.day?.toUpperCase() === dayName.toUpperCase(),
        );
        if (!matchedDay) continue;

        const matchedMeal = (Array.isArray(menuDayMeals) ? menuDayMeals : [])?.find(
          (m) =>
            m.menuDayId === matchedDay.id &&
            (m.id === sel.id ||
              m.id === sel.dayMealId ||
              m.meal?.id === sel.mealID ||
              (sel.mealName &&
                m.meal?.name?.trim().toLowerCase() === sel.mealName.trim().toLowerCase())),
        );

        if (matchedMeal) {
          presetItems.push({
            menuDayId: matchedDay.id,
            dayMealId: matchedMeal.id,
          });
        }
      }

      if (presetItems.length === 0) {
        onErrorToast('No valid meals found to save as preset.');
        setIsSavingPreset(false);
        onClose();
        return;
      }

      await createPresetMutation.mutateAsync({
        name: trimmedName,
        menuId,
        userId,
        presetItems,
      });

      onSuccessToast(`Preset "${trimmedName}" saved successfully`);
      onClose();
    } catch (error) {
      console.error('Failed to save preset from history:', error);
      onErrorToast('Failed to save preset. Please try again.');
    } finally {
      setIsSavingPreset(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(presetModalItem)}
      onClose={() => {
        if (!isSavingPreset) onClose();
      }}
      variant="center"
      showCloseButton={!isSavingPreset}
    >
      <div className="p-4 sm:p-6 flex flex-col text-text-primary font-sans w-full max-w-md gap-4 text-left">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-text-primary">Save as preset</h2>
          <p className="text-xs text-text-secondary mt-1">
            Save your meal selections from Week {presetModalItem?.week} (
            {presetModalItem?.menu.title}) as a reusable preset.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="preset-name-input"
            className="text-xs font-semibold text-text-secondary"
          >
            Preset Name
          </label>
          <InputField
            id="preset-name-input"
            value={presetNameInput}
            onChange={(e) => setPresetNameInput(e.target.value)}
            placeholder="Enter preset name"
            autoFocus
          />
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="outline"
            label="Cancel"
            onClick={onClose}
            disabled={isSavingPreset}
            className="flex-1"
          />
          <Button
            variant="primary"
            label="Save Preset"
            onClick={handleSavePreset}
            pending={isSavingPreset}
            disabled={isSavingPreset}
            className="flex-1"
          />
        </div>
      </div>
    </Modal>
  );
}
