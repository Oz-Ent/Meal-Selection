import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Copy,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import EmptyMenuSvg from '../../../assets/admin/EmptyMenuPage.svg';
import BurgerSvg from '../../../assets/admin/BurgeronAdminCard.svg';

import { type Menu as MenuRecord, menuService } from '../../../api/Services/MenuServices';
import { type WeekMenuSchedule } from '../../../api/Services/WeekMenuScheduleServices';
import {
  useCreateMenuWithAssignmentsMutation,
  useDeleteMenuMutation,
  useMenusQuery,
  useUpdateMenuMutation,
  useWeekSchedulesQuery,
} from '../../../api/useApiQueries';
import { getISOWeekAndYear } from '../../../utils/dateHelpers';

export function Menu() {
  const navigate = useNavigate();
  const menusQuery = useMenusQuery();
  const weekSchedulesQuery = useWeekSchedulesQuery();
  const updateMenuMutation = useUpdateMenuMutation();
  const deleteMenuMutation = useDeleteMenuMutation();
  const createMenuWithAssignmentsMutation = useCreateMenuWithAssignmentsMutation();

  const [isNewMenuModalOpen, setIsNewMenuModalOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');

  const [openKebabMenuId, setOpenKebabMenuId] = useState<number | null>(null);

  const [renameMenu, setRenameMenu] = useState<MenuRecord | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteMenu, setDeleteMenu] = useState<MenuRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [duplicatingMenuId, setDuplicatingMenuId] = useState<number | null>(null);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    message: '',
  });

  const { week, year } = getISOWeekAndYear();
  const rawMenus = Array.isArray(menusQuery.data) ? menusQuery.data : [];
  const menus = rawMenus.filter((m) => m?.isActive);
  const rawSchedules = Array.isArray(weekSchedulesQuery.data) ? weekSchedulesQuery.data : [];
  const currentSchedule: WeekMenuSchedule | null =
    rawSchedules.find((schedule) => schedule.week === week && schedule.year === year) ?? null;

  const isDuplicating = duplicatingMenuId !== null || createMenuWithAssignmentsMutation.isPending;
  const isLoading = menusQuery.isLoading || weekSchedulesQuery.isLoading || isDuplicating;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  const handleDuplicateMenu = async (menuToDuplicate: MenuRecord) => {
    setOpenKebabMenuId(null);
    setDuplicatingMenuId(menuToDuplicate.id);
    try {
      const days = await menuService.getDays(menuToDuplicate.id);
      const meals = await menuService.getMeals(menuToDuplicate.id);

      const mealIdsByDay: Record<string, number[]> = {};
      days.forEach((d) => {
        const dayMeals = meals.filter((m) => m.menuDayId === d.id && m.isActive);
        mealIdsByDay[d.day] = dayMeals.map((m) => m.meal.id);
      });

      const copyTitle = `Copy_${menuToDuplicate.title}`;
      await createMenuWithAssignmentsMutation.mutateAsync({
        menu: { title: copyTitle },
        mealIdsByDay,
      });

      showToast('success', `${menuToDuplicate.title} duplicated successfully.`);
    } catch {
      showToast(
        'error',
        `Something went wrong while duplicating ${menuToDuplicate.title.toLowerCase()}. Please try again.`,
      );
    } finally {
      setDuplicatingMenuId(null);
    }
  };

  const handleConfirmRename = async () => {
    if (!renameMenu || !renameValue.trim() || isRenaming) return;
    const targetMenu = renameMenu;
    setIsRenaming(true);
    try {
      await updateMenuMutation.mutateAsync({
        id: targetMenu.id,
        data: { title: renameValue.trim() },
      });
      setRenameMenu(null);
      showToast('success', 'Menu renamed successfully.');
    } catch {
      setRenameMenu(null);
      showToast('error', 'Something went wrong while renaming menu. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteMenu || isDeleting) return;
    const targetMenu = deleteMenu;
    setIsDeleting(true);
    try {
      await deleteMenuMutation.mutateAsync(targetMenu.id);
      setDeleteMenu(null);
      showToast('success', `${targetMenu.title} deleted successfully.`);
    } catch {
      setDeleteMenu(null);
      showToast(
        'error',
        `Something went wrong while deleting ${targetMenu.title.toLowerCase()}. Please try again.`,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      <NavBar title="All Menus" backUrl="/admin/activities" />

      {isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8">
            <LoadingSpinner />
          </div>
          <p className="text-sm text-slate-500">
            {isDuplicating ? 'Duplicating menu...' : 'Loading menus...'}
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && menus.length === 0 && (
        <div className="flex flex-col items-center justify-center px-8 pt-20 text-center">
          <img src={EmptyMenuSvg} alt="No menus" className="h-44 w-44 object-contain mb-6" />
          <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-64">
            There are no menus, click on <span className="font-bold text-slate-900">“add”</span> to
            create a new menu.
          </p>
        </div>
      )}

      {/* MENUS LIST VIEW */}
      {!isLoading && menus.length > 0 && (
        <div className="px-4 sm:px-6 pt-5">
          <p className="mb-4 text-xs sm:text-sm text-slate-500 font-normal">
            Drag and reorder your menus to schedule how they repeat each week.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menus.map((menu, index) => {
              const isActive =
                currentSchedule?.menu.id === menu.id && currentSchedule.status === 'ACTIVE';

              return (
                <div
                  key={menu.id}
                  onClick={() => navigate(`/admin/menu/edit/${menu.id}`)}
                  className="relative flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-2xs cursor-pointer hover:shadow-md hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <GripVertical
                      size={18}
                      className="text-slate-300 cursor-grab shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{menu.title}</h3>
                      {isActive && (
                        <span className="text-[11px] font-semibold text-primary">Active</span>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      aria-label="More options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenKebabMenuId(openKebabMenuId === menu.id ? null : menu.id);
                      }}
                      className="p-1 text-slate-600 hover:text-slate-900 rounded-lg"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Kebab Options Dropdown Popup */}
                  {openKebabMenuId === menu.id && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenKebabMenuId(null);
                        }}
                      />
                      <div
                        className="absolute right-3 top-12 z-40 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl flex flex-col gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenKebabMenuId(null);
                            navigate(`/admin/menu/edit/${menu.id}`);
                          }}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <Pencil size={15} className="text-slate-500" />
                          <span>Edit / View menu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenKebabMenuId(null);
                            setRenameMenu(menu);
                            setRenameValue(menu.title);
                          }}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <Pencil size={15} className="text-slate-500" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          disabled={duplicatingMenuId === menu.id}
                          onClick={() => void handleDuplicateMenu(menu)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left disabled:opacity-50"
                        >
                          {duplicatingMenuId === menu.id ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                          ) : (
                            <Copy size={15} className="text-slate-500" />
                          )}
                          <span>Duplicate menu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenKebabMenuId(null);
                            setDeleteMenu(menu);
                          }}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                        >
                          <Trash2 size={15} className="text-red-500" />
                          <span>Delete menu</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <button
        type="button"
        onClick={() => {
          setNewMenuName('');
          setIsNewMenuModalOpen(true);
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex items-center gap-2 rounded-full bg-secondary hover:bg-secondary-hover px-5 py-3.5 text-sm font-bold text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
      >
        <Plus size={18} />
        <span>Add</span>
      </button>

      {/* NEW MENU MODAL */}
      <Modal
        isOpen={isNewMenuModalOpen}
        onClose={() => setIsNewMenuModalOpen(false)}
        variant="bottom"
        showCloseButton
      >
        <section className="p-4 pt-6 text-text-primary flex flex-col font-sans w-full">
          <h2 className="mb-4 text-base font-bold text-slate-900">New menu</h2>
          <input
            type="text"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            placeholder="Enter menu name"
            className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400 mb-6 bg-slate-50/50"
          />
          <button
            type="button"
            disabled={!newMenuName.trim()}
            onClick={() => {
              const name = newMenuName.trim();
              if (name) {
                setIsNewMenuModalOpen(false);
                navigate(`/admin/menu/add-menu/${encodeURIComponent(name)}`);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-40"
          >
            <ArrowRight size={18} />
            <span>Continue</span>
          </button>
        </section>
      </Modal>

      {/* RENAME MENU MODAL */}
      <Modal
        isOpen={Boolean(renameMenu)}
        onClose={() => !isRenaming && setRenameMenu(null)}
        variant="bottom"
        showCloseButton={!isRenaming}
      >
        <section className="p-4 pt-6 text-text-primary flex flex-col font-sans w-full">
          <h2 className="mb-4 text-base font-bold text-slate-900">Rename menu</h2>
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            disabled={isRenaming}
            placeholder="Enter menu name"
            className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400 mb-6 bg-slate-50/50 disabled:opacity-50"
          />
          <button
            type="button"
            disabled={!renameValue.trim() || isRenaming}
            onClick={() => void handleConfirmRename()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-40"
          >
            {isRenaming ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check size={18} />
            )}
            <span>Confirm</span>
          </button>
        </section>
      </Modal>

      {/* DELETE MENU MODAL */}
      <Modal
        isOpen={Boolean(deleteMenu)}
        onClose={() => !isDeleting && setDeleteMenu(null)}
        variant="bottom"
        showCloseButton={!isDeleting}
      >
        <section className="p-4 pt-6 text-text-primary flex flex-col items-center text-center font-sans w-full">
          <div className="mb-3 flex h-24 w-24 items-center justify-center">
            <img src={BurgerSvg} alt="Delete menu" className="h-full w-full object-contain" />
          </div>
          <h2 className="mb-6 w-full text-left text-base font-bold text-slate-900">Delete menu</h2>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => void handleConfirmDelete()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-50"
          >
            {isDeleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check size={18} />
            )}
            <span>Save changes</span>
          </button>
        </section>
      </Modal>

      {/* BOTTOM TOAST NOTIFICATIONS */}
      <BottomToast
        isOpen={toastState.isOpen}
        type={toastState.type}
        message={toastState.message}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
      />
    </div>
  );
}
