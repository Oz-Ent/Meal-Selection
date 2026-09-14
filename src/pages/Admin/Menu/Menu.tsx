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
import Button from '../../../components/Button/Button';
import Badge from '../../../components/Badge/Badge';
import InputField from '../../../components/InputField/InputField';
import EmptyState from '../../../components/EmptyState/EmptyState';

import PresetIllustration from '../../../assets/Preset Illustration.svg';

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

    const menuMap = new Map<number, MenuRecord>();
    for (const m of activeMenus) {
      menuMap.set(m.id, m);
    }

    const result: MenuRecord[] = [];
    for (const id of orderedMenuIds) {
      const found = menuMap.get(id);
      if (found) {
        result.push(found);
        menuMap.delete(id);
      }
    }
    // append any missing
    for (const remaining of menuMap.values()) {
      result.push(remaining);
    }
    return result;
  }, [activeMenus, hasUnsavedOrderChanges, orderedMenuIds]);

  const weekSchedules: WeekMenuSchedule[] = Array.isArray(weekSchedulesQuery.data)
    ? weekSchedulesQuery.data
    : [];

  const currentWeekSchedule = useMemo(() => {
    return (
      weekSchedules.find(
        (s) => Number(s.week) === Number(week) && Number(s.year) === Number(year),
      ) ?? null
    );
  }, [weekSchedules, week, year]);

  const activeMenuId = currentWeekSchedule?.menu?.id ?? null;

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

  // Reorder helper
  const reorderMenus = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const nextList = [...menus];
    const [moved] = nextList.splice(fromIndex, 1);
    if (!moved) return;
    nextList.splice(toIndex, 0, moved);

    const newIds = nextList.map((m) => m.id);
    setOrderedMenuIds(newIds);
    setHasUnsavedOrderChanges(true);
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    isDraggingRef.current = true;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex;
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);

    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      reorderMenus(sourceIndex, targetIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  // Touch / Pointer Drag handlers
  const handlePointerDownHandle = (e: React.PointerEvent, index: number) => {
    pointerDragRef.current = {
      isPointerDown: true,
      pointerId: e.pointerId,
      startIndex: index,
      currentIndex: index,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMoveHandle = (e: React.PointerEvent) => {
    if (!pointerDragRef.current.isPointerDown) return;
    const clientY = e.clientY;
    const elem = document.elementFromPoint(e.clientX, clientY);
    const cardElem = elem?.closest('[data-menu-index]');
    if (cardElem) {
      const idxStr = cardElem.getAttribute('data-menu-index');
      if (idxStr !== null) {
        const hoverIdx = parseInt(idxStr, 10);
        if (!isNaN(hoverIdx) && hoverIdx !== pointerDragRef.current.currentIndex) {
          pointerDragRef.current.currentIndex = hoverIdx;
          setDragOverIndex(hoverIdx);
        }
      }
    }
  };

  const handlePointerUpHandle = (e: React.PointerEvent) => {
    if (!pointerDragRef.current.isPointerDown) return;
    const { startIndex, currentIndex } = pointerDragRef.current;
    pointerDragRef.current = {
      isPointerDown: false,
      pointerId: null,
      startIndex: null,
      currentIndex: null,
    };
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setDragOverIndex(null);
    setDraggedIndex(null);

    if (startIndex !== null && currentIndex !== null && startIndex !== currentIndex) {
      reorderMenus(startIndex, currentIndex);
    }
  };

  const handlePointerCancelHandle = (e: React.PointerEvent) => {
    pointerDragRef.current = {
      isPointerDown: false,
      pointerId: null,
      startIndex: null,
      currentIndex: null,
    };
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setDragOverIndex(null);
    setDraggedIndex(null);
  };

  const handleConfirmSaveOrder = async () => {
    if (!hasUnsavedOrderChanges || orderedMenuIds.length === 0) {
      setIsConfirmSaveModalOpen(false);
      return;
    }

    setIsSavingOrder(true);
    try {
      await Promise.all(
        orderedMenuIds.map((id, index) =>
          updateMenuMutation.mutateAsync({ id, data: { order: index + 1 } }),
        ),
      );
      setHasUnsavedOrderChanges(false);
      setOrderedMenuIds([]);
      setIsConfirmSaveModalOpen(false);
      showToast('success', 'Menu order saved successfully.');
    } catch {
      showToast('error', 'Failed to save menu order. Please try again.');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDiscardOrderChanges = () => {
    setHasUnsavedOrderChanges(false);
    setOrderedMenuIds([]);
    showToast('success', 'Order changes discarded.');
  };

  // Actions on individual menus
  const handleOpenRename = (menu: MenuRecord) => {
    setOpenKebabMenuId(null);
    setRenameMenu(menu);
    setRenameValue(menu.title);
  };

  const handleConfirmRename = async () => {
    if (!renameMenu || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await updateMenuMutation.mutateAsync({
        id: renameMenu.id,
        data: { title: renameValue.trim() },
      });
      setRenameMenu(null);
      showToast('success', 'Menu renamed successfully.');
    } catch {
      showToast('error', 'Failed to rename menu. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDuplicateMenu = async (menu: MenuRecord) => {
    setOpenKebabMenuId(null);
    setDuplicatingMenuId(menu.id);
    try {
      const copyTitle = `Copy_${menu.title}`;
      const [days, meals] = await Promise.all([
        menuService.getDays(menu.id),
        menuService.getMeals(menu.id),
      ]);

      const mealIdsByDay: Record<string, number[]> = {};
      for (const d of days) {
        mealIdsByDay[d.day] = meals
          .filter((m) => m.menuDayId === d.id && m.isActive)
          .map((m) => m.meal.id);
      }

      await createMenuWithAssignmentsMutation.mutateAsync({
        menu: { title: copyTitle },
        mealIdsByDay,
      });

      showToast('success', 'Menu duplicated successfully.');
    } catch {
      showToast('error', 'Failed to duplicate menu. Please try again.');
    } finally {
      setDuplicatingMenuId(null);
    }
  };

  const handleSetActiveClick = (menu: MenuRecord) => {
    setOpenKebabMenuId(null);
    if (isNextWeek) {
      setConfirmActivateMenu(menu);
    } else {
      void handleSetActiveForWeek(menu);
    }
  };

  const handleSetActiveForWeek = async (menu: MenuRecord) => {
    setIsActivating(true);
    try {
      if (currentWeekSchedule) {
        await updateWeekScheduleMutation.mutateAsync({
          id: currentWeekSchedule.id,
          data: { menuId: menu.id, status: 'ACTIVE' },
        });
      } else {
        await createWeekScheduleMutation.mutateAsync({
          menuId: menu.id,
          week,
          year,
        });
      }
      setConfirmActivateMenu(null);
      showToast('success', `Menu "${menu.title}" is now active for Week ${week}.`);
    } catch {
      showToast('error', 'Failed to set active menu. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleOpenDelete = (menu: MenuRecord) => {
    setOpenKebabMenuId(null);
    setDeleteMenu(menu);
  };

  const handleConfirmDelete = async () => {
    if (!deleteMenu) return;
    setIsDeleting(true);
    try {
      await deleteMenuMutation.mutateAsync(deleteMenu.id);
      setDeleteMenu(null);
      showToast('success', 'Menu deleted successfully.');
    } catch {
      showToast('error', 'Failed to delete menu. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading =
    menusQuery.isLoading ||
    weekSchedulesQuery.isLoading ||
    duplicatingMenuId !== null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-app-bg pb-28 text-text-primary font-sans relative">
      <NavBar title="Menu" backUrl="/admin/activities" />

      {/* UNSAVED CHANGES FLOATING BANNER */}
      {hasUnsavedOrderChanges && (
        <div className="sticky top-16 z-20 w-full px-4 sm:px-6 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-primary/40 text-text-primary p-3 sm:p-3.5 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-text-primary">
                You have unsaved changes to the menu order.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                label="Discard"
                disabled={isSavingOrder}
                onClick={handleDiscardOrderChanges}
              />
              <Button
                variant="primary"
                size="sm"
                icon={<Check size={14} />}
                label="Save order"
                disabled={isSavingOrder}
                onClick={() => setIsConfirmSaveModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-secondary">
          <LoadingSpinner />
          <p className="text-sm font-medium">
            {duplicatingMenuId ? 'Duplicating menu...' : 'Loading menus...'}
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && menus.length === 0 && (
        <div className="px-4 py-16">
          <EmptyState
            title="No Menus Available"
            description="There are no menus configured, click on “Add” to create a new menu."
          />
        </div>
      )}

      {/* MENUS LIST VIEW */}
      {!isLoading && menus.length > 0 && (
        <div className="px-4 sm:px-6 pt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-secondary font-normal">
              Drag and reorder your menus to schedule how they repeat each week. Click <span className="font-semibold text-text-primary">Save order</span> when finished.
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
                      : 'border-border bg-surface hover:shadow-md hover:border-border-hover'
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
                      className="touch-none p-1.5 -m-1.5 rounded-lg text-text-muted group-hover:text-text-secondary hover:bg-surface-muted active:text-primary active:bg-primary-light transition-colors cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center"
                    >
                      <GripVertical size={18} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-text-primary truncate">
                        {menu.title}
                      </h3>
                      {isActive && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="primary" size="xs" label="Active" />
                          <Badge variant="neutral" size="xs" label={`Week ${week}`} />
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
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-text-secondary transition-colors group-hover:bg-surface-muted/80">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      aria-label="More options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenKebabMenuId(openKebabMenuId === menu.id ? null : menu.id);
                      }}
                      className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg cursor-pointer"
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
                        className="absolute right-3 top-14 z-40 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-xl flex flex-col gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenKebabMenuId(null);
                              reorderMenus(index, index - 1);
                            }}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted text-left cursor-pointer"
                          >
                            <ArrowUp size={15} className="text-text-secondary" />
                            <span>Move up</span>
                          </button>
                        )}
                        {index < menus.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenKebabMenuId(null);
                              reorderMenus(index, index + 1);
                            }}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted text-left cursor-pointer"
                          >
                            <ArrowDown size={15} className="text-text-secondary" />
                            <span>Move down</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenRename(menu)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted text-left cursor-pointer"
                        >
                          <Pencil size={15} className="text-text-secondary" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetActiveClick(menu)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted text-left cursor-pointer"
                        >
                          <CheckCircle2 size={15} className="text-text-secondary" />
                          <span>
                            {isNextWeek
                              ? 'Set as active for next week'
                              : 'Set as active for this week'}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={duplicatingMenuId === menu.id}
                          onClick={() => void handleDuplicateMenu(menu)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-muted text-left disabled:opacity-50 cursor-pointer"
                        >
                          {duplicatingMenuId === menu.id ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-secondary border-t-transparent" />
                          ) : (
                            <Copy size={15} className="text-text-secondary" />
                          )}
                          <span>Duplicate menu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(menu)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-danger hover:bg-danger-light text-left cursor-pointer"
                        >
                          <Trash2 size={15} className="text-danger" />
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
          onClick={() => setIsNewMenuModalOpen(true)}
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
          <h2 className="mb-4 text-base font-bold text-text-primary">New menu</h2>
          <div className="mb-4">
            <InputField
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              placeholder="Enter menu name"
            />
          </div>
          {newMenuName.trim() &&
            menus.some(
              (m) => m.title.toLowerCase().trim() === newMenuName.toLowerCase().trim(),
            ) && (
              <p className="text-xs text-danger mb-4 -mt-2">
                A menu with this name already exists.
              </p>
            )}
          <Button
            variant="primary"
            className="w-full"
            disabled={
              !newMenuName.trim() ||
              menus.some(
                (m) => m.title.toLowerCase().trim() === newMenuName.toLowerCase().trim(),
              )
            }
            icon={<ArrowRight size={18} />}
            label="Continue"
            onClick={() => {
              const name = newMenuName.trim();
              if (name) {
                setIsNewMenuModalOpen(false);
                navigateWithCheck(`/admin/menu/add-menu/${encodeURIComponent(name)}`);
              }
            }}
          />
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
            <h2 className="text-base font-bold text-text-primary">Save menu order?</h2>
          </div>
          <p className="mb-6 text-sm text-text-secondary leading-relaxed">
            This will update the weekly repeating menu sequence in the database.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isSavingOrder}
              label="Cancel"
              onClick={() => setIsConfirmSaveModalOpen(false)}
            />
            <Button
              variant="primary"
              className="flex-1"
              disabled={isSavingOrder}
              pending={isSavingOrder}
              icon={<Check size={18} />}
              label="Save changes"
              onClick={() => void handleConfirmSaveOrder()}
            />
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-light text-warning-dark shrink-0">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-base font-bold text-text-primary">Unsaved changes</h2>
          </div>
          <p className="mb-6 text-sm text-text-secondary leading-relaxed">
            You have reordered menus without saving. If you leave now, your new menu sequence will be discarded.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              label="Stay on page"
              onClick={() => {
                setIsUnsavedChangesModalOpen(false);
                setPendingNavigationPath(null);
              }}
            />
            <Button
              variant="danger"
              className="flex-1"
              label="Discard & Leave"
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
            />
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
          <h2 className="mb-4 text-base font-bold text-text-primary">Rename menu</h2>
          <div className="mb-6">
            <InputField
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              disabled={isRenaming}
              placeholder="Enter menu name"
            />
          </div>
          <Button
            variant="primary"
            className="w-full"
            disabled={!renameValue.trim() || isRenaming}
            pending={isRenaming}
            icon={<Check size={18} />}
            label="Confirm"
            onClick={() => void handleConfirmRename()}
          />
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
          <h2 className="mb-2 w-full text-left text-base font-bold text-text-primary">Delete menu</h2>
          <p className="mb-6 w-full text-left text-xs text-text-secondary">
            Are you sure you want to delete <span className="font-bold text-text-primary">"{deleteMenu?.title}"</span>?
          </p>
          <Button
            variant="danger"
            className="w-full"
            disabled={isDeleting}
            pending={isDeleting}
            label="Delete menu"
            onClick={() => void handleConfirmDelete()}
          />
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
            <h2 className="text-base font-bold text-text-primary">Set active for the coming week?</h2>
          </div>
          <p className="mb-6 text-sm text-text-secondary leading-relaxed">
            This week has already ended, so{' '}
            <strong className="text-text-primary">{confirmActivateMenu?.title}</strong> will be set as
            active for the coming week — Week {week} ({formatWeekDateRange(week, year)}).
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isActivating}
              label="Cancel"
              onClick={() => setConfirmActivateMenu(null)}
            />
            <Button
              variant="primary"
              className="flex-1"
              disabled={isActivating}
              pending={isActivating}
              icon={<Check size={18} />}
              label="Confirm"
              onClick={() => confirmActivateMenu && void handleSetActiveForWeek(confirmActivateMenu)}
            />
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

export default Menu;
