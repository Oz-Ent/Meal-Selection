import { render, screen, fireEvent } from '@testing-library/react';
import AllMealsModalSheet from './AllMealsModalSheet';
import { type Meal } from '../../api/Services/MealServices';

const mockMeals: Meal[] = [
  { id: 1, name: 'Banku & Tilapia', isActive: true, imagePath: '', description: null, createdAt: '', updatedAt: '', foodCode: 'BK01', calories: 500 },
  { id: 2, name: 'Chicken Salad', isActive: true, imagePath: '', description: null, createdAt: '', updatedAt: '', foodCode: 'CS01', calories: 350 },
  { id: 3, name: 'Jollof with Grilled Chicken Wings', isActive: true, imagePath: '', description: null, createdAt: '', updatedAt: '', foodCode: 'JL01', calories: 650 },
  { id: 4, name: 'Waakye', isActive: true, imagePath: '', description: null, createdAt: '', updatedAt: '', foodCode: 'WK01', calories: 600 },
];

describe('AllMealsModalSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all meals and search bar correctly', () => {
    render(
      <AllMealsModalSheet
        meals={mockMeals}
        selectedMealIds={[1]}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('All meals')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search meals...')).toBeInTheDocument();
    expect(screen.getByText('Banku & Tilapia')).toBeInTheDocument();
    expect(screen.getByText('Chicken Salad')).toBeInTheDocument();
    expect(screen.getByText('Jollof with Grilled Chicken Wings')).toBeInTheDocument();
    expect(screen.getByText('Waakye')).toBeInTheDocument();
  });

  it('filters meals based on search input', () => {
    render(
      <AllMealsModalSheet
        meals={mockMeals}
        selectedMealIds={[]}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search meals...');
    fireEvent.change(searchInput, { target: { value: 'chicken' } });

    expect(screen.getByText('Chicken Salad')).toBeInTheDocument();
    expect(screen.getByText('Jollof with Grilled Chicken Wings')).toBeInTheDocument();
    expect(screen.queryByText('Banku & Tilapia')).not.toBeInTheDocument();
    expect(screen.queryByText('Waakye')).not.toBeInTheDocument();
  });

  it('shows empty message when no meals match search', () => {
    render(
      <AllMealsModalSheet
        meals={mockMeals}
        selectedMealIds={[]}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search meals...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent food' } });

    expect(screen.getByText(/No meals found matching "nonexistent food"/i)).toBeInTheDocument();
  });

  it('toggles meal selection and saves selected ids', () => {
    render(
      <AllMealsModalSheet
        meals={mockMeals}
        selectedMealIds={[1]}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Select Waakye (id: 4)
    fireEvent.click(screen.getByText('Waakye'));

    // Deselect Banku & Tilapia (id: 1)
    fireEvent.click(screen.getByText('Banku & Tilapia'));

    // Click Add
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith([4]);
  });
});
