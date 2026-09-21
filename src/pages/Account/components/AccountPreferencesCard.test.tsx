import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountPreferencesCard } from './AccountPreferencesCard';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPreferences = {
  dislikes: {
    foodItems: ['PK'],
    meals: [20],
  },
  excludedMealIds: [10],
};

const mockFoodLibrary = [
  { id: 1, foodCode: 'PK', name: 'Pork', foodGroup: 'Meat' },
  { id: 2, foodCode: 'BF', name: 'Beef', foodGroup: 'Meat' },
];

const mockMeals = {
  meals: [
    { id: 10, name: 'Pork Fried Rice', isActive: true },
    { id: 20, name: 'Grilled Chicken', isActive: true },
  ],
};

jest.mock('../../../api/useApiQueries', () => ({
  useUserPreferencesQuery: () => ({
    data: mockPreferences,
  }),
  useFoodLibraryQuery: () => ({
    data: mockFoodLibrary,
  }),
  useMealsQuery: () => ({
    data: mockMeals,
  }),
  useUpdateUserPreferencesMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

describe('AccountPreferencesCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders preference summary, disliked ingredients and dishes', () => {
    render(
      <MemoryRouter>
        <AccountPreferencesCard
          stats={{ totalSelections: 12, totalPresets: 3 }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    expect(screen.getByText('Pork')).toBeInTheDocument();
    expect(screen.getByText('Saved Presets')).toBeInTheDocument();
    expect(screen.getByText('Total Selections')).toBeInTheDocument();

    const excludedMealsToggle = screen.getByRole('button', {
      name: 'Meals excluded from selections (1)',
    });
    expect(excludedMealsToggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(excludedMealsToggle);
    expect(screen.getByText('Pork Fried Rice')).toBeInTheDocument();
  });

  it('navigates when clicking preset meals shortcut', () => {
    render(
      <MemoryRouter>
        <AccountPreferencesCard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Saved Presets'));
    expect(mockNavigate).toHaveBeenCalledWith('/preset-meals');
  });

  it('navigates when clicking weekly selection shortcut', () => {
    render(
      <MemoryRouter>
        <AccountPreferencesCard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Total Selections'));
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('opens configuration modal when Configure button is clicked', () => {
    render(
      <MemoryRouter>
        <AccountPreferencesCard />
      </MemoryRouter>
    );

    const configureBtn = screen.getByRole('button', { name: /Configure/i });
    fireEvent.click(configureBtn);

    expect(screen.getByText('Manage Meal Preferences')).toBeInTheDocument();
  });
});
