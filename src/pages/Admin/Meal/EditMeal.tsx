import { NavLink, useParams } from 'react-router-dom';
import ListCard from '../../../components/ListCard/ListCard';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import EditIcon from '../../../assets/EditIcon.svg';
import Button from '../../../components/Button/Button';
import DeleteIcon from '../../../assets/DeleteIcon.svg';
import { MealModal, type MealFormData } from './Modals/MealModal';
import { BottomStatusModal } from './Modals/BottomStatusModal';
import Modal from '../../../components/Modal/Modal';
import StatusModal from '../../../components/StatusModal/StatusModal';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import {
  useDeleteMealsMutation,
  useFoodLibraryQuery,
  useMealsQuery,
  useUpdateMealMutation,
} from '../../../api/useApiQueries';

export function EditMeal() {
  const { cardId } = useParams<{ cardId: string }>();
  const [selectedIds, setSelectedIds] = useState<string[]>(cardId ? [cardId] : []);
  const mealsQuery = useMealsQuery();
  const foodLibraryQuery = useFoodLibraryQuery();
  const updateMealMutation = useUpdateMealMutation();
  const deleteMealsMutation = useDeleteMealsMutation();
  const [editMealData, setEditMealData] = useState<MealFormData | null>(null);
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [bottomStatusModal, setBottomStatusModal] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const meals = (mealsQuery.data?.meals ?? []).filter((meal) => meal.isActive);
  const foodItems = foodLibraryQuery.data ?? [];

  const handleEditMeal = async (mealData: MealFormData) => {
    if (mealData.id) {
      try {
        await updateMealMutation.mutateAsync({
          id: mealData.id,
          data: {
            name: mealData.name,
            foodCode: mealData.foodCode,
            calories: mealData.calories ?? undefined,
            description: mealData.description ?? undefined,
          },
          imageFile: mealData.imageFile ?? null,
        });
        setShowEditMealModal(false);
        setEditMealData(null);
        setBottomStatusModal({ type: 'success', message: 'Meal updated successfully' });
      } catch {
        setBottomStatusModal({
          type: 'error',
          message: 'Unable to update meal. Ensure the food code is unique.',
        });
      }
    }
  };
  const handleSelectAll = () => {
    setSelectedIds((prevIds) => {
      if (prevIds.length === meals.length) {
        return [];
      }
      return meals.map((meal) => meal.id.toString());
    });
  };

  const handleSelectionChange = (idToToggle: string) => {
    setSelectedIds((prevIds) => {
      if (prevIds.includes(idToToggle)) {
        return prevIds.filter((id) => id !== idToToggle);
      }
      return [...prevIds, idToToggle];
    });
  };

  const handleRemoveMeals = async () => {
    try {
      await deleteMealsMutation.mutateAsync(selectedIds.map(Number));
      setSelectedIds([]);
      setIsDeleteModalOpen(false);
      setStatusModal({ isOpen: true, message: 'Meal(s) deleted successfully', type: 'success' });
    } catch {
      setIsDeleteModalOpen(false);
      setBottomStatusModal({
        type: 'error',
        message: 'Unable to delete the selected meals. Please try again.',
      });
    }
  };

  const isAllSelected = meals.length > 0 && selectedIds.length === meals.length;

  return (
    <div>
      <nav className="sticky top-0 z-50 min-h-13 w-full border-b border-msListBorder bg-white px-4 py-3">
        <section className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/admin/meal">
              <ArrowLeft className="text-msDeepBlue" />
            </NavLink>
            <span className="text-lg text-msDeepBlue leading-snug">
              {selectedIds.length !== 0 ? `${selectedIds.length}` : ''}
            </span>
          </div>
          <div className="flex items-center cursor-pointer gap-6">
            <Button
              variant="none"
              disabled={selectedIds.length === 0 || selectedIds.length > 1}
              className="cursor-pointer"
              onClick={() => {
                setShowEditMealModal(true);
                const meal = meals.find(
                  (currentMeal) => currentMeal.id.toString() === selectedIds[0],
                );
                setEditMealData(
                  meal
                    ? {
                        id: meal.id,
                        name: meal.name,
                        image: meal.imagePath,
                        foodCode: meal.foodCode,
                        calories: meal.calories,
                        description: meal.description,
                      }
                    : null,
                );
              }}
            >
              <img src={EditIcon} className="stroke-msDeepBlue h-4.5 w-4.5" />
            </Button>
            <Button
              variant="none"
              disabled={selectedIds.length === 0}
              className="cursor-pointer"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <img src={DeleteIcon} className="stroke-msDeepBlue h-4.5 w-4.5" />
            </Button>
          </div>
        </section>
        <section className="pl-6 pt-3 flex items-center cursor-pointer" onClick={handleSelectAll}>
          <input
            type="checkbox"
            className="accent-msDeepBlue w-4 h-4 pointer-events-none"
            checked={isAllSelected}
            readOnly
          />
          <span className="pl-3">Select All</span>
        </section>
      </nav>
      {meals.map((meal) => (
        <ListCard
          id={meal.id.toString()}
          inputType="checkbox"
          key={meal.id}
          title={meal.name}
          imageUrl={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
          selectedValue={selectedIds}
          onChange={(id) => handleSelectionChange(id)}
          highlightedColor="bg-msHighlightBlue"
        />
      ))}
      {showEditMealModal && (
        <MealModal
          foodItems={foodItems}
          onAddMeal={handleEditMeal}
          onClose={() => setShowEditMealModal(false)}
          mealData={editMealData ?? undefined}
          isEditMode={true}
        />
      )}
      {bottomStatusModal && (
        <BottomStatusModal
          type={bottomStatusModal.type}
          message={bottomStatusModal.message}
          onClose={() => setBottomStatusModal(null)}
          retry={() => {}}
        />
      )}
      {isDeleteModalOpen && (
        <DeletModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => void handleRemoveMeals()}
        />
      )}
      <StatusModal
        isOpen={statusModal.isOpen}
        message={statusModal.message}
        status={statusModal.type}
        onClose={() => setStatusModal({ isOpen: false, message: '', type: 'success' })}
      />
    </div>
  );
}
interface IDeleteModal {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
function DeletModal({ isOpen, onClose, onConfirm }: IDeleteModal) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="font-semibold px-2">Delete Meal</h2>
      <div className="bg-white p-2 text-msTextPrimary">
        <p>
          Please confirm if you want to delete meal(s). Once deleted, this action can't be undone.
        </p>
        <div className="flex justify-end mt-4 h-10 gap-4">
          <Button variant="outline" onClick={onClose} label="Cancel" />
          <Button variant="danger" onClick={onConfirm} label="Confirm" />
        </div>
      </div>
    </Modal>
  );
}
