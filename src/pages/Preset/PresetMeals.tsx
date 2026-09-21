import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Edit2,
  Plus,
  Trash2,
} from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import { BottomToast, type ToastType } from '../../components/BottomToast/BottomToast';
import { LoadingOverlay } from '../../components/LoadingOverlay/LoadingOverlay';
import PresetIllustration from '../../assets/Preset Illustration.svg';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import InputField from '../../components/InputField/InputField';
import NavBar from '../../components/NavBar/NavBar';
import {
  useCreatePresetMutation,
  useDeletePresetMutation,
  useMenusQuery,
  usePresetsByUserQuery,
  useSetDefaultPresetMutation,
  useUpdatePresetMutation,
} from '../../api/useApiQueries';
import { presetService, type Preset } from '../../api/Services/PresetServices';
import { menuService } from '../../api/Services/MenuServices';
import ActionMenu from '../../components/ActionMenu/ActionMenu';
import { DefaultPresetWarningModal } from './components/DefaultPresetWarningModal';
import { useAuth } from '../Auth/useAuth/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

// --- State and Reducer Definitions ---

interface PresetMealsState {
  isSelectMenuModalOpen: boolean;
  renameModal: {
    isOpen: boolean;
    preset: Preset | null;
    input: string;
    isRenaming: boolean;
  };
  warningModal: {
    isOpen: boolean;
    preset: Preset | null;
    emptyDays: string[];
    isLoading: boolean;
  };
  loadingOverlay: {
    isLoading: boolean;
    message: string;
  };
  toast: {
    isOpen: boolean;
    type: ToastType;
    message: string;
  };
}

const initialState: PresetMealsState = {
  isSelectMenuModalOpen: false,
  renameModal: {
    isOpen: false,
    preset: null,
    input: '',
    isRenaming: false,
  },
  warningModal: {
    isOpen: false,
    preset: null,
    emptyDays: [],
    isLoading: false,
  },
  loadingOverlay: {
    isLoading: false,
    message: '',
  },
  toast: {
    isOpen: false,
    type: 'success',
    message: '',
  },
};

type PresetMealsAction =
  | { type: 'OPEN_SELECT_MENU' }
  | { type: 'CLOSE_SELECT_MENU' }
  | { type: 'OPEN_RENAME'; preset: Preset }
  | { type: 'SET_RENAME_INPUT'; input: string }
  | { type: 'START_RENAMING' }
  | { type: 'FINISH_RENAMING' }
  | { type: 'CLOSE_RENAME' }
  | { type: 'OPEN_WARNING_MODAL'; preset: Preset; emptyDays: string[] }
  | { type: 'SET_WARNING_LOADING'; isLoading: boolean }
  | { type: 'CLOSE_WARNING_MODAL' }
  | { type: 'SET_LOADING_OVERLAY'; isLoading: boolean; message?: string }
  | { type: 'SHOW_TOAST'; toastType: ToastType; message: string }
  | { type: 'HIDE_TOAST' };

function presetMealsReducer(
  state: PresetMealsState,
  action: PresetMealsAction,
): PresetMealsState {
  switch (action.type) {
    case 'OPEN_SELECT_MENU':
      return { ...state, isSelectMenuModalOpen: true };
    case 'CLOSE_SELECT_MENU':
      return { ...state, isSelectMenuModalOpen: false };
    case 'OPEN_RENAME':
      return {
        ...state,
        renameModal: {
          isOpen: true,
          preset: action.preset,
          input: action.preset.name || '',
          isRenaming: false,
        },
      };
    case 'SET_RENAME_INPUT':
      return {
        ...state,
        renameModal: {
          ...state.renameModal,
          input: action.input,
        },
      };
    case 'START_RENAMING':
      return {
        ...state,
        renameModal: {
          ...state.renameModal,
          isRenaming: true,
        },
      };
    case 'FINISH_RENAMING':
      return {
        ...state,
        renameModal: {
          ...state.renameModal,
          isRenaming: false,
          isOpen: false,
        },
      };
    case 'CLOSE_RENAME':
      return {
        ...state,
        renameModal: {
          isOpen: false,
          preset: null,
          input: '',
          isRenaming: false,
        },
      };
    case 'OPEN_WARNING_MODAL':
      return {
        ...state,
        warningModal: {
          isOpen: true,
          preset: action.preset,
          emptyDays: action.emptyDays,
          isLoading: false,
        },
      };
    case 'SET_WARNING_LOADING':
      return {
        ...state,
        warningModal: {
          ...state.warningModal,
          isLoading: action.isLoading,
        },
      };
    case 'CLOSE_WARNING_MODAL':
      return {
        ...state,
        warningModal: {
          isOpen: false,
          preset: null,
          emptyDays: [],
          isLoading: false,
        },
      };
    case 'SET_LOADING_OVERLAY':
      return {
        ...state,
        loadingOverlay: {
          isLoading: action.isLoading,
          message: action.message ?? '',
        },
      };
    case 'SHOW_TOAST':
      return {
        ...state,
        toast: {
          isOpen: true,
          type: action.toastType,
          message: action.message,
        },
      };
    case 'HIDE_TOAST':
      return {
        ...state,
        toast: {
          ...state.toast,
          isOpen: false,
        },
      };
    default:
      return state;
  }
}

export function PresetMeals() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userId = profile?.user?.id;

  const [state, dispatch] = useReducer(presetMealsReducer, initialState);

  const menusQuery = useMenusQuery();
  const menus = menusQuery.data ?? [];
  const activeMenus = menus.filter((menu) => menu.isActive);

  const presetsQuery = usePresetsByUserQuery(userId);
  const presets = presetsQuery.data ?? [];

  const updatePresetMutation = useUpdatePresetMutation();
  const setDefaultPresetMutation = useSetDefaultPresetMutation();
  const deletePresetMutation = useDeletePresetMutation();
  const createPresetMutation = useCreatePresetMutation();

  const isQueryLoading = presetsQuery.isLoading || menusQuery.isLoading;

  const handleSelectMenu = (menuId: number) => {
    dispatch({ type: 'CLOSE_SELECT_MENU' });
    navigate(`/preset-meals/create/${menuId}`);
  };

  const handleOpenRename = (preset: Preset) => {
    dispatch({ type: 'OPEN_RENAME', preset });
  };

  const handleConfirmRename = async () => {
    const { preset, input } = state.renameModal;
    if (!preset || !input.trim()) return;

    dispatch({ type: 'START_RENAMING' });
    try {
      await updatePresetMutation.mutateAsync({
        id: preset.id,
        data: { name: input.trim() },
      });
      dispatch({ type: 'FINISH_RENAMING' });
      dispatch({
        type: 'SHOW_TOAST',
        toastType: 'success',
        message: 'Preset meal renamed successfully',
      });
    } catch (error) {
      console.error('Failed to rename preset:', error);
      dispatch({ type: 'CLOSE_RENAME' });
      dispatch({
        type: 'SHOW_TOAST',
        toastType: 'error',
        message: 'Something went wrong while renaming preset meal. Please try again.',
      });
    }
  };

  const executeSetDefault = async (presetId: number) => {
    try {
      await setDefaultPresetMutation.mutateAsync(presetId);
      dispatch({
        type: 'SHOW_TOAST',
        toastType: 'success',
        message: 'Preset meal set as default successfully',
      });
    } catch (error) {
      console.error('Failed to set default preset:', error);
      dispatch({
        type: 'SHOW_TOAST',
        toastType: 'error',
        message: 'Something went wrong while setting preset meal as default. Please try again.',
      });
    }
  };

  const handleConfirmDefaultWarning = async () => {
    if (!state.warningModal.preset) return;
    dispatch({ type: 'SET_WARNING_LOADING', isLoading: true });
    try {
      await executeSetDefault(state.warningModal.preset.id);
      dispatch({ type: 'CLOSE_WARNING_MODAL' });
    } catch (error) {
      console.error('Failed to confirm default preset warning:', error);
      dispatch({ type: 'SET_WARNING_LOADING', isLoading: false });
    }
  };

  const handleSetDefault = async (preset: Preset) => {
    dispatch({
      type: 'SET_LOADING_OVERLAY',
      isLoading: true,
      message: 'Checking preset details...',
    });

    try {
      const [details, menuDays] = await Promise.all([
        presetService.getWithDetails(preset.id),
        menuService.getDays(preset.menuId),
      ]);

      const selectedDayIds = new Set<number>();
      if (Array.isArray(details.presetItems) && details.presetItems.length > 0) {
        for (const item of details.presetItems) {
          if (item.menuDayId) {
            selectedDayIds.add(item.menuDayId);
          } else if (item.menuDay?.day) {
            const matchedDay = menuDays.find(
              (d) => d.day?.toUpperCase() === item.menuDay.day.toUpperCase(),
            );
            if (matchedDay) {
              selectedDayIds.add(matchedDay.id);
            }
          }
        }
      }

      // Fallback: check items object
      const presetRecord = details as { items?: Record<string, { dayMealId?: number }> } | undefined;
      if (
        selectedDayIds.size === 0 &&
        presetRecord?.items &&
        typeof presetRecord.items === 'object' &&
        menuDays.length > 0
      ) {
        for (const [dayName, item] of Object.entries(presetRecord.items)) {
          const itemObj = item as { dayMealId?: number };
          if (itemObj?.dayMealId) {
            const matchedDay = menuDays.find(
              (d) => d.day?.toUpperCase() === dayName.toUpperCase(),
            );
            if (matchedDay) {
              selectedDayIds.add(matchedDay.id);
            }
          }
        }
      }

      const emptyDays = menuDays
        .filter((day) => !selectedDayIds.has(day.id))
        .map((day) => day.day);

      dispatch({ type: 'SET_LOADING_OVERLAY', isLoading: false });

      if (emptyDays.length > 0) {
        dispatch({ type: 'OPEN_WARNING_MODAL', preset, emptyDays });
      } else {
        dispatch({
          type: 'SET_LOADING_OVERLAY',
          isLoading: true,
          message: 'Setting default preset...',
        });
        await executeSetDefault(preset.id);
        dispatch({ type: 'SET_LOADING_OVERLAY', isLoading: false });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING_OVERLAY', isLoading: false });
      console.error('Failed to check preset details:', error);
      dispatch({
        type: 'SET_LOADING_OVERLAY',
        isLoading: true,
        message: 'Setting default preset...',
      });
      await executeSetDefault(preset.id);
      dispatch({ type: 'SET_LOADING_OVERLAY', isLoading: false });
    }
  };

  const handleDuplicate = async (preset: Preset) => {
    dispatch({
      type: 'SET_LOADING_OVERLAY',
      isLoading: true,
      message: 'Duplicating preset meal...',
    });

    try {
      const details = await presetService.getWithDetails(preset.id);
      const itemsToDuplicate =
        details.presetItems?.map((item) => ({
          menuDayId: item.menuDayId,
          dayMealId: item.dayMealId,
        })) ?? [];

      const presetName = preset.name || 'Preset';
      await createPresetMutation.mutateAsync({
        name: `Copy_${presetName}`,
        menuId: preset.menuId,
        userId: userId ?? preset.userId,
        presetItems: itemsToDuplicate,
      });

      dispatch({
        type: 'SHOW_TOAST',
        toastType: 'success',
        message: `${presetName} duplicated successfully`,
      });
    } catch (error) {
      console.error('Failed to duplicate preset:', error);
      dispatch({
        type: 'SHOW_TOAST',
        toastType: 'error',
        message: 'Something went wrong while duplicating preset meal. Please try again.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING_OVERLAY', isLoading: false });
    }
  };

  const handleDelete = async (preset: Preset) => {
    dispatch({
      type: 'SET_LOADING_OVERLAY',
      isLoading: true,
      message: 'Deleting preset meal...',
    });

    try {
      await deletePresetMutation.mutateAsync(preset.id);
      dispatch({
        type: 'SHOW_TOAST',
        toastType: 'success',
        message: 'Preset meal deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete preset:', error);
      dispatch({
        type: 'SHOW_TOAST',
        toastType: 'error',
        message: 'Something went wrong while deleting preset meal. Please try again.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING_OVERLAY', isLoading: false });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto bg-app-bg text-text-primary flex flex-col font-sans relative pb-20">
      {/* Navigation Header using standard NavBar component */}
      <NavBar title="Preset Meals" backUrl="/activities" />

      {/* Main Content */}
      <main className="p-4 sm:p-6 flex-1 flex flex-col">
        {isQueryLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 my-auto py-16">
            <div className="h-8 w-8">
              <LoadingSpinner />
            </div>
            <p className="text-sm text-text-secondary">Loading presets...</p>
          </div>
        ) : presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-12 text-center">
            <img
              src={PresetIllustration}
              alt="Preset Illustration"
              className="w-56 h-auto max-h-48 object-contain mb-6"
            />
            <p className="text-sm font-medium text-text-secondary max-w-xs leading-relaxed">
              There are no preset meals available, click on &ldquo;add&rdquo; to create a new preset
              menu.
            </p>
          </div>
        ) : (
          <div className="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
            {presets.map((preset) => {
              const menuObj = menus.find((m) => m.id === preset.menuId);
              const menuLabel = menuObj?.title || `Menu ${preset.menuId}`;
              return (
                <div key={preset.id} className="relative w-full">
                  <div
                    onClick={() =>
                      navigate(`/preset-meals/${preset.id}`, {
                        state: { presetName: preset.name, preset },
                      })
                    }
                    className="bg-surface border border-border p-4 rounded-2xl shadow-2xs flex items-center justify-between cursor-pointer hover:bg-surface-muted transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary">
                          {preset.name || `Preset Menu ${preset.menuId}`}
                        </h3>
                      </div>
                      <p className="text-xs text-text-secondary font-medium mt-0.5 flex items-center gap-2">
                        {menuLabel}
                        {preset.isDefault && (
                          <Badge variant="primary" size="xs" label="Default" />
                        )}
                      </p>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionMenu triggerAriaLabel="Preset options">
                        <ActionMenu.Item
                          icon={<Edit2 size={15} />}
                          onClick={() => handleOpenRename(preset)}
                        >
                          Rename
                        </ActionMenu.Item>

                        <ActionMenu.Item
                          icon={<CheckCircle2 size={15} />}
                          divider
                          onClick={() => handleSetDefault(preset)}
                        >
                          Set as default
                        </ActionMenu.Item>

                        <ActionMenu.Item
                          icon={<Copy size={15} />}
                          divider
                          onClick={() => handleDuplicate(preset)}
                        >
                          Duplicate preset
                        </ActionMenu.Item>

                        <ActionMenu.Item
                          icon={<Trash2 size={15} />}
                          variant="danger"
                          divider
                          onClick={() => handleDelete(preset)}
                        >
                          Delete preset
                        </ActionMenu.Item>
                      </ActionMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button "+ Add" */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          variant="secondary"
          icon={<Plus size={18} />}
          label="Add"
          type="button"
          aria-label="Add new preset menu"
          onClick={() => dispatch({ type: 'OPEN_SELECT_MENU' })}
          className="hover:scale-95"         
        />
      </div>

      {/* Bottom Sheet Modal: Select Menu */}
      <Modal
        isOpen={state.isSelectMenuModalOpen}
        onClose={() => dispatch({ type: 'CLOSE_SELECT_MENU' })}
        variant="bottom"
        showCloseButton={true}
      >
        <div className="p-4 pt-2 flex flex-col text-text-primary font-sans w-full">
          <div className="flex justify-center mb-2">
            <img
              src={PresetIllustration}
              alt="Select Menu Illustration"
              className="w-28 h-24 object-contain m-6"
            />
          </div>

          <h2 className="text-base font-bold text-text-primary mb-3 text-left">Select menu</h2>

          {menusQuery.isLoading ? (
            <div className="py-8 text-center text-sm text-text-muted flex flex-col items-center gap-2">
              <LoadingSpinner />
              <span>Loading menus...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {activeMenus.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => handleSelectMenu(menu.id)}
                  className="flex items-center justify-between w-full bg-surface-muted border border-border p-4 rounded-2xl hover:bg-surface text-left transition-colors cursor-pointer"
                >
                  <span className="text-sm font-semibold text-text-primary">{menu.title}</span>
                  <ChevronRight size={18} className="text-text-muted" />
                </button>
              ))}

              {activeMenus.length === 0 && (
                <div className="py-6 text-center text-sm text-text-muted">
                  No menus available at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Rename preset menu */}
      <Modal
        isOpen={state.renameModal.isOpen}
        onClose={() => dispatch({ type: 'CLOSE_RENAME' })}
        variant="bottom"
        showCloseButton={true}
      >
        <div className="p-4 pt-2 flex flex-col text-text-primary font-sans w-full gap-4">
          <h2 className="text-base font-bold text-text-primary text-left">Rename preset menu</h2>

          <InputField
            value={state.renameModal.input}
            onChange={(e) =>
              dispatch({ type: 'SET_RENAME_INPUT', input: e.target.value })
            }
            placeholder="Enter preset menu name"
            autoFocus
          />

          <Button
            variant="secondary"
            className="w-full"
            disabled={!state.renameModal.input.trim() || state.renameModal.isRenaming}
            pending={state.renameModal.isRenaming}
            label="Confirm"
            onClick={handleConfirmRename}
          />
        </div>
      </Modal>

      {/* Modal: Warning for Incomplete Default Preset */}
      <DefaultPresetWarningModal
        isOpen={state.warningModal.isOpen}
        onClose={() => dispatch({ type: 'CLOSE_WARNING_MODAL' })}
        onConfirm={handleConfirmDefaultWarning}
        presetName={state.warningModal.preset?.name || 'Preset'}
        emptyDays={state.warningModal.emptyDays}
        isLoading={state.warningModal.isLoading}
      />

      {/* Global Loading Overlay */}
      <LoadingOverlay
        isLoading={state.loadingOverlay.isLoading}
        message={state.loadingOverlay.message}
      />

      {/* Bottom Toast Banner */}
      <BottomToast
        isOpen={state.toast.isOpen}
        type={state.toast.type}
        message={state.toast.message}
        onClose={() => dispatch({ type: 'HIDE_TOAST' })}
      />
    </div>
  );
}

export default PresetMeals;
