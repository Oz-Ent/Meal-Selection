import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarCheck,
  Check,
  CheckCircle2,
  Copy,
  GripVertical,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
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
  useCreateWeekScheduleMutation,
  useDeleteMenuMutation,
  useMenusQuery,
  useUpdateMenuMutation,
  useUpdateWeekScheduleMutation,
  useWeekSchedulesQuery,
} from '../../../api/useApiQueries';
import { getISOWeekAndYear } from '../../../utils/dateHelpers';

const MENU_ORDER_STORAGE_KEY = 'admin_menu_order';

function getStoredMenuOrder(): number[] {
  try {
    const raw = localStorage.getItem(MENU_ORDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMenuOrder(ids: number[]) {
  try {
    localStorage.setItem(MENU_ORDER_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function Menu() {
  const navigate = useNavigate();
  const menusQuery = useMenusQuery();
  const weekSchedulesQuery = useWeekSchedulesQuery();
  const updateMenuMutation = useUpdateMenuMutation();
  const deleteMenuMutation = useDeleteMenuMutation();
  const createMenuWithAssignmentsMutation = useCreateMenuWithAssignmentsMutation();
  const createWeekScheduleMutation = useCreateWeekScheduleMutation();
  const updateWeekScheduleMutation = useUpdateWeekScheduleMutation();

  const [isNewMenuModalOpen, setIsNewMenuModalOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');

  const [openKebabMenuId, setOpenKebabMenuId] = useState<number | null>(null);

  const [renameMenu, setRenameMenu] = useState<MenuRecord | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [deleteMenu, setDeleteMenu] = useState<MenuRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [duplicatingMenuId, setDuplicatingMenuId] = useState<number | null>(null);

  const [orderedMenuIds, setOrderedMenuIds] = useState<number[]>(() => getStoredMenuOrder());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  const pointerDragRef = useRef<{
    isPointerDown: boolean;
    pointerId: number | null;
    startIndex: number | null;
    currentIndex: number | null;
  }>({
    isPointerDown: false,
    pointerId: null,
    startIndex: null,
    currentIndex: null,
  });

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
  const activeMenus = useMemo(() => rawMenus.filter((m) => m?.isActive), [rawMenus]);

  const menus = useMemo(() => {
    if (activeMenus.length === 0) return [];
    const idMap = new Map(activeMenus.map((m) => [m.id, m]));
    const sorted: MenuRecord[] = [];

    orderedMenuIds.forEach((id) => {
      const m = idMap.get(id);
      if (m) {
        sorted.push(m);
        idMap.delete(id);
      }
    });

    const remaining = Array.from(idMap.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    sorted.push(...remaining);

    return sorted;
  }, [activeMenus, orderedMenuIds]);

  const rawSchedules = Array.isArray(weekSchedulesQuery.data) ? weekSchedulesQuery.data : [];
  const currentSchedule: WeekMenuSchedule | null =
    rawSchedules.find((schedule) => schedule.week === week && schedule.year === year) ?? null;

  // Auto-scheduled menu index according to loop formula (week % activeMenus.length)
  const autoMenuIndex = menus.length > 0 ? week % menus.length : 0;
  const autoMenu = menus[autoMenuIndex];

  // If a schedule exists in DB and is active, use that. Otherwise, default to auto-loop menu for this week.
  const activeScheduledMenuId =
    currentSchedule?.status === 'ACTIVE' ? currentSchedule.menu.id : null;
  const activeMenuId = activeScheduledMenuId ?? autoMenu?.id;
  const isManuallyOverridden =
    Boolean(currentSchedule) && currentSchedule?.menu.id !== autoMenu?.id;

  const isDuplicating = duplicatingMenuId !== null || createMenuWithAssignmentsMutation.isPending;
  const isLoading = menusQuery.isLoading || weekSchedulesQuery.isLoading || isDuplicating;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  const reorderMenus = async (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= menus.length ||
      toIndex >= menus.length
    ) {
      return;
    }

    const reordered = [...menus];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);

    const newOrderIds = reordered.map((m) => m.id);
    setOrderedMenuIds(newOrderIds);
    saveMenuOrder(newOrderIds);

    showToast('success', 'Menu order updated successfully.');

    // Sync order attribute to backend to update cron job loop order
    try {
      await Promise.all(
        reordered.map((m, idx) =>
          updateMenuMutation.mutateAsync({
            id: m.id,
            data: { title: m.title, order: idx + 1 },
          }),
        ),
      );
    } catch (err) {
      console.error('Failed to sync menu order to backend:', err);
    }
  };

  // Pointer / Touch Drag & Drop handlers
  const handlePointerDownHandle = (
    e: React.PointerEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    isDraggingRef.current = true;
    setDraggedIndex(index);
    setDragOverIndex(index);

    pointerDragRef.current = {
      isPointerDown: true,
      pointerId: e.pointerId,
      startIndex: index,
      currentIndex: index,
    };
  };

  const handlePointerMoveHandle = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerDragRef.current.isPointerDown) return;
    e.preventDefault();

    const element = document.elementFromPoint(e.clientX, e.clientY);
    const cardElement = element?.closest('[data-menu-index]');
    if (cardElement) {
      const rawIdx = cardElement.getAttribute('data-menu-index');
      if (rawIdx !== null) {
        const targetIdx = parseInt(rawIdx, 10);
        if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < menus.length) {
          if (pointerDragRef.current.currentIndex !== targetIdx) {
            pointerDragRef.current.currentIndex = targetIdx;
            setDragOverIndex(targetIdx);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate(20);
              } catch {
                // ignore
              }
            }
          }
        }
      }
    }

    // Auto-scroll near edges on mobile
    const scrollThreshold = 70;
    if (e.clientY < scrollThreshold) {
      window.scrollBy({ top: -8, behavior: 'smooth' });
    } else if (e.clientY > window.innerHeight - scrollThreshold) {
      window.scrollBy({ top: 8, behavior: 'smooth' });
    }
  };

  const handlePointerUpHandle = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerDragRef.current.isPointerDown) return;
    e.preventDefault();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const { startIndex, currentIndex } = pointerDragRef.current;
    pointerDragRef.current = {
      isPointerDown: false,
      pointerId: null,
      startIndex: null,
      currentIndex: null,
    };

    setDraggedIndex(null);
    setDragOverIndex(null);

    if (startIndex !== null && currentIndex !== null && startIndex !== currentIndex) {
      void reorderMenus(startIndex, currentIndex);
    }

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const handlePointerCancelHandle = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerDragRef.current.isPointerDown) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    pointerDragRef.current = {
      isPointerDown: false,
      pointerId: null,
      startIndex: null,
      currentIndex: null,
    };

    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  // HTML5 Drag & Drop handlers (Desktop mouse)
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    isDraggingRef.current = true;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const fromIndex = draggedIndex;
    setDraggedIndex(null);
    setDragOverIndex(null);

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);

    if (fromIndex !== null && fromIndex !== dropIndex) {
      await reorderMenus(fromIndex, dropIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  };

  const handleSetActiveForWeek = async (menuToActivate: MenuRecord) => {
    setOpenKebabMenuId(null);
    try {
      if (currentSchedule) {
        await updateWeekScheduleMutation.mutateAsync({
          id: currentSchedule.id,
          data: { menuId: menuToActivate.id, status: 'ACTIVE' },
        });
      } else {
        await createWeekScheduleMutation.mutateAsync({
          week,
          year,
          menuId: menuToActivate.id,
        });
      }
      showToast('success', `"${menuToActivate.title}" is now active for Week ${week}.`);
    } catch (error) {
      console.error('Failed to set active menu for week:', error);
      showToast('error', 'Failed to set active menu for this week. Please try again.');
    }
  };

  const handleRevertToLoop = async () => {
    setOpenKebabMenuId(null);
    if (!autoMenu) return;
    try {
      if (currentSchedule) {
        await updateWeekScheduleMutation.mutateAsync({
          id: currentSchedule.id,
          data: { menuId: autoMenu.id, status: 'ACTIVE' },
        });
      }
      showToast('success', `Reverted to scheduled loop ("${autoMenu.title}" for Week ${week}).`);
    } catch (error) {
      console.error('Failed to revert menu schedule:', error);
      showToast('error', 'Failed to revert to scheduled loop. Please try again.');
    }
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
              const isActive = menu.id === activeMenuId;
              const isBeingDragged = draggedIndex === index;
              const isDragTarget = dragOverIndex === index && draggedIndex !== index;

              return (
                <div
                  key={menu.id}
                  data-menu-index={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => void handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (!isDraggingRef.current) {
                      navigate(`/admin/menu/edit/${menu.id}`);
                    }
                  }}
                  className={`group relative flex items-center justify-between rounded-3xl border p-4 sm:p-5 shadow-2xs cursor-grab active:cursor-grabbing transition-all select-none ${
                    isBeingDragged
                      ? 'opacity-40 scale-[0.98] border-dashed border-primary/50 bg-primary/5 shadow-none'
                      : isDragTarget
                      ? 'border-primary ring-2 ring-primary/40 bg-primary/5 scale-[1.02] shadow-md'
                      : 'border-slate-100 bg-white hover:shadow-md hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      aria-label={`Drag to reorder ${menu.title}`}
                      title="Drag to reorder"
                      onPointerDown={(e) => handlePointerDownHandle(e, index)}
                      onPointerMove={handlePointerMoveHandle}
                      onPointerUp={handlePointerUpHandle}
                      onPointerCancel={handlePointerCancelHandle}
                      onClick={(e) => e.stopPropagation()}
                      className="touch-none p-1.5 -m-1.5 rounded-lg text-slate-300 group-hover:text-slate-500 hover:bg-slate-100/80 active:text-primary active:bg-primary/10 transition-colors cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center"
                    >
                      <GripVertical size={18} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {menu.title}
                      </h3>
                      {isActive && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Active
                          </span>
                          {isManuallyOverridden && currentSchedule?.menu.id === menu.id ? (
                            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded font-medium">
                              Manual
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                              Auto loop
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 shrink-0"
                    draggable={false}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 transition-colors group-hover:bg-slate-200/80">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      aria-label="More options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenKebabMenuId(openKebabMenuId === menu.id ? null : menu.id);
                      }}
                      className="p-1 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
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
                        className="absolute right-3 top-12 z-40 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl flex flex-col gap-0.5 font-sans"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenKebabMenuId(null);
                            navigate(`/admin/menu/edit/${menu.id}`);
                          }}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors"
                        >
                          <Pencil size={15} className="text-slate-500" />
                          <span>Edit / View menu</span>
                        </button>

                        {/* Move up / Move down for mobile and accessibility */}
                        {menus.length > 1 && (
                          <div className="border-y border-slate-100/60 my-0.5 py-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                setOpenKebabMenuId(null);
                                void reorderMenus(index, index - 1);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-left transition-colors"
                            >
                              <ArrowUp size={15} className="text-slate-500" />
                              <span>Move up</span>
                            </button>
                            <button
                              type="button"
                              disabled={index === menus.length - 1}
                              onClick={() => {
                                setOpenKebabMenuId(null);
                                void reorderMenus(index, index + 1);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-left transition-colors"
                            >
                              <ArrowDown size={15} className="text-slate-500" />
                              <span>Move down</span>
                            </button>
                          </div>
                        )}

                        {/* Set as Active for Current Week / Revert to Loop */}
                        {isActive ? (
                          isManuallyOverridden ? (
                            <button
                              type="button"
                              onClick={() => void handleRevertToLoop()}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 text-left transition-colors border-b border-slate-100/60"
                            >
                              <RotateCcw size={15} className="text-amber-600" />
                              <span>Revert to scheduled loop</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary bg-primary-light/40 rounded-lg border-b border-slate-100/60">
                              <CheckCircle2 size={15} className="text-primary shrink-0" />
                              <span>Active (Auto scheduled)</span>
                            </div>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleSetActiveForWeek(menu)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors border-b border-slate-100/60"
                          >
                            <CalendarCheck size={15} className="text-primary" />
                            <span>Set as active for this week</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setOpenKebabMenuId(null);
                            setRenameMenu(menu);
                            setRenameValue(menu.title);
                          }}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors"
                        >
                          <Pencil size={15} className="text-slate-500" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          disabled={duplicatingMenuId === menu.id}
                          onClick={() => void handleDuplicateMenu(menu)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left disabled:opacity-50 transition-colors"
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
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left transition-colors border-t border-slate-100/60"
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
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl pointer-events-none z-30 px-4 sm:px-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setNewMenuName('');
            setIsNewMenuModalOpen(true);
          }}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-secondary hover:bg-secondary-hover px-5 py-3.5 text-sm font-bold text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          <span>Add</span>
        </button>
      </div>

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
