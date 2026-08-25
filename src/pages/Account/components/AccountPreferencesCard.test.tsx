import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountPreferencesCard } from './AccountPreferencesCard';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../api/useApiQueries', () => ({
  useUserPreferencesQuery: () => ({
    data: {
      dislikes: {
        foodItems: ['PK'],
        meals: [10],
      },
      excludedMealIds: [10],
    },
  }),
  useFoodLibraryQuery: () => ({
    data: [
      { id: 1, foodCode: 'PK', name: 'Pork', foodGroup: 'Meat' },
      { id: 2, foodCode: 'BF', name: 'Beef', foodGroup: 'Meat' },
    ],
  }),
  useMealsQuery: () => ({
    data: {
      meals: [
        { id: 10, name: 'Pork Fried Rice', isActive: true },
        { id: 20, name: 'Grilled Chicken', isActive: true },
      ],
    },
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

    expect(screen.getByText('Meal & Dietary Preferences')).toBeInTheDocument();
    expect(screen.getByText('2 exclusions active')).toBeInTheDocument();
    expect(screen.getByText('Pork')).toBeInTheDocument();
    expect(screen.getByText('Pork Fried Rice')).toBeInTheDocument();
    expect(screen.getByText('3 active presets')).toBeInTheDocument();
    expect(screen.getByText('12 meals chosen')).toBeInTheDocument();
  });

  it('navigates when clicking preset meals shortcut', () => {
    render(
      <MemoryRouter>
        <AccountPreferencesCard />
      </MemoryRouter>
    );

    const presetBtn = screen.getByText('Saved Preset Meals').closest('button');
    expect(presetBtn).toBeInTheDocument();
    fireEvent.click(presetBtn!);

    expect(mockNavigate).toHaveBeenCalledWith('/preset-meals');
  });

  it('navigates when clicking weekly selection shortcut', () => {
    render(
      <MemoryRouter>
        <AccountPreferencesCard />
      </MemoryRouter>
    );

    const selectionBtn = screen.getByText('Weekly Selection').closest('button');
    expect(selectionBtn).toBeInTheDocument();
    fireEvent.click(selectionBtn!);

    expect(mockNavigate).toHaveBeenCalledWith('/select-meal');
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
