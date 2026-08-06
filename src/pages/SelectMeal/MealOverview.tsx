import Modal from '../../components/Modal/Modal';
import ListCard from '../../components/ListCard/ListCard';

export interface OverviewMeal {
  title: string;
  imageUrl: string;
}

export function MealOverview({ selectedMeals }: { selectedMeals: Record<string, OverviewMeal> }) {
  return (
    <Modal isOpen={true} onClose={() => {}} variant={'bottom'}>
      <div className="h-[80vh] overflow-y-auto px-3 py-2">
        <div>
          <h2 className="text-[18px] font-semibold mb-2 text-msTextPrimary">
            My Meals For The Week
          </h2>
        </div>
        {Object.entries(selectedMeals).map(([day, meal]) => (
          <div key={day}>
            <p className="text-[16px] font-medium mt-1 text-msTextPrimary">{day}</p>
            <ListCard title={meal.title} imageUrl={meal.imageUrl} id={day} inputType="none" />
          </div>
        ))}
      </div>
    </Modal>
  );
}
