import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SelectMealPage from './SelectMeal';

const mockSubmitSelections = jest.fn();
const mockAdminOverrideSelections = jest.fn();

let mockCurrentUserRole = 'user';
let mockPresetsData = [
  { id: 101, name: 'Rice Maniac', menuId: 1, userId: 132 },
  { id: 102, name: 'Swallow Wahala', menuId: 1, userId: 132 },
  { id: 103, name: 'Other Menu Preset', menuId: 999, userId: 132 },
];

let mockWeeklySelectionsData: any = null;

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: {
      user: { id: 132, email: null, name: 'Bismark Owiredu Owusu', roleId: 1, roleName: mockCurrentUserRole },
      availability: { startDate: '', endDate: '' },
    },
  }),
}));

jest.mock('../../components/TitleBar/TitleBar', () => ({
  TitleBar: () => <div>Hi Test User,</div>,
}));

jest.mock('../../api/Services/PresetServices', () => ({
  presetService: {
    getWithDetails: jest.fn(),
  },
}));

jest.mock('../../api/useApiQueries', () => ({
  useUsersQuery: () => ({
    data: [
      { id: 200, name: 'Alice Smith', email: 'alice@example.com' },
    ],
  }),
  useWeekScheduleQuery: () => ({ data: { id: 1, menu: { id: 1 } } }),
  useWeeklyHolidaysQuery: () => ({ data: [] }),
  useWeeklySelectionsQuery: () => ({
    data: mockWeeklySelectionsData,
  }),
  usePresetsByUserQuery: () => ({
    data: mockPresetsData,
    isLoading: false,
  }),
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
  useAdminOverrideSelectionsMutation: () => ({ mutateAsync: mockAdminOverrideSelections }),
}));

// Mock SuccessModal to prevent complex child rendering
jest.mock('./SuccessModal', () => ({
  SuccessModal: () => <div data-testid="success-modal">Meals Locked In!!</div>,
}));

describe('SelectMealPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUserRole = 'user';
    mockPresetsData = [
      { id: 101, name: 'Rice Maniac', menuId: 1, userId: 132 },
      { id: 102, name: 'Swallow Wahala', menuId: 1, userId: 132 },
      { id: 103, name: 'Other Menu Preset', menuId: 999, userId: 132 },
    ];
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

    // Select a meal
    const pizzaRadio = screen.getAllByRole('radio')[0]; // Pizza
    fireEvent.click(pizzaRadio);

    // Go to Tuesday
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextBtn);
    expect(screen.getByText('Tuesday')).toBeInTheDocument();

    // Go back to Monday
    const prevBtn = screen.getByRole('button', { name: 'Previous day navigation' });
    fireEvent.click(prevBtn);
    expect(screen.getByText('Monday')).toBeInTheDocument();
  });

  it('shows confirmation modal when Save is clicked after completing all days', async () => {
    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (let i = 0; i < days.length; i++) {
      const pizzaRadio = screen.getAllByRole('radio')[0];
      fireEvent.click(pizzaRadio);

      if (i < days.length - 1) {
        const nextBtn = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextBtn);
      }
    }

    const saveBtn = screen.getByRole('button', { name: /Save \(5\/5\)/i });
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);

    // Confirm modal should be open
    expect(screen.getByText('Confirm Meal')).toBeInTheDocument();

    // Click Confirm
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    // SuccessModal should appear
    expect(await screen.findByTestId('success-modal')).toBeInTheDocument();
    expect(mockSubmitSelections).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ createdFor: 132 })]),
    );
  });

  it('shows error toast when submission fails', async () => {
    mockSubmitSelections.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    for (let i = 0; i < 5; i++) {
      const pizzaRadio = screen.getAllByRole('radio')[0];
      fireEvent.click(pizzaRadio);

      if (i < 4) {
        const nextBtn = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextBtn);
      }
    }

    const saveBtn = screen.getByRole('button', { name: /Save \(5\/5\)/i });
    fireEvent.click(saveBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    expect(
      await screen.findByText('Something went wrong while submitting choices. Please try again.'),
    ).toBeInTheDocument();
  });

  it('submits using admin override mutation when admin selects for guests', async () => {
    mockCurrentUserRole = 'admin';
    render(
      <MemoryRouter initialEntries={['/select-meal?isGuest=true']}>
        <SelectMealPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Selecting for: Guests/i)).toBeInTheDocument();

    // Select pizza across all 5 days
    for (let i = 0; i < 5; i++) {
      const pizzaRadio = screen.getAllByRole('radio')[0];
      fireEvent.click(pizzaRadio);

      if (i < 4) {
        const nextBtn = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextBtn);
      }
    }

    // Click save in header
    const saveBtn = screen.getByRole('button', { name: /Save \(5\/5\)/i });
    fireEvent.click(saveBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    expect(await screen.findByTestId('success-modal')).toBeInTheDocument();
    expect(mockAdminOverrideSelections).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ createdFor: null, guestCount: 1 }),
      ]),
    );
  });

  it('clears all days selections when clear button is clicked, and toggles selection when clicking active choice', () => {
    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    const saveBtn = screen.getByRole('button', { name: /Save \(0\/5\)/i });
    expect(saveBtn).toBeDisabled();

    // Select pizza for Monday
    const pizzaRadioMonday = screen.getAllByRole('radio')[0];
    fireEvent.click(pizzaRadioMonday);
    expect(screen.getByRole('button', { name: /Save \(1\/5\)/i })).toBeInTheDocument();

    // Navigate to Tuesday and select pizza
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextBtn);
    const pizzaRadioTuesday = screen.getAllByRole('radio')[0];
    fireEvent.click(pizzaRadioTuesday);
    expect(screen.getByRole('button', { name: /Save \(2\/5\)/i })).toBeInTheDocument();

    // Clicking clear button clears ALL days and updates count back to 0/5
    const clearBtn = screen.getByRole('button', { name: 'Clear all selections' });
    fireEvent.click(clearBtn);
    expect(screen.getByText('All choices have been cleared.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save \(0\/5\)/i })).toBeInTheDocument();

    // Select pizza again on Tuesday
    fireEvent.click(pizzaRadioTuesday);
    expect(screen.getByRole('button', { name: /Save \(1\/5\)/i })).toBeInTheDocument();

    // Clicking pizza again on Tuesday toggles/deselects just that day
    fireEvent.click(pizzaRadioTuesday);
    expect(screen.getByRole('button', { name: /Save \(0\/5\)/i })).toBeInTheDocument();
  });

  it('pre-populates existing weekly selections so user can view/change without re-selecting all days, and sends existing selection IDs on submit', async () => {
    mockWeeklySelectionsData = {
      mealSelections: {
        MONDAY: { id: 501, mealID: 1, mealName: 'Pizza', selectionType: 'MEAL' },
        TUESDAY: { id: 502, mealID: 1, mealName: 'Pizza', selectionType: 'MEAL' },
        WEDNESDAY: { id: 503, mealID: null, mealName: 'Unavailable', selectionType: 'UNAVAILABLE' },
        THURSDAY: { id: 504, mealID: 1, mealName: 'Pizza', selectionType: 'MEAL' },
        FRIDAY: { id: 505, mealID: 1, mealName: 'Pizza', selectionType: 'MEAL' },
      },
    };

    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    // Should load with all 5 days selected
    expect(screen.getByRole('button', { name: /Save \(5\/5\)/i })).toBeInTheDocument();

    // Monday pizza radio should be checked
    const pizzaRadio = screen.getAllByRole('radio')[0];
    expect(pizzaRadio).toHaveAttribute('aria-checked', 'true');

    // Tweak Monday: switch Monday to Unavailable
    const unavailableRadio = screen.getByRole('radio', { name: /Unavailable/i });
    fireEvent.click(unavailableRadio);

    // Click Save
    const saveBtn = screen.getByRole('button', { name: /Save \(5\/5\)/i });
    fireEvent.click(saveBtn);

    // Confirm Modal is displayed
    expect(screen.getByText('Confirm Meal')).toBeInTheDocument();

    // Click Confirm
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    // Verify submission contains updated choices and existing selection IDs
    expect(await screen.findByTestId('success-modal')).toBeInTheDocument();
    expect(mockSubmitSelections).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 501,
          menuDayId: 1,
          selectionType: 'UNAVAILABLE',
          dayMealId: null,
          createdFor: 132,
        }),
        expect.objectContaining({
          id: 502,
          menuDayId: 2,
          selectionType: 'MEAL',
          dayMealId: 12,
          createdFor: 132,
        }),
      ]),
    );
  });

  it('cancels modal when Cancel button is clicked in Confirm Meal modal', () => {
    mockWeeklySelectionsData = {
      mealSelections: {
        MONDAY: { id: 501, mealID: 1, mealName: 'Pizza', selectionType: 'MEAL' },
        TUESDAY: { id: 502, mealID: 1, mealName: 'Pizza', selectionType: 'MEAL' },
        WEDNESDAY: { id: 503, mealID: null, mealName: 'Unavailable', selectionType: 'UNAVAILABLE' },
        THURSDAY: { id: 504, mealID: 1, mealName: 'Pizza', selectionType: 'MEAL' },
        FRIDAY: { id: 505, mealID: 1, mealName: 'Pizza', selectionType: 'MEAL' },
      },
    };

    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    const saveBtn = screen.getByRole('button', { name: /Save \(5\/5\)/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Confirm Meal')).toBeInTheDocument();

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    // Confirm Meal modal should be closed
    expect(screen.queryByText('Confirm Meal')).not.toBeInTheDocument();
    expect(mockSubmitSelections).not.toHaveBeenCalled();
  });
});
