import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SelectMealPage from './SelectMeal';

const mockSubmitSelections = jest.fn();

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: {
      user: { id: 132, email: null, name: 'Bismark Owiredu Owusu', roleId: 1, roleName: 'user' },
      availability: { startDate: '', endDate: '' },
    },
  }),
}));

jest.mock('../../components/TitleBar/TitleBar', () => ({
  TitleBar: () => <div>Hi Test User,</div>,
}));

jest.mock('../../api/useApiQueries', () => ({
  useUsersQuery: () => ({ data: [] }),
  useWeekScheduleQuery: () => ({ data: { id: 1, menu: { id: 1 } } }),
  useMenuDaysQuery: () => ({
    data: [
      { id: 1, day: 'MONDAY' },
      { id: 2, day: 'TUESDAY' },
      { id: 3, day: 'WEDNESDAY' },
      { id: 4, day: 'THURSDAY' },
      { id: 5, day: 'FRIDAY' },
    ],
  }),
  useMenuMealsQuery: () => ({
    data: [
      {
        id: 11,
        menuDayId: 1,
        isActive: true,
        meal: {
          id: 1,
          name: 'Pizza',
          imagePath: 'pizza.png',
          foodCode: '',
          calories: null,
          description: null,
        },
      },
      {
        id: 12,
        menuDayId: 2,
        isActive: true,
        meal: {
          id: 1,
          name: 'Pizza',
          imagePath: 'pizza.png',
          foodCode: '',
          calories: null,
          description: null,
        },
      },
      {
        id: 13,
        menuDayId: 3,
        isActive: true,
        meal: {
          id: 1,
          name: 'Pizza',
          imagePath: 'pizza.png',
          foodCode: '',
          calories: null,
          description: null,
        },
      },
      {
        id: 14,
        menuDayId: 4,
        isActive: true,
        meal: {
          id: 1,
          name: 'Pizza',
          imagePath: 'pizza.png',
          foodCode: '',
          calories: null,
          description: null,
        },
      },
      {
        id: 15,
        menuDayId: 5,
        isActive: true,
        meal: {
          id: 1,
          name: 'Pizza',
          imagePath: 'pizza.png',
          foodCode: '',
          calories: null,
          description: null,
        },
      },
    ],
  }),
  useCreateMealSelectionsMutation: () => ({ mutateAsync: mockSubmitSelections }),
}));

// Mock SuccessModal to prevent it from doing complex rendering logic
jest.mock('./SuccessModal', () => ({
  SuccessModal: () => <div data-testid="success-modal">Success Modal</div>,
}));

describe('SelectMealPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and navigates through days', () => {
    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    // By default should be Monday
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Pizza')).toBeInTheDocument();

    // Select a meal to enable Next button
    const pizzaRadio = screen.getAllByRole('radio')[0]; // Pizza
    fireEvent.click(pizzaRadio);

    const nextBtn = screen.getByRole('button', { name: 'Next' });
    expect(nextBtn).not.toBeDisabled();

    // Go to Tuesday
    fireEvent.click(nextBtn);
    expect(screen.getByText('Tuesday')).toBeInTheDocument();

    // Go back to Monday
    const prevBtn = screen.getByRole('button', { name: 'Previous day navigation' });
    fireEvent.click(prevBtn);
    expect(screen.getByText('Monday')).toBeInTheDocument();
  });

  it('shows confirmation modal on last day and confirms', async () => {
    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    // We need to click "Next" until Friday. For a quicker test, we can just select custom for all days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (let i = 0; i < days.length; i++) {
      // Select pizza
      const pizzaRadio = screen.getAllByRole('radio')[0];
      fireEvent.click(pizzaRadio);

      const actionBtn =
        i === days.length - 1
          ? screen.getByRole('button', { name: 'Confirm Menu' })
          : screen.getByRole('button', { name: 'Next' });
      fireEvent.click(actionBtn);
    }

    // Now confirm modal should be open
    expect(screen.getByText('Confirm Meal')).toBeInTheDocument();

    // Click Confirm
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    // SuccessModal should appear
    expect(await screen.findByTestId('success-modal')).toBeInTheDocument();
    expect(mockSubmitSelections).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ createdBy: 132, createdFor: 132 })]),
    );
  });
});
