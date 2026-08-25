import { render, screen, fireEvent } from '@testing-library/react';
import MealSelectionModal from './MealSelectionModal';
import type { MenuDay, MenuDayMeal } from '../../api/Services/MenuServices';

const mockMenuDays: MenuDay[] = [
  { id: 1, day: 'MONDAY' },
  { id: 2, day: 'TUESDAY' },
];

const mockMenuDayMeals: MenuDayMeal[] = [
  {
    id: 101,
    menuDayId: 1,
    isActive: true,
    meal: {
      id: 1,
      name: 'Waakye Deluxe',
      description: 'Rice and beans with shito',
      imagePath: '',
      foodCode: 'FD001',
      calories: 450,
    },
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 102,
    menuDayId: 1,
    isActive: true,
    meal: {
      id: 2,
      name: 'Banku & Tilapia',
      description: 'Fresh grilled tilapia',
      imagePath: '',
      foodCode: 'FD002',
      calories: 500,
    },
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 201,
    menuDayId: 2,
    isActive: true,
    meal: {
      id: 3,
      name: 'Jollof Rice',
      description: 'Spicy jollof with chicken',
      imagePath: '',
      foodCode: 'FD003',
      calories: 550,
    },
    createdAt: '',
    updatedAt: '',
  },
];

describe('MealSelectionModal Component', () => {
  it('renders modal header, subtitle, and meals for current day', () => {
    render(
      <MealSelectionModal
        isOpen={true}
        onClose={jest.fn()}
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selectedMeals={{}}
        onSelectedMealChange={jest.fn()}
        onComplete={jest.fn()}
        completeLabel="Finish"
        subtitle="Please pick your weekly meals"
      />
    );

    expect(screen.getByText('Select Meal')).toBeInTheDocument();
    expect(screen.getByText('Please pick your weekly meals')).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Waakye Deluxe')).toBeInTheDocument();
    expect(screen.getByText('Banku & Tilapia')).toBeInTheDocument();
  });

  it('handles selecting a meal item', () => {
    const handleSelectedMealChange = jest.fn();
    render(
      <MealSelectionModal
        isOpen={true}
        onClose={jest.fn()}
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selectedMeals={{ 1: 101 }}
        onSelectedMealChange={handleSelectedMealChange}
        onComplete={jest.fn()}
        completeLabel="Finish"
      />
    );

    const bankuButton = screen.getByRole('radio', { name: /Banku & Tilapia/i });
    fireEvent.click(bankuButton);

    expect(handleSelectedMealChange).toHaveBeenCalledWith(1, 102);
  });

  it('navigates to next day and allows completion on final day', () => {
    const handleComplete = jest.fn();
    render(
      <MealSelectionModal
        isOpen={true}
        onClose={jest.fn()}
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selectedMeals={{ 1: 101, 2: 201 }}
        onSelectedMealChange={jest.fn()}
        onComplete={handleComplete}
        completeLabel="Finish"
      />
    );

    // Navigate to next day (Tuesday)
    const nextBtn = screen.getByRole('button', { name: 'Next day navigation' });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Jollof Rice')).toBeInTheDocument();

    // On final day, submit button appears in header
    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);

    expect(handleComplete).toHaveBeenCalled();
  });

  it('supports clearing selection and choosing a random meal', () => {
    const handleSelectedMealChange = jest.fn();
    const handleRandomClick = jest.fn();

    render(
      <MealSelectionModal
        isOpen={true}
        onClose={jest.fn()}
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selectedMeals={{ 1: 101 }}
        onSelectedMealChange={handleSelectedMealChange}
        onComplete={jest.fn()}
        completeLabel="Finish"
        onRandomClick={handleRandomClick}
      />
    );

    // Clear day selection
    const clearBtn = screen.getByRole('button', { name: 'Clear current day selection' });
    fireEvent.click(clearBtn);
    expect(handleSelectedMealChange).toHaveBeenCalledWith(1, 0);

    // Random meal click
    const randomBtn = screen.getByRole('button', { name: 'Choose a random meal' });
    fireEvent.click(randomBtn);
    expect(handleRandomClick).toHaveBeenCalledWith(1);
  });
});
