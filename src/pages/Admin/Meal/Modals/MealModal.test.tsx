import { render, screen, fireEvent } from '@testing-library/react';
import { MealModal, type MealFormData } from './MealModal';
import type { FoodItem } from '../../../../api/Services/FoodLibraryServices';

const foodItems: FoodItem[] = [
  { id: 1, name: 'Grains', foodCode: 'SG', foodGroup: 'SUPERGROUP', createdAt: '', updatedAt: '' },
  { id: 2, name: 'Rice', foodCode: 'BS', foodGroup: 'BASE', createdAt: '', updatedAt: '' },
  { id: 3, name: 'Chicken', foodCode: 'PR', foodGroup: 'PROTEIN', createdAt: '', updatedAt: '' },
  { id: 4, name: 'Fried', foodCode: 'PP', foodGroup: 'PREP', createdAt: '', updatedAt: '' },
];

const editMealData: MealFormData = {
  id: 1,
  name: 'Pizza',
  imagePath: 'pizza.png',
  foodCode: 'SG-BS-PR-PP',
  calories: 200,
  description: 'Cheesy',
};

describe('MealModal Component', () => {
  const mockOnAddMeal = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in add mode', () => {
    render(<MealModal foodItems={foodItems} onAddMeal={mockOnAddMeal} onClose={mockOnClose} />);
    expect(screen.getByText('New Meal')).toBeInTheDocument();
    // Disabled initially because name is empty and no food code is selected.
    expect(screen.getByRole('button', { name: 'Add New Meal' })).toBeDisabled();
  });

  it('renders correctly in edit mode with provided data', () => {
    render(
      <MealModal
        foodItems={foodItems}
        onAddMeal={mockOnAddMeal}
        onClose={mockOnClose}
        isEditMode={true}
        mealData={editMealData}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Edit Meal' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pizza')).toBeInTheDocument();
    const img = screen.getByAltText('Meal preview');
    expect(img).toHaveAttribute('src', 'pizza.png');

    const submitBtn = screen.getByRole('button', { name: 'Edit Meal' });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    expect(mockOnAddMeal).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Pizza', foodCode: 'SG-BS-PR-PP' }),
    );
  });

  it('enables submit once a name and complete food code are provided', () => {
    render(<MealModal foodItems={foodItems} onAddMeal={mockOnAddMeal} onClose={mockOnClose} />);
    const submitBtn = screen.getByRole('button', { name: 'Add New Meal' });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Enter name of the meal'), {
      target: { value: 'Burger' },
    });
    const inputs = document.body.querySelectorAll('.MuiSelect-nativeInput');
    fireEvent.change(inputs[0], { target: { value: 'SG' } });
    fireEvent.change(inputs[1], { target: { value: 'BS' } });
    fireEvent.change(inputs[2], { target: { value: 'PR' } });
    fireEvent.change(inputs[3], { target: { value: 'PP' } });

    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    expect(mockOnAddMeal).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Burger', foodCode: 'SG-BS-PR-PP' }),
    );
  });

  it('shows confirmation modal when attempting to close with unsaved changes', async () => {
    render(<MealModal foodItems={foodItems} onAddMeal={mockOnAddMeal} onClose={mockOnClose} />);
    fireEvent.change(screen.getByPlaceholderText('Enter name of the meal'), {
      target: { value: 'Burger' },
    });

    // The Modal's close (X) button is the first rendered button.
    const closeBtn = screen.getAllByRole('button')[0];
    fireEvent.click(closeBtn);

    expect(
      await screen.findByText('Are you sure you want to close without saving?'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
