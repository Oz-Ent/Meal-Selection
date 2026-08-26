import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditPreferencesModal } from './EditPreferencesModal';

const mockMutateAsync = jest.fn();

const mockPreferences = {
  dislikes: {
    foodItems: ['PK'],
    meals: [10],
  },
};

const mockFoodLibrary = [
  { id: 1, foodCode: 'PK', name: 'Pork', foodGroup: 'Meat' },
  { id: 2, foodCode: 'BF', name: 'Beef', foodGroup: 'Meat' },
  { id: 3, foodCode: 'EG', name: 'Egg', foodGroup: 'Poultry' },
];

const mockMeals = {
  meals: [
    { id: 10, name: 'Pork Fried Rice', description: 'With pork chunks', isActive: true },
    { id: 20, name: 'Grilled Chicken', description: 'With spicy sauce', isActive: true },
  ],
};

jest.mock('../../../api/useApiQueries', () => ({
  useUserPreferencesQuery: () => ({
    data: mockPreferences,
  }),
  useFoodLibraryQuery: () => ({
    data: mockFoodLibrary,
    isLoading: false,
  }),
  useMealsQuery: () => ({
    data: mockMeals,
    isLoading: false,
  }),
  useUpdateUserPreferencesMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('EditPreferencesModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with ingredients and allows searching and selecting', async () => {
    const handleClose = jest.fn();

    render(
      <EditPreferencesModal
        isOpen={true}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Manage Meal Preferences')).toBeInTheDocument();
    expect(screen.getByText('Pork')).toBeInTheDocument();
    expect(screen.getByText('Beef')).toBeInTheDocument();
    expect(screen.getByText('Egg')).toBeInTheDocument();

    // Toggle Beef
    const beefBtn = screen.getByText('Beef').closest('button');
    fireEvent.click(beefBtn!);

    // Switch to Dishes tab
    const dishesTab = screen.getByRole('button', { name: /Dishes/i });
    fireEvent.click(dishesTab);

    expect(screen.getByText('Pork Fried Rice')).toBeInTheDocument();
    expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();

    // Save preferences
    mockMutateAsync.mockResolvedValue({});
    const saveBtn = screen.getByRole('button', { name: 'Save Preferences' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        dislikes: {
          foodItems: ['PK', 'BF'],
          meals: [10],
        },
      });
    });
  });

  it('filters ingredients by food group buttons', () => {
    render(
      <EditPreferencesModal
        isOpen={true}
        onClose={jest.fn()}
      />
    );

    const poultryGroupBtn = screen.getByRole('button', { name: 'Poultry' });
    fireEvent.click(poultryGroupBtn);

    expect(screen.getByText('Egg')).toBeInTheDocument();
    expect(screen.queryByText('Pork')).not.toBeInTheDocument();
  });
});
