import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../components/Button/Button';
import ListCard from '../../../components/ListCard/ListCard';
import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import StatusModal from '../../../components/StatusModal/StatusModal';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { type Meal } from '../../../api/Services/MealServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import { useCreateMenuWithAssignmentsMutation, useMealsQuery } from '../../../api/useApiQueries';

interface MenuDaySelection {
  id: string;
  title: string;
  mealIds: number[];
}

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const formatDay = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

export function AddMenu() {
  const navigate = useNavigate();
  const { menuName } = useParams<{ menuName: string }>();
  const mealsQuery = useMealsQuery();
  const createMenuMutation = useCreateMenuWithAssignmentsMutation();
  const [menuDays, setMenuDays] = useState<MenuDaySelection[]>(
    WEEKDAYS.map((day) => ({ id: day, title: formatDay(day), mealIds: [] })),
  );
  const [statusModal, setStatusModal] = useState({ isOpen: false, success: false, message: '' });
  const meals = (mealsQuery.data?.meals ?? []).filter((meal) => meal.isActive);
  const isLoading = mealsQuery.isLoading;

  const updateDayMeals = (dayId: string, mealIds: number[]) => {
    setMenuDays((currentDays) =>
      currentDays.map((day) => (day.id === dayId ? { ...day, mealIds } : day)),
    );
  };

  const handleSaveMenu = async () => {
    const title = menuName?.trim();
    if (!title) {
      setStatusModal({
        isOpen: true,
        success: false,
        message: 'Unable to save because the menu name is missing.',
      });
      return;
    }

    const emptyDays = menuDays.filter((day) => day.mealIds.length === 0).map((day) => day.title);
    if (emptyDays.length > 0) {
      setStatusModal({
        isOpen: true,
        success: false,
        message: `Please add meals for: ${emptyDays.join(', ')}.`,
      });
      return;
    }

    try {
      await createMenuMutation.mutateAsync({
        menu: { title },
        mealIdsByDay: Object.fromEntries(menuDays.map((day) => [day.id, day.mealIds])),
      });
      setStatusModal({ isOpen: true, success: true, message: 'Menu saved successfully.' });
    } catch {
      setStatusModal({
        isOpen: true,
        success: false,
        message: 'Unable to save the menu. Please try again.',
      });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <NavBar title={menuName || 'Add Menu'} backUrl="/admin/menu" />
      <div className="flex-1 px-4 pb-20">
        {isLoading && <LoadingState message="Loading meals..." />}
        {!isLoading &&
          menuDays.map((day) => (
            <MenuDaySection
              key={day.id}
              day={day}
              meals={meals}
              onChange={(mealIds) => updateDayMeals(day.id, mealIds)}
            />
          ))}
        {!isLoading && meals.length === 0 && (
          <p className="py-8 text-center text-sm text-msCardSecondaryText">
            Create meals before creating a menu.
          </p>
        )}
      </div>
      <div className="fixed bottom-0 left-0 z-20 h-15 w-full border-t border-msListBorder bg-white px-3 py-2">
        <Button
          variant="primary"
          pending={createMenuMutation.isPending}
          onClick={() => void handleSaveMenu()}
          label="Save"
          disabled={isLoading || meals.length === 0 || createMenuMutation.isPending}
        />
      </div>
      <StatusModal
        isOpen={statusModal.isOpen}
        status={statusModal.success ? 'success' : 'error'}
        title={statusModal.success ? 'Success' : 'Error'}
        message={statusModal.message}
        onClose={() => {
          const wasSuccessful = statusModal.success;
          setStatusModal({ isOpen: false, success: false, message: '' });
          if (wasSuccessful) {
            navigate('/admin/menu');
          }
        }}
      />
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

function MenuDaySection({
  day,
  meals,
  onChange,
}: {
  day: MenuDaySelection;
  meals: Meal[];
  onChange: (mealIds: number[]) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedMeals = meals.filter((meal) => day.mealIds.includes(meal.id));

  return (
    <section className="border-b border-msListBorder pb-3 pt-3">
      <h4 className="pb-1 font-medium text-msCardPrimaryText">{day.title}</h4>
      {selectedMeals.map((meal) => (
        <ListCard
          key={meal.id}
          id={meal.id}
          title={meal.name}
          imageUrl={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
          inputType="delete"
          onChange={(id) => onChange(day.mealIds.filter((mealId) => mealId !== Number(id)))}
        />
      ))}
      <Button
        variant="none"
        className="mt-2 flex items-center text-msDeepBlue"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-4 w-4" /> <span className="text-sm">Add Meal(s)</span>
      </Button>
      {isModalOpen && (
        <MealSelectionModal
          meals={meals}
          selectedMealIds={day.mealIds}
          onClose={() => setIsModalOpen(false)}
          onSave={onChange}
        />
      )}
    </section>
  );
}

function MealSelectionModal({
  meals,
  selectedMealIds,
  onClose,
  onSave,
}: {
  meals: Meal[];
  selectedMealIds: number[];
  onClose: () => void;
  onSave: (mealIds: number[]) => void;
}) {
  const [temporaryMealIds, setTemporaryMealIds] = useState(selectedMealIds);

  const toggleMeal = (id: string) => {
    const mealId = Number(id);
    setTemporaryMealIds((currentIds) =>
      currentIds.includes(mealId)
        ? currentIds.filter((currentId) => currentId !== mealId)
        : [...currentIds, mealId],
    );
  };

  return (
    <Modal isOpen variant="bottom" onClose={onClose} showCloseButton>
      <div className="flex h-[90vh] flex-col pb-16">
        <h2 className="mb-2 shrink-0 px-3 pt-1 text-lg font-semibold text-msTextPrimary">
          All Meals
        </h2>
        <div className="flex-1 overflow-y-auto">
          {meals.map((meal) => (
            <ListCard
              key={meal.id}
              id={meal.id}
              title={meal.name}
              imageUrl={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
              inputType="checkbox"
              selectedValue={temporaryMealIds}
              onChange={toggleMeal}
              highlightedColor="bg-msHighlightBlue"
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 h-14 w-full border-t border-msListBorder bg-white p-2">
          <Button
            variant="primary"
            onClick={() => {
              onSave(temporaryMealIds);
              onClose();
            }}
            label="Add"
          />
        </div>
      </div>
    </Modal>
  );
}
