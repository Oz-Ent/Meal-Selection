import { EmptyPage } from '../../../components/EmptyPage/EmptyPage';
import { NavBar } from '../../../components/NavBar/NavBar';
import { useState } from 'react';
import { availableMeals } from '../../../helpers/availableMeals';
import ListCard from '../../../components/ListCard/ListCard';
import { useNavigate } from 'react-router-dom';
import { BottomStatusModal } from './Modals/BottomStatusModal';
import { MealModal } from './Modals/MealModal';
export function Meal() {
  const navigate = useNavigate();
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const handleMealAddition = (mealData: { title: string; imageUrl: string }) => {
    const newMeal = {
      id: (availableMeals.length + 1).toString(),
      title: mealData.title,
      imageUrl: mealData.imageUrl || 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Meal',
    };
    availableMeals.unshift(newMeal);
    setIsAddMealModalOpen(false);
    setStatusModal({ type: 'success', message: 'New meal created successfully' });
  };
  return (
    <div className="h-full">
      <NavBar
        title="All Meals"
        onAddButtonClick={() => setIsAddMealModalOpen(true)}
        backUrl="/admin/activities"
      />
      {availableMeals.length === 0 && <EmptyPage item="meal" />}
      {availableMeals.length > 0 &&
        availableMeals.map((meal) => (
          <ListCard
            id={meal.id}
            inputType="none"
            key={meal.id}
            title={meal.title}
            imageUrl={meal.imageUrl}
            onLongPress={(id) => navigate(`/admin/meal/edit/${id}`)}
          />
        ))}
      {isAddMealModalOpen && (
        <MealModal onAddMeal={handleMealAddition} onClose={() => setIsAddMealModalOpen(false)} />
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


