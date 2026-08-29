import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
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
  Trash2,
} from 'lucide-react';

import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import { BottomToast } from '../../../components/BottomToast/BottomToast';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

import EmptyMenuSvg from '../../../assets/admin/EmptyMenuPage.svg';
import PresetIllustration from '../../../assets/Preset Illustration.svg';

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
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
import { getSchedulingWeekAndYear, formatWeekDateRange } from '../../../utils/dateHelpers';



export function Menu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const [confirmActivateMenu, setConfirmActivateMenu] = useState<MenuRecord | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const [duplicatingMenuId, setDuplicatingMenuId] = useState<number | null>(null);

  const [orderedMenuIds, setOrderedMenuIds] = useState<number[]>([]);
  const [hasUnsavedOrderChanges, setHasUnsavedOrderChanges] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);

  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);

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

  // Clear any legacy local storage key that might have overridden server menu order
  useEffect(() => {
    try {
      localStorage.removeItem('admin_menu_order');
    } catch {
      // ignore
    }
  }, []);

  // Warn on page reload or external navigation if order is unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedOrderChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedOrderChanges]);

  const { week, year, isNextWeek } = getSchedulingWeekAndYear();
  const activeMenus = useMemo(() => {
    const rawMenus = Array.isArray(menusQuery.data) ? menusQuery.data : [];
    return rawMenus
      .filter((m) => m?.isActive)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
  }, [menusQuery.data]);

  const menus = useMemo(() => {
    if (activeMenus.length === 0) return [];
    if (!hasUnsavedOrderChanges || orderedMenuIds.length === 0) {
      return activeMenus;
    }

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
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id,
    );
    sorted.push(...remaining);

    return sorted;
  }, [activeMenus, hasUnsavedOrderChanges, orderedMenuIds]);

  const rawSchedules = Array.isArray(weekSchedulesQuery.data) ? weekSchedulesQuery.data : [];
  const currentSchedule: WeekMenuSchedule | null =
    rawSchedules.find((schedule) => schedule.week === week && schedule.year === year) ?? null;

  // Active menu verified strictly from the backend week schedule (no modulo calculation)
  const activeMenuId =
    currentSchedule?.status === 'ACTIVE' ? currentSchedule.menu.id : null;

  const isDuplicating = duplicatingMenuId !== null || createMenuWithAssignmentsMutation.isPending;
  const isLoading = menusQuery.isLoading || weekSchedulesQuery.isLoading || isDuplicating;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToastState({ isOpen: true, type, message });
  };

  const navigateWithCheck = (path: string) => {
    if (hasUnsavedOrderChanges) {
      setPendingNavigationPath(path);
      setIsUnsavedChangesModalOpen(true);
    } else {
      navigate(path);
    }
  };

  // Reorder local state only (does NOT save until user explicitly confirms save)
  const reorderMenus = (fromIndex: number, toIndex: number) => {
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
    setHasUnsavedOrderChanges(true);
  };

  const handleConfirmSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      await Promise.all(
        menus.map((m, idx) =>
          updateMenuMutation.mutateAsync({
            id: m.id,
            data: { title: m.title, order: idx + 1 },
          }),
        ),
      );
      try {
        localStorage.removeItem('admin_menu_order');
      } catch {
        // ignore
      }
      setHasUnsavedOrderChanges(false);
      setOrderedMenuIds([]);
      setIsConfirmSaveModalOpen(false);
      showToast('success', 'Menu order saved successfully.');
    } catch (err) {
      console.error('Failed to sync menu order to backend:', err);
      showToast('error', 'Failed to save menu order. Please try again.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDiscardOrderChanges = () => {
    setOrderedMenuIds([]);
    setHasUnsavedOrderChanges(false);
    showToast('success', 'Order changes discarded.');
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
      reorderMenus(startIndex, currentIndex);
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const fromIndex = draggedIndex;
    setDraggedIndex(null);
    setDragOverIndex(null);

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);

    if (fromIndex !== null && fromIndex !== dropIndex) {
      reorderMenus(fromIndex, dropIndex);
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
    setIsActivating(true);
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
      setConfirmActivateMenu(null);
    } catch (error) {
      console.error('Failed to set active menu for week:', error);
      showToast('error', 'Failed to set active menu for this week. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  // Fri/Sat/Sun the work week has ended, so confirm before scheduling the
  // coming week; earlier weekdays activate immediately.
  const requestSetActiveForWeek = (menuToActivate: MenuRecord) => {
    setOpenKebabMenuId(null);
    if (isNextWeek) {
      setConfirmActivateMenu(menuToActivate);
    } else {
      void handleSetActiveForWeek(menuToActivate);
    }
  };

  const handleDuplicateMenu = async (menuToDuplicate: MenuRecord) => {
    if (duplicatingMenuId !== null || createMenuWithAssignmentsMutation.isPending) return;
    setOpenKebabMenuId(null);
    setDuplicatingMenuId(menuToDuplicate.id);
    try {
      const days = await queryClient.fetchQuery({
        queryKey: queryKeys.menuDays(menuToDuplicate.id),
        queryFn: () => menuService.getDays(menuToDuplicate.id),
      });
      const meals = await queryClient.fetchQuery({
        queryKey: queryKeys.menuMeals(menuToDuplicate.id),
        queryFn: () => menuService.getMeals(menuToDuplicate.id),
      });

      const mealIdsByDay: Record<string, number[]> = {};
      days.forEach((d) => {
        const dayMeals = meals.filter((m) => m.menuDayId === d.id && m.isActive);
        mealIdsByDay[d.day] = dayMeals.map((m) => m.meal.id);
      });

      const baseCopyTitle = `Copy_${menuToDuplicate.title}`;
      let copyTitle = baseCopyTitle;
      let counter = 2;
      const existingTitles = new Set(menus.map((m) => m.title.toLowerCase().trim()));
      while (existingTitles.has(copyTitle.toLowerCase().trim())) {
        copyTitle = `${baseCopyTitle} (${counter})`;
        counter++;
      }

      await createMenuWithAssignmentsMutation.mutateAsync({
        menu: { title: copyTitle },
        mealIdsByDay,
      });

      showToast('success', `"${copyTitle}" created successfully.`);
    } catch (error) {
      console.error('Failed to duplicate menu:', error);
      showToast('error', 'Failed to duplicate menu. Please try again.');
    } finally {
      setDuplicatingMenuId(null);
    }
  };

  const handleConfirmRename = async () => {
    if (!renameMenu || !renameValue.trim() || isRenaming) return;
    setIsRenaming(true);
    try {
      await updateMenuMutation.mutateAsync({
        id: renameMenu.id,
        data: { title: renameValue.trim() },
      });
      showToast('success', 'Menu renamed successfully.');
      setRenameMenu(null);
    } catch (error) {
      console.error('Failed to rename menu:', error);
      showToast('error', 'Failed to rename menu. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteMenu || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteMenuMutation.mutateAsync(deleteMenu.id);
      showToast('success', 'Menu deleted successfully.');
      setDeleteMenu(null);
    } catch (error) {
      console.error('Failed to delete menu:', error);
      showToast('error', 'Failed to delete menu. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      <NavBar title="Menu" backUrl="/admin/activities" />

      {/* UNSAVED CHANGES FLOATING BANNER */}
      {hasUnsavedOrderChanges && (
        <div className="sticky top-16 z-20 w-full px-4 sm:px-6 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 text-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-slate-200">
                You have unsaved changes to the menu order.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleDiscardOrderChanges}
                disabled={isSavingOrder}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmSaveModalOpen(true)}
                disabled={isSavingOrder}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-xs font-semibold text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Check size={14} />
                <span>Save order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading menus...</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && menus.length === 0 && (
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-4 flex h-36 w-36 items-center justify-center">
            <img
              src={EmptyMenuSvg}
              alt="No menus available"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="mb-1 text-base font-bold text-slate-900">No menus available</h2>
          <p className="text-xs text-slate-500 font-normal leading-relaxed">
            There are no menus, click on <span className="font-bold text-slate-900">“add”</span> to
            create a new menu.
          </p>
        </div>
      )}

      {/* MENUS LIST VIEW */}
      {!isLoading && menus.length > 0 && (
        <div className="px-4 sm:px-6 pt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Drag and reorder your menus to schedule how they repeat each week. Click <span className="font-semibold text-slate-700">Save order</span> when finished.
            </p>
          </div>

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
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (!isDraggingRef.current) {
                      navigateWithCheck(`/admin/menu/edit/${menu.id}`);
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
                          <span className="text-[10px] text-primary/90 bg-primary-light/60 px-1.5 py-0.2 rounded font-medium">
                            Week {week}
                          </span>
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
                            navigateWithCheck(`/admin/menu/edit/${menu.id}`);
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
                                reorderMenus(index, index - 1);
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
                                reorderMenus(index, index + 1);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-left transition-colors"
                            >
                              <ArrowDown size={15} className="text-slate-500" />
                              <span>Move down</span>
                            </button>
                          </div>
                        )}

                        {/* Set as Active for Current Week */}
                        {isActive ? (
                          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary bg-primary-light/40 rounded-lg border-b border-slate-100/60">
                            <CheckCircle2 size={15} className="text-primary shrink-0" />
                            <span>Active for Week {week}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => requestSetActiveForWeek(menu)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors border-b border-slate-100/60"
                          >
                            <CalendarCheck size={15} className="text-primary" />
                            <span>{isNextWeek ? 'Set as active for next week' : 'Set as active for this week'}</span>
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
            className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-slate-400 placeholder:text-slate-400 mb-4 bg-slate-50/50"
          />
          {newMenuName.trim() &&
            menus.some(
              (m) => m.title.toLowerCase().trim() === newMenuName.toLowerCase().trim(),
            ) && (
              <p className="text-xs text-red-500 mb-4 -mt-2">
                A menu with this name already exists.
              </p>
            )}
          <button
            type="button"
            disabled={
              !newMenuName.trim() ||
              menus.some(
                (m) => m.title.toLowerCase().trim() === newMenuName.toLowerCase().trim(),
              )
            }
            onClick={() => {
              const name = newMenuName.trim();
              if (name) {
                setIsNewMenuModalOpen(false);
                navigateWithCheck(`/admin/menu/add-menu/${encodeURIComponent(name)}`);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-40"
          >
            <ArrowRight size={18} />
            <span>Continue</span>
          </button>
        </section>
      </Modal>

      {/* CONFIRM SAVE ORDER MODAL */}
      <Modal
        isOpen={isConfirmSaveModalOpen}
        onClose={() => !isSavingOrder && setIsConfirmSaveModalOpen(false)}
        variant="bottom"
        showCloseButton={!isSavingOrder}
      >
        <section className="p-4 pt-6 text-text-primary flex flex-col font-sans w-full">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary shrink-0">
              <Check size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Save menu order?</h2>
          </div>
          <p className="mb-6 text-sm text-slate-600 leading-relaxed">
            This will update the weekly repeating menu sequence in the database.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSavingOrder}
              onClick={() => setIsConfirmSaveModalOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSavingOrder}
              onClick={() => void handleConfirmSaveOrder()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-50"
            >
              {isSavingOrder ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Check size={18} />
              )}
              <span>Save changes</span>
            </button>
          </div>
        </section>
      </Modal>

      {/* UNSAVED CHANGES LEAVING MODAL */}
      <Modal
        isOpen={isUnsavedChangesModalOpen}
        onClose={() => setIsUnsavedChangesModalOpen(false)}
        variant="bottom"
        showCloseButton
      >
        <section className="p-4 pt-6 text-text-primary flex flex-col font-sans w-full">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Unsaved changes</h2>
          </div>
          <p className="mb-6 text-sm text-slate-600 leading-relaxed">
            You have reordered menus without saving. If you leave now, your new menu sequence will be discarded.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setIsUnsavedChangesModalOpen(false);
                setPendingNavigationPath(null);
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Stay on page
            </button>
            <button
              type="button"
              onClick={() => {
                setIsUnsavedChangesModalOpen(false);
                setHasUnsavedOrderChanges(false);
                setOrderedMenuIds([]);
                const target = pendingNavigationPath;
                setPendingNavigationPath(null);
                if (target) {
                  navigate(target);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 py-3 text-sm font-semibold text-white shadow-xs transition-opacity"
            >
              <span>Discard & Leave</span>
            </button>
          </div>
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
            <img src={PresetIllustration} alt="Delete menu" className="h-full w-full object-contain" />
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

      {/* CONFIRM ACTIVATE FOR COMING WEEK MODAL */}
      <Modal
        isOpen={Boolean(confirmActivateMenu)}
        onClose={() => !isActivating && setConfirmActivateMenu(null)}
        variant="bottom"
        showCloseButton={!isActivating}
      >
        <section className="p-4 pt-6 text-text-primary flex flex-col font-sans w-full">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary shrink-0">
              <CalendarCheck size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Set active for the coming week?</h2>
          </div>
          <p className="mb-6 text-sm text-slate-600 leading-relaxed">
            This week has already ended, so{' '}
            <strong className="text-slate-900">{confirmActivateMenu?.title}</strong> will be set as
            active for the coming week — Week {week} ({formatWeekDateRange(week, year)}).
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isActivating}
              onClick={() => setConfirmActivateMenu(null)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isActivating}
              onClick={() => confirmActivateMenu && void handleSetActiveForWeek(confirmActivateMenu)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover py-3 text-sm font-semibold text-white shadow-xs transition-opacity disabled:opacity-50"
            >
              {isActivating ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Check size={18} />
              )}
              <span>Confirm</span>
            </button>
          </div>
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
