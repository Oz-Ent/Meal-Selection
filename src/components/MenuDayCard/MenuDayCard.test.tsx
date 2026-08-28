import { render, screen, fireEvent } from '@testing-library/react';
import { MenuDayCard } from './MenuDayCard';
import { type Meal } from '../../api/Services/MealServices';

const mockMeals: Meal[] = [
  {
    id: 1,
    name: 'Jollof with Chicken',
    imagePath: 'jollof.png',
    foodCode: 'JL-CHK',
    calories: 650,
    description: 'Tasty Jollof',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    name: 'Fried Rice with Fish',
    imagePath: 'friedrice.png',
    foodCode: 'FR-FSH',
    calories: 700,
    description: 'Crispy fried fish with rice',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
];

describe('MenuDayCard Component', () => {
  it('renders day title and empty placeholder when meals array is empty', () => {
    render(
      <MenuDayCard
        dayTitle="Monday"
        meals={[]}
        isEditable={true}
        onAddMeals={jest.fn()}
      />
    );

    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Add meals to weekday')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Meals/i })).toBeInTheDocument();
  });

  it('renders custom empty placeholder text when provided', () => {
    render(
      <MenuDayCard
        dayTitle="Wednesday"
        meals={[]}
        emptyPlaceholderText="No meals scheduled"
      />
    );

    expect(screen.getByText('No meals scheduled')).toBeInTheDocument();
  });

  it('renders meal list with names and images', () => {
    render(
      <MenuDayCard
        dayTitle="Tuesday"
        meals={mockMeals}
        isEditable={false}
      />
    );

    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Jollof with Chicken')).toBeInTheDocument();
    expect(screen.getByText('Fried Rice with Fish')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add Meals/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove meal' })).not.toBeInTheDocument();
    expect(screen.queryByText('Clear meal(s)')).not.toBeInTheDocument();
  });

  it('triggers onAddMeals when Add Meals button is clicked in editable mode', () => {
    const handleAddMeals = jest.fn();
    render(
      <MenuDayCard
        dayTitle="Thursday"
        meals={[]}
        isEditable={true}
        onAddMeals={handleAddMeals}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Add Meals/i }));
    expect(handleAddMeals).toHaveBeenCalledTimes(1);
  });

  it('triggers onRemoveMeal when remove icon button is clicked', () => {
    const handleRemoveMeal = jest.fn();
    render(
      <MenuDayCard
        dayTitle="Friday"
        meals={mockMeals}
        isEditable={true}
        onRemoveMeal={handleRemoveMeal}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: 'Remove meal' });
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]);
    expect(handleRemoveMeal).toHaveBeenCalledWith(1);

    fireEvent.click(removeButtons[1]);
    expect(handleRemoveMeal).toHaveBeenCalledWith(2);
  });

  it('triggers onClearMeals when Clear meal(s) button is clicked', () => {
    const handleClearMeals = jest.fn();
    render(
      <MenuDayCard
        dayTitle="Monday"
        meals={mockMeals}
        isEditable={true}
        onClearMeals={handleClearMeals}
      />
    );

    const clearButton = screen.getByText('Clear meal(s)');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleClearMeals).toHaveBeenCalledTimes(1);
  });
});
