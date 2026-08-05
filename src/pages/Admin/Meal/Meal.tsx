import { EmptyPage } from '../../../components/EmptyPage/EmptyPage';
import { NavBar } from '../../../components/NavBar/NavBar';
import { useState } from 'react';
import ListCard from '../../../components/ListCard/ListCard';
import { useNavigate } from 'react-router-dom';
import { BottomStatusModal } from './Modals/BottomStatusModal';
import { MealModal, type MealFormData } from './Modals/MealModal';
import { FALLBACK_MEAL_IMAGE_URL } from '../../../helpers/mealDefaults';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {
  useCreateMealMutation,
  useFoodLibraryQuery,
  useMealsQuery,
} from '../../../api/useApiQueries';

export function Meal() {
  const navigate = useNavigate();
  const mealsQuery = useMealsQuery();
  const foodLibraryQuery = useFoodLibraryQuery();
  const createMealMutation = useCreateMealMutation();
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const meals = (mealsQuery.data?.meals ?? []).filter((meal) => meal.isActive);
  const foodItems = foodLibraryQuery.data ?? [];
  const isLoading = mealsQuery.isLoading || foodLibraryQuery.isLoading;

  const handleMealAddition = async (mealData: MealFormData) => {
    try {
      await createMealMutation.mutateAsync({
        data: {
          name: mealData.name,
          foodCode: mealData.foodCode,
          calories: mealData.calories ?? undefined,
          description: mealData.description ?? undefined,
        },
        imageFile: mealData.imageFile,
      });
      setIsAddMealModalOpen(false);
      setStatusModal({ type: 'success', message: 'New meal created successfully' });
    } catch {
      setStatusModal({
        type: 'error',
        message: 'Unable to create meal. Ensure the food code is unique.',
      });
    }
  };
  return (
    <div className="h-full">
      <NavBar
        title="All Meals"
        onAddButtonClick={() => setIsAddMealModalOpen(true)}
        backUrl="/admin/activities"
      />
      {isLoading && <LoadingState message="Loading meals..." />}
      {!isLoading && meals.length === 0 && <EmptyPage item="meal" />}
      {!isLoading &&
        meals.map((meal) => (
          <ListCard
            id={meal.id}
            inputType="none"
            key={meal.id}
            title={meal.name}
            imageUrl={meal.imagePath || FALLBACK_MEAL_IMAGE_URL}
            onLongPress={(id) => navigate(`/admin/meal/edit/${id}`)}
          />
        ))}
      {isAddMealModalOpen && (
        <MealModal
          foodItems={foodItems}
          onAddMeal={handleMealAddition}
          onClose={() => setIsAddMealModalOpen(false)}
        />
      )}
      {statusModal && (
        <BottomStatusModal
          type={statusModal.type}
          message={statusModal.message}
          onClose={() => setStatusModal(null)}
          retry={() => {}}
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
