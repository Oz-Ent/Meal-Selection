import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Edit2,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { NavBar } from '../../components/NavBar/NavBar';
import Modal from '../../components/Modal/Modal';
import { BottomToast, type ToastType } from '../../components/BottomToast/BottomToast';
import { LoadingOverlay } from '../../components/LoadingOverlay/LoadingOverlay';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import PresetIllustration from '../../assets/Preset Illustration.svg';
import MenuIllustration from '../../assets/Menu Illustration.svg';
import {
  useCreatePresetMutation,
  useDeletePresetMutation,
  useMenusQuery,
  usePresetsByUserQuery,
  useSetDefaultPresetMutation,
  useUpdatePresetMutation,
} from '../../api/useApiQueries';
import { presetService, type Preset } from '../../api/Services/PresetServices';
import { useAuth } from '../Auth/useAuth/useAuth';

export function PresetMeals() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userId = profile?.user?.id;

  const [isSelectMenuModalOpen, setIsSelectMenuModalOpen] = useState(false);
  const [activeMenuPresetId, setActiveMenuPresetId] = useState<number | null>(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [presetToRename, setPresetToRename] = useState<Preset | null>(null);

  const [loadingOverlay, setLoadingOverlay] = useState<{
    isLoading: boolean;
    message: string;
  }>({
    isLoading: false,
    message: '',
  });

  const [isRenaming, setIsRenaming] = useState(false);

  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: ToastType;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const menusQuery = useMenusQuery();
  const menus = menusQuery.data ?? [];
  const activeMenus = menus.filter((menu) => menu.isActive);

  const presetsQuery = usePresetsByUserQuery(userId);
  const presets = presetsQuery.data ?? [];

  const updatePresetMutation = useUpdatePresetMutation();
  const setDefaultPresetMutation = useSetDefaultPresetMutation();
  const deletePresetMutation = useDeletePresetMutation();
  const createPresetMutation = useCreatePresetMutation();

  const handleSelectMenu = (menuId: number) => {
    setIsSelectMenuModalOpen(false);
    const selectedMenu = menus.find((m) => m.id === menuId);
    navigate(`/preset-meals/create/${menuId}`, {
      state: { menuTitle: selectedMenu?.title, menu: selectedMenu },
    });
  };

  const handleOpenRename = (preset: Preset) => {
    setPresetToRename(preset);
    setRenameInput(preset.name || '');
    setActiveMenuPresetId(null);
    setIsRenameModalOpen(true);
  };

  const handleConfirmRename = async () => {
    if (!presetToRename || !renameInput.trim()) return;
    setIsRenaming(true);
    try {
      await updatePresetMutation.mutateAsync({
        id: presetToRename.id,
        data: { name: renameInput.trim() },
      });
      setIsRenameModalOpen(false);
      setToast({
        isOpen: true,
        type: 'success',
        message: 'Preset meal renamed successfully',
      });
    } catch (error) {
      console.error('Failed to rename preset:', error);
      setIsRenameModalOpen(false);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while renaming preset meal. Please try again.',
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleSetDefault = async (preset: Preset) => {
    setActiveMenuPresetId(null);
    setLoadingOverlay({ isLoading: true, message: 'Setting default preset...' });
    try {
      await setDefaultPresetMutation.mutateAsync(preset.id);
      setToast({
        isOpen: true,
        type: 'success',
        message: 'Preset meal set as default successfully',
      });
    } catch (error) {
      console.error('Failed to set default preset:', error);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while setting preset meal as default. Please try again.',
      });
    } finally {
      setLoadingOverlay({ isLoading: false, message: '' });
    }
  };

  const handleDuplicate = async (preset: Preset) => {
    setActiveMenuPresetId(null);
    setLoadingOverlay({ isLoading: true, message: 'Duplicating preset meal...' });
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

      setToast({
        isOpen: true,
        type: 'success',
        message: `${presetName} duplicated successfully`,
      });
    } catch (error) {
      console.error('Failed to duplicate preset:', error);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while duplicating preset meal. Please try again.',
      });
    } finally {
      setLoadingOverlay({ isLoading: false, message: '' });
    }
  };

  const handleDelete = async (preset: Preset) => {
    setActiveMenuPresetId(null);
    setLoadingOverlay({ isLoading: true, message: 'Deleting preset meal...' });
    try {
      await deletePresetMutation.mutateAsync(preset.id);
      setToast({
        isOpen: true,
        type: 'success',
        message: 'Preset meal deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete preset:', error);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Something went wrong while deleting preset meal. Please try again.',
      });
    } finally {
      setLoadingOverlay({ isLoading: false, message: '' });
    }
  };

  const isQueryLoading = presetsQuery.isLoading || menusQuery.isLoading;

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      {/* Header */}
      <NavBar title="Preset Meals" backUrl="/activities" />

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {isQueryLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 my-auto py-16">
            <div className="h-8 w-8">
              <LoadingSpinner />
            </div>
            <p className="text-sm text-slate-500">Loading presets...</p>
          </div>
        ) : presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-12 text-center">
            <img
              src={PresetIllustration}
              alt="Preset Illustration"
              className="w-56 h-auto max-h-48 object-contain mb-6"
            />
            <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
              There are no preset meals available, click on &ldquo;add&rdquo; to create a new preset
              menu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full text-left">
            {presets.map((preset) => {
              const menuObj = menus.find((m) => m.id === preset.menuId);
              const menuLabel = menuObj?.title || `Menu ${preset.menuId}`;
              const subtitle = preset.isDefault ? `${menuLabel} • Default` : menuLabel;
              const isMenuOpen = activeMenuPresetId === preset.id;

              return (
                <div key={preset.id} className="relative w-full">
                  <div
                    onClick={() =>
                      navigate(`/preset-meals/${preset.id}`, {
                        state: { presetName: preset.name, preset },
                      })
                    }
                    className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {preset.name || `Preset Menu ${preset.menuId}`}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
                    </div>

                    <button
                      type="button"
                      aria-label="Preset options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuPresetId(isMenuOpen ? null : preset.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Vertical Three-Dot Options Dropdown */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setActiveMenuPresetId(null)}
                      />
                      <div className="absolute right-2 top-12 z-40 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs text-slate-700 font-medium">
                        <button
                          type="button"
                          onClick={() => handleOpenRename(preset)}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-left"
                        >
                          <Edit2 size={15} className="text-slate-600 shrink-0" />
                          <span>Rename</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSetDefault(preset)}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-left border-t border-slate-100/60"
                        >
                          <CheckCircle2 size={15} className="text-slate-600 shrink-0" />
                          <span>Set as default</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(preset)}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-left border-t border-slate-100/60"
                        >
                          <Copy size={15} className="text-slate-600 shrink-0" />
                          <span>Duplicate preset meal</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(preset)}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-left text-red-600 border-t border-slate-100/60"
                        >
                          <Trash2 size={15} className="text-red-600 shrink-0" />
                          <span>Delete preset meal</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button "+ Add" */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl pointer-events-none z-30 px-4 sm:px-6 flex justify-end">
        <button
          type="button"
          aria-label="Add new preset menu"
          onClick={() => setIsSelectMenuModalOpen(true)}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-secondary hover:bg-secondary-hover px-5 py-3.5 text-sm font-bold text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add</span>
        </button>
      </div>

      {/* Bottom Sheet Modal: Select Menu */}
      <Modal
        isOpen={isSelectMenuModalOpen}
        onClose={() => setIsSelectMenuModalOpen(false)}
        variant="bottom"
        showCloseButton={true}
      >
        <div className="p-4 pt-2 flex flex-col text-slate-900 font-sans w-full">
          {/* Menu Burger Illustration */}
          <div className="flex justify-center mb-2">
            <img
              src={MenuIllustration}
              alt="Select Menu Illustration"
              className="w-28 h-24 object-contain m-10"
            />
          </div>

          <h2 className="text-base font-bold text-slate-900 mb-3 text-left">Select menu</h2>

          {menusQuery.isLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading menus...</div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {activeMenus.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => handleSelectMenu(menu.id)}
                  className="flex items-center justify-between w-full bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl hover:bg-slate-100 text-left transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-800">{menu.title}</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              ))}

              {activeMenus.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-500">
                  No menus available at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Rename preset menu */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        variant="bottom"
        showCloseButton={true}
      >
        <div className="p-4 pt-2 flex flex-col text-slate-900 font-sans w-full">
          <h2 className="text-base font-bold text-slate-900 mb-4 text-left">Rename preset menu</h2>

          <input
            type="text"
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
            placeholder="Enter preset menu name"
            className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400 mb-4"
            autoFocus
          />

          <button
            type="button"
            disabled={!renameInput.trim() || isRenaming}
            onClick={handleConfirmRename}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#20475b] py-3.5 text-sm font-semibold text-white hover:bg-[#19394b] disabled:bg-[#d0dbdf] disabled:text-white transition-colors"
          >
            {isRenaming ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            <span>Confirm</span>
          </button>
        </div>
      </Modal>

      {/* Global Loading Overlay for Full Screen Actions */}
      <LoadingOverlay isLoading={loadingOverlay.isLoading} message={loadingOverlay.message} />

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
