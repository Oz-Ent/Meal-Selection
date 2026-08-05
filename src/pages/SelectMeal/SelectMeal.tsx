import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavigationArrows from '../../components/NavigationArrows/NavigationArrows';
import ListCard from '../../components/ListCard/ListCard';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { days } from '../../utils/Enums/DayOfWeek';
import { SuccessModal } from './SuccessModal';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import MealForeground from '../../assets/MealForeground.jpg';

// API Services
import { type User } from '../../api/Services/UserServices';
import { type MenuDay } from '../../api/Services/MenuServices';
import { type CreateSelectionRequest } from '../../api/Services/MealSelectionServices';
import {
  useCreateMealSelectionsMutation,
  useMenuDaysQuery,
  useMenuMealsQuery,
  useMealsQuery,
  useUsersQuery,
  useWeekScheduleQuery,
} from '../../api/useApiQueries';

// Helpers
import { getISOWeekAndYear } from '../../utils/dateHelpers';

export default function SelectMealPage() {
  const [searchParams] = useSearchParams();
  const isForSomeone = searchParams.get('forSomeone') === 'true';

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number | 'custom'>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(isForSomeone);
  const { week, year } = getISOWeekAndYear();
  const usersQuery = useUsersQuery();
  const weekMenuScheduleQuery = useWeekScheduleQuery(week, year);
  const menuId = weekMenuScheduleQuery.data?.menu.id ?? 0;
  const menuDaysQuery = useMenuDaysQuery(menuId);
  const menuDayMealsQuery = useMenuMealsQuery(menuId);
  const mealsQuery = useMealsQuery();
  const createMealSelectionsMutation = useCreateMealSelectionsMutation();
  const users = usersQuery.data ?? [];
  const weekMenuSchedule = weekMenuScheduleQuery.data;
  const menuDays: MenuDay[] = menuDaysQuery.data ?? [];
  const menuDayMeals = menuDayMealsQuery.data ?? [];
  const allMeals = mealsQuery.data?.meals ?? [];

  // Mocking current user ID (should come from auth context)
  const currentUserId = 1;

  const currentDay = days[currentDayIndex] ?? '';
  const daysLength = days.length;
  const currentSelection = selections[currentDay] || '';
  const currentCustomInput = customInputs[currentDay] || '';

  // Finding meals for current day
  const currentMenuDay = menuDays.find((d) => d.day.toUpperCase() === currentDay.toUpperCase());
  const mealsForCurrentDay = currentMenuDay
    ? menuDayMeals.filter((mdm) => mdm.menuDayId === currentMenuDay.id && mdm.isActive)
    : [];

  const handleNext = () => {
    if (currentDayIndex < daysLength - 1) {
      setCurrentDayIndex((prev) => prev + 1);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex((prev) => prev - 1);
    }
  };

  const handleSelectMeal = (id: string | number) => {
    setSelections((prev) => ({ ...prev, [currentDay]: id === 'custom' ? 'custom' : Number(id) }));
  };

  const handleCustomInputChange = (value: string) => {
    setCustomInputs((prev) => ({ ...prev, [currentDay]: value }));
    if (selections[currentDay] !== 'custom') {
      setSelections((prev) => ({ ...prev, [currentDay]: 'custom' }));
    }
  };

  const submitSelections = async () => {
    if (!weekMenuSchedule) return;

    const payload: CreateSelectionRequest[] = [];

    for (const [dayName, selection] of Object.entries(selections)) {
      if (selection === 'custom' || !selection) continue;

      const mDay = menuDays.find((d) => d.day.toUpperCase() === dayName.toUpperCase());
      if (!mDay) continue;

      payload.push({
        dayMealId: selection as number,
        createdBy: currentUserId,
        createdFor: selectedUser ? selectedUser.id : currentUserId,
        weekMenuScheduleId: weekMenuSchedule.id,
        menuDayId: mDay.id,
      });
    }

    if (payload.length === 0) {
      alert('No standard meals selected to submit.');
      setIsConfirmModalOpen(false);
      return;
    }

    try {
      await createMealSelectionsMutation.mutateAsync(payload);
      setIsConfirmed(true);
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Failed to submit selections:', error);
      alert('Failed to submit your selections. Please try again.');
    }
  };

  const isNextDisabled =
    !currentSelection || (currentSelection === 'custom' && !currentCustomInput);

  return (
    <div className="min-h-screen w-full bg-[#1c1c1e] text-white font-sans flex flex-col relative overflow-hidden max-w-md mx-auto">
      <div className="relative h-screen w-full shrink-0">
        <img
          src={MealForeground}
          alt="Meal background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black/80"></div>
        <div className="absolute inset-0 pt-6.5 flex flex-col">
          <TitleBar iconColor="white" />
          <div className="mt-8">
            <h1 className="text-[32px] font-bold leading-snug tracking-tight text-center">
              Choose Your Meals
              <br />
              For The Week
            </h1>
          </div>
          {/* Optional button if user wants to change who they are selecting for */}
          <div className="flex justify-center mt-4 z-10 relative">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="text-sm underline text-white/80 hover:text-white"
            >
              {selectedUser ? `Selecting for: ${selectedUser.name}` : 'Select for someone else'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Selection Modal */}
      <Modal isOpen={true} onClose={() => {}} variant="bottom" showCloseButton={false}>
        <div className="p-2 flex flex-col text-black h-[70vh]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex flex-col">
              <h3 className="text-[22px] font-bold text-gray-800">{currentDay}</h3>
              {selectedUser && (
                <span className="text-sm font-semibold text-primary">
                  Choosing for {selectedUser.name}
                </span>
              )}
            </div>
            <NavigationArrows
              prevDisabled={currentDayIndex === 0}
              nextDisabled={currentDayIndex === daysLength - 1}
              onPrevClick={handlePrev}
              onNextClick={handleNext}
              ariaSectionName="day navigation"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 mb-6 pr-2">
            {mealsForCurrentDay.map((menuDayMeal) => {
              const mealDetails = allMeals.find((m) => m.id === menuDayMeal.mealId);
              if (!mealDetails) return null;

              return (
                <ListCard
                  key={menuDayMeal.id}
                  id={String(menuDayMeal.id)} // dayMealId
                  title={mealDetails.name}
                  imageUrl={
                    mealDetails.imagePath || 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Meal'
                  }
                  selectedValue={String(currentSelection)}
                  inputType="radio"
                  onChange={(id) => handleSelectMeal(Number(id))}
                />
              );
            })}

            {mealsForCurrentDay.length === 0 && (
              <div className="p-4 text-center text-gray-500">No meals available for this day.</div>
            )}

            <ListCard
              id="custom"
              selectedValue={String(currentSelection)}
              inputType="radio"
              onChange={handleSelectMeal}
              isCustomInput={true}
              customInputValue={currentCustomInput}
              onCustomInputChange={handleCustomInputChange}
              customInputPlaceholder="Enter your meal"
            />
          </div>

          <div className="shrink-0 pt-2 h-13">
            <Button
              label={currentDayIndex === daysLength - 1 ? 'Confirm Menu' : 'Next'}
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`w-full py-4 text-base font-semibold rounded-md transition-all shadow-md active:scale-[0.98] ${isNextDisabled ? 'bg-gray-200 text-gray-400 shadow-none' : 'bg-primary text-white hover:bg-primary/90'}`}
            />
          </div>
        </div>
      </Modal>

      {/* User Selection Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} variant="center">
        <div className="p-4 flex flex-col items-center text-center w-82.5 max-h-[80vh] overflow-hidden">
          <h3 className="text-xl font-bold mb-4 text-gray-800 w-full text-left">Select User</h3>
          <div className="w-full flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setIsUserModalOpen(false);
                }}
                className={`p-3 border rounded-lg text-left cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            ))}
            {users.length === 0 && <p className="text-sm text-gray-500 py-4">No users found.</p>}
          </div>
          <Button
            label="Cancel"
            variant="ghost"
            onClick={() => setIsUserModalOpen(false)}
            className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors "
          />
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        variant="center"
      >
        <div className="p-2 flex flex-col items-center text-center w-82.5">
          <h3 className="text-xl font-bold mb-2 text-gray-800 w-full text-left">Confirm Meal</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed px-2">
            Please confirm that you are satisfied with your food choices for this week.
          </p>
          <div className="flex gap-3 w-full items-center">
            <Button
              label="Cancel"
              variant="ghost"
              onClick={() => setIsConfirmModalOpen(false)}
              className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors "
            />
            <Button
              label="Confirm"
              variant="primary"
              onClick={submitSelections}
              className="flex-1 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
            />
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      {isConfirmed && <SuccessModal selectedMeals={selections as Record<string, string>} />}
    </div>
  );
}
