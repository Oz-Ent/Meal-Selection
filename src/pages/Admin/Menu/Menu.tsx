import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { EmptyPage } from '../../../components/EmptyPage/EmptyPage';
import InputField from '../../../components/InputField/InputField';
import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import StatusModal from '../../../components/StatusModal/StatusModal';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import MenuCard from '../../../assets/MenuCard.svg';
import SelectedMenu from '../../../assets/SelectedMenu.svg';
import { type Menu as MenuRecord } from '../../../api/Services/MenuServices';
import { type WeekMenuSchedule } from '../../../api/Services/WeekMenuScheduleServices';
import {
  useCreateWeekScheduleMutation,
  useDeleteMenuMutation,
  useMenusQuery,
  useUpdateWeekScheduleMutation,
  useWeekSchedulesQuery,
} from '../../../api/useApiQueries';

const getCurrentIsoWeek = () => {
  const date = new Date();
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return { week, year: utcDate.getUTCFullYear() };
};

export function Menu() {
  const navigate = useNavigate();
  const menusQuery = useMenusQuery();
  const weekSchedulesQuery = useWeekSchedulesQuery();
  const createWeekScheduleMutation = useCreateWeekScheduleMutation();
  const updateWeekScheduleMutation = useUpdateWeekScheduleMutation();
  const deleteMenuMutation = useDeleteMenuMutation();
  const [addMenu, setAddMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [deleteMenu, setDeleteMenu] = useState<MenuRecord | null>(null);
  const [statusModal, setStatusModal] = useState({ isOpen: false, success: false, message: '' });

  const { week, year } = getCurrentIsoWeek();
  const menus = (menusQuery.data ?? []).filter((menu) => menu.isActive);
  const currentSchedule: WeekMenuSchedule | null =
    weekSchedulesQuery.data?.find((schedule) => schedule.week === week && schedule.year === year) ??
    null;
  const isLoading = menusQuery.isLoading || weekSchedulesQuery.isLoading;
  const isSavingSchedule =
    createWeekScheduleMutation.isPending || updateWeekScheduleMutation.isPending;

  const showStatus = (success: boolean, message: string) =>
    setStatusModal({ isOpen: true, success, message });

  const handleSelectMenu = async (menu: MenuRecord) => {
    const isSelected = currentSchedule?.menu.id === menu.id && currentSchedule.status === 'ACTIVE';
    try {
      if (currentSchedule) {
        await updateWeekScheduleMutation.mutateAsync({
          id: currentSchedule.id,
          data: {
            menuId: menu.id,
            status: isSelected ? 'DRAFT' : 'ACTIVE',
          },
        });
      } else {
        const schedule = await createWeekScheduleMutation.mutateAsync({
          week,
          year,
          menuId: menu.id,
        });
        await updateWeekScheduleMutation.mutateAsync({
          id: schedule.id,
          data: {
            status: 'ACTIVE',
          },
        });
      }
      showStatus(
        true,
        isSelected
          ? `${menu.title} deselected successfully`
          : `${menu.title} selected for this week`,
      );
    } catch {
      showStatus(false, 'Unable to update the current week menu. Please try again.');
    } finally {
      setOpenDropdown(null);
    }
  };

  const handleDeleteMenu = async () => {
    if (!deleteMenu) {
      return;
    }

    try {
      await deleteMenuMutation.mutateAsync(deleteMenu.id);
      showStatus(true, 'Menu deleted successfully');
    } catch {
      showStatus(false, 'Sorry, the menu could not be deleted. Try again.');
    } finally {
      setDeleteMenu(null);
    }
  };

  return (
    <div className="min-h-full">
      <NavBar
        title="All Menus"
        onAddButtonClick={() => setAddMenu(true)}
        backUrl="/admin/activities"
      />
      {isLoading && <LoadingState message="Loading menus..." />}
      {!isLoading && menus.length === 0 && <EmptyPage item="menu" />}
      {openDropdown !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
      )}
      {!isLoading && menus.length > 0 && (
        <div className="p-2">
          {menus.map((menu) => {
            const isSelected =
              currentSchedule?.menu.id === menu.id && currentSchedule.status === 'ACTIVE';
            return (
              <div key={menu.id} className="relative mb-2">
                <Card
                  type="menu"
                  title={menu.title}
                  description={menu.description || 'Not scheduled'}
                  imageUrl={isSelected ? SelectedMenu : MenuCard}
                  vertEllipsisIconAction={() => setOpenDropdown(menu.id)}
                />
                {openDropdown === menu.id && (
                  <div className="absolute right-6 top-5 z-20 w-56 border border-gray-100 bg-white py-2 shadow-lg">
                    <Button
                      variant="none"
                      disabled={isSavingSchedule}
                      className="w-full px-4 py-2.5 text-left text-sm text-msTextPrimary hover:bg-gray-50"
                      onClick={() => void handleSelectMenu(menu)}
                    >
                      {isSelected ? 'Deselect menu' : 'Select menu for this week'}
                    </Button>
                    <Button
                      variant="none"
                      className="w-full px-4 py-2.5 text-left text-sm text-msTextPrimary hover:bg-gray-50"
                      onClick={() => navigate(`/admin/menu/edit/${menu.id}`)}
                    >
                      Edit menu
                    </Button>
                    <div className="my-1 border-t border-gray-100" />
                    <Button
                      variant="none"
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50"
                      onClick={() => {
                        if (isSelected) {
                          showStatus(
                            false,
                            `${menu.title} is selected for this week. Deselect it before deleting.`,
                          );
                          setOpenDropdown(null);
                          return;
                        }
                        setDeleteMenu(menu);
                        setOpenDropdown(null);
                      }}
                    >
                      Delete menu
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {addMenu && <AddMenuModal onClose={() => setAddMenu(false)} />}
      <StatusModal
        isOpen={statusModal.isOpen}
        status={statusModal.success ? 'success' : 'error'}
        message={statusModal.message}
        onClose={() => setStatusModal({ isOpen: false, success: false, message: '' })}
      />
      {deleteMenu && (
        <DeleteModal
          onClose={(confirmed) => {
            if (confirmed) {
              void handleDeleteMenu();
              return;
            }
            setDeleteMenu(null);
          }}
        />
      )}
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3" role="status">
      <div className="h-8 w-8">
        <LoadingSpinner />
      </div>
      <p className="text-sm text-msCardSecondaryText">{message}</p>
    </div>
  );
}

function AddMenuModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  return (
    <Modal isOpen variant="bottom" onClose={onClose}>
      <div className="p-2">
        <h2 className="text-lg font-semibold text-msTextPrimary">New Menu</h2>
        <div className="my-4 h-14">
          <InputField
            placeholder="Enter name of the menu"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mb-4 bg-msTextArea"
            isBorderVisible={false}
          />
        </div>
        <div className="h-11">
          <Button
            variant="primary"
            onClick={() => navigate(`/admin/menu/add-menu/${encodeURIComponent(name.trim())}`)}
            label="Create Menu"
            disabled={!name.trim()}
          />
        </div>
      </div>
    </Modal>
  );
}

function DeleteModal({ onClose }: { onClose: (confirmed: boolean) => void }) {
  return (
    <Modal isOpen variant="center" onClose={() => onClose(false)}>
      <div className="text-msTextPrimary">
        <h2 className="text-lg font-semibold">Delete Menu</h2>
        <p>Delete this menu? It will no longer be available for future schedules.</p>
        <div className="mb-4 mt-8 flex h-11 gap-2">
          <Button variant="outline" onClick={() => onClose(false)} label="Cancel" />
          <Button variant="danger" onClick={() => onClose(true)} label="Delete" />
        </div>
      </div>
    </Modal>
  );
}
