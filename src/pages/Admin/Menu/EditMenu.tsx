import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/InputField/InputField';
import ListCard from '../../../components/ListCard/ListCard';
import Modal from '../../../components/Modal/Modal';
import { NavBar } from '../../../components/NavBar/NavBar';
import StatusModal from '../../../components/StatusModal/StatusModal';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { type Meal } from '../../../api/Services/MealServices';
import { type MenuDay, type MenuDayMeal } from '../../../api/Services/MenuServices';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import {
  useAssignMealsMutation,
  useMenuDaysQuery,
  useMenuMealsQuery,
  useMenuQuery,
  useMealsQuery,
  useToggleMenuMealStatusMutation,
  useUpdateMenuMutation,
} from '../../../api/useApiQueries';

interface DayAssignments {
  id: number;
  title: string;
  assignments: MenuDayMeal[];
}

const formatDay = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

export function EditMenu() {
  const navigate = useNavigate();
  const { menuId } = useParams<{ menuId: string }>();
  const numericMenuId = Number(menuId);
  const menuQuery = useMenuQuery(numericMenuId);
  const menuDaysQuery = useMenuDaysQuery(numericMenuId);
  const menuMealsQuery = useMenuMealsQuery(numericMenuId);
  const mealsQuery = useMealsQuery();
  const updateMenuMutation = useUpdateMenuMutation();
  const assignMealsMutation = useAssignMealsMutation();
  const toggleMenuMealStatusMutation = useToggleMenuMealStatusMutation();
  const [draftTitle, setDraftTitle] = useState<string | null>(null);
  const [draftDescription, setDraftDescription] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState({ isOpen: false, success: false, message: '' });
  const title = draftTitle ?? menuQuery.data?.title ?? '';
  const description = draftDescription ?? menuQuery.data?.description ?? '';
  const meals = (mealsQuery.data?.meals ?? []).filter((meal) => meal.isActive);
  const days = toDayAssignments(menuDaysQuery.data ?? [], menuMealsQuery.data ?? []);
  const isLoading =
    menuQuery.isLoading ||
    menuDaysQuery.isLoading ||
    menuMealsQuery.isLoading ||
    mealsQuery.isLoading;
  const isSaving = updateMenuMutation.isPending;

  const updateMetadata = async () => {
    if (!numericMenuId || !title.trim()) {
      return;
    }

    try {
      await updateMenuMutation.mutateAsync({
        id: numericMenuId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
        },
      });
      setStatusModal({
        isOpen: true,
        success: true,
        message: 'Menu details updated successfully.',
      });
    } catch {
      setStatusModal({
        isOpen: true,
        success: false,
        message: 'Unable to update the menu details.',
      });
    }
  };

  const addMealsToDay = async (menuDayId: number, mealIds: number[]) => {
    const day = days.find((item) => item.id === menuDayId);
    const existingMealIds = new Set(day?.assignments.map((assignment) => assignment.meal.id));
    const newMealIds = mealIds.filter((mealId) => !existingMealIds.has(mealId));
    if (newMealIds.length === 0) {
      return;
    }

    try {
      await assignMealsMutation.mutateAsync({
        menuId: numericMenuId,
        assignments: [{ menuDayId, meals: newMealIds }],
      });
    } catch {
      setStatusModal({ isOpen: true, success: false, message: 'Unable to add meals to this day.' });
    }
  };

  const toggleAssignment = async (assignment: MenuDayMeal) => {
    try {
      await toggleMenuMealStatusMutation.mutateAsync({
        id: assignment.id,
        isActive: !assignment.isActive,
        menuId: numericMenuId,
      });
    } catch {
      setStatusModal({
        isOpen: true,
        success: false,
        message: "Unable to update this meal's visibility.",
      });
    }
  };

  return (
    <div className="min-h-screen pb-18">
      <NavBar title="Edit Menu" backUrl="/admin/menu" />
      {isLoading && <LoadingState message="Loading menu details..." />}
      {!isLoading && (
        <div className="px-4">
          <section className="border-b border-msListBorder py-4">
            <h2 className="mb-2 text-sm font-medium text-msTextPrimary">Menu details</h2>
            <div className="mb-3 h-12">
              <InputField
                value={title}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="Menu title"
              />
            </div>
            <div className="mb-3 h-18">
              <InputField
                value={description}
                onChange={(event) => setDraftDescription(event.target.value)}
                placeholder="Description"
                multiline
              />
            </div>
            <div className="h-10">
              <Button
                variant="outline"
                pending={isSaving}
                disabled={!title.trim()}
                onClick={() => void updateMetadata()}
                label="Save details"
              />
            </div>
          </section>
          {days.map((day) => (
            <EditMenuDaySection
              key={day.id}
              day={day}
              meals={meals}
              onAddMeals={addMealsToDay}
              onToggle={toggleAssignment}
            />
          ))}
        </div>
      )}
      <StatusModal
        isOpen={statusModal.isOpen}
        status={statusModal.success ? 'success' : 'error'}
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

function toDayAssignments(menuDays: MenuDay[], assignments: MenuDayMeal[]): DayAssignments[] {
  return menuDays.map((day) => ({
    id: day.id,
    title: formatDay(day.day),
    assignments: assignments.filter((assignment) => assignment.menuDayId === day.id),
  }));
}

function EditMenuDaySection({
  day,
  meals,
  onAddMeals,
  onToggle,
}: {
  day: DayAssignments;
  meals: Meal[];
  onAddMeals: (dayId: number, mealIds: number[]) => Promise<void>;
  onToggle: (assignment: MenuDayMeal) => Promise<void>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="border-b border-msListBorder py-3">
      <h3 className="mb-1 font-medium text-msCardPrimaryText">{day.title}</h3>
      {day.assignments.map((assignment) => {
        const meal = assignment.meal;
        if (!meal) {
          return null;
        }
        return (
          <div key={assignment.id} className={assignment.isActive ? '' : 'opacity-50'}>
            <ListCard
              id={meal.id}
              title={meal.name}
              imageUrl={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
              inputType="none"
            />
            <button
              type="button"
              className="mb-2 ml-2 text-xs text-msDeepBlue"
              onClick={() => void onToggle(assignment)}
            >
              {assignment.isActive ? 'Hide meal' : 'Show meal'}
            </button>
          </div>
        );
      })}
      <Button
        variant="none"
        className="mt-1 flex items-center text-msDeepBlue"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="h-4 w-4" /> <span className="text-sm">Add Meal(s)</span>
      </Button>
      {isModalOpen && (
        <EditMealSelectionModal
          meals={meals}
          selectedMealIds={day.assignments.map((assignment) => assignment.meal.id)}
          onClose={() => setIsModalOpen(false)}
          onSave={async (mealIds) => {
            await onAddMeals(day.id, mealIds);
            setIsModalOpen(false);
          }}
        />
      )}
    </section>
  );
}

function EditMealSelectionModal({
  meals,
  selectedMealIds,
  onClose,
  onSave,
}: {
  meals: Meal[];
  selectedMealIds: number[];
  onClose: () => void;
  onSave: (mealIds: number[]) => Promise<void>;
}) {
  const [temporaryMealIds, setTemporaryMealIds] = useState(selectedMealIds);
  const [isSaving, setIsSaving] = useState(false);

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
            pending={isSaving}
            onClick={() => {
              setIsSaving(true);
              void onSave(temporaryMealIds).finally(() => setIsSaving(false));
            }}
            label="Save meals"
          />
        </div>
      </div>
    </Modal>
  );
}
