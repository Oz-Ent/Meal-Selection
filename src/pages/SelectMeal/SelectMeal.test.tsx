import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SelectMealPage from './SelectMeal';
import { type CreateSelectionRequest, type WeeklyUserSelections } from '../../api/Services/MealSelectionServices';

const mockSubmitSelections = jest.fn();
const mockAdminOverrideSelections = jest.fn();

let mockCurrentUserRole = 'user';
let mockPresetsData = [
  { id: 101, name: 'Rice Maniac', menuId: 1, userId: 132 },
  { id: 102, name: 'Swallow Wahala', menuId: 1, userId: 132 },
  { id: 103, name: 'Other Menu Preset', menuId: 999, userId: 132 },
];

let mockWeeklySelectionsData: WeeklyUserSelections | null = null;

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

jest.mock('../../utils/dateHelpers', () => ({
  ...jest.requireActual('../../utils/dateHelpers'),
  isMenuDayPast: () => false,
  getISOWeekAndYear: () => ({ week: 35, year: 2026 }),
}));

jest.mock('../../api/Services/PresetServices', () => ({
  presetService: {
    getWithDetails: jest.fn(),
  },
}));

const mockUsersData = [
  { id: 200, name: 'Alice Smith', email: 'alice@example.com' },
  { id: 201, name: 'Bob Jones', email: null, referenceEmail: 'bob.jones@company.com' },
];

let mockWeekScheduleData: { id: number; menu: { id: number }; status: string } = { id: 1, menu: { id: 1 }, status: 'ACTIVE' };

jest.mock('../../api/useApiQueries', () => ({
  useUsersQuery: () => ({
    data: mockUsersData,
  }),
  useWeekScheduleQuery: () => ({ data: mockWeekScheduleData }),
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
  useMealDetailsQuery: () => ({ data: null, isPending: false, isError: false }),
}));

// Mock SuccessModal to prevent complex child rendering
jest.mock('./SuccessModal', () => ({
  SuccessModal: () => <div data-testid="success-modal">Meals Locked In!!</div>,
}));

describe('SelectMealPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUserRole = 'user';
    mockWeeklySelectionsData = null;
    mockWeekScheduleData = { id: 1, menu: { id: 1 }, status: 'ACTIVE' };
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

    // Confirm modal should be open with self-selection description
    expect(screen.getByText('Confirm Meals')).toBeInTheDocument();
    expect(
      screen.getByText(/Please confirm that you are satisfied with your food choices for this week./i),
    ).toBeInTheDocument();

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
      await screen.findByText('Network error'),
    ).toBeInTheDocument();
  });

  it('submits using admin override mutation when admin selects for guests and shows guest confirmation description', async () => {
    mockCurrentUserRole = 'admin';
    render(
      <MemoryRouter initialEntries={['/select-meal?isGuest=true']}>
        <SelectMealPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Selecting for: Guests/i)).toBeInTheDocument();

    // Select pizza across all 5 days
    for (let i = 0; i < 5; i++) {
      const pizzaRow = screen.getByText('Pizza');
      fireEvent.click(pizzaRow);

      if (i < 4) {
        const nextBtn = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextBtn);
      }
    }

    // Click save in header
    const saveBtn = screen.getByRole('button', { name: /Save \(5\/5\)/i });
    fireEvent.click(saveBtn);

    // Confirm modal should show guest description
    expect(screen.getByText('Confirm Meals')).toBeInTheDocument();
    expect(
      screen.getByText(/Please confirm the food choices for/i),
    ).toBeInTheDocument();
    expect(screen.getByText('guests')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    expect(await screen.findByTestId('success-modal')).toBeInTheDocument();
    expect(mockAdminOverrideSelections).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ createdFor: null, guestCount: 1 }),
      ]),
    );
  });

  it('allows selecting different quantities for multiple dishes on the same day in guest mode', async () => {
    mockCurrentUserRole = 'admin';
    render(
      <MemoryRouter initialEntries={['/select-meal?isGuest=true']}>
        <SelectMealPage />
      </MemoryRouter>,
    );

    // On Monday, select Pizza and increment to quantity 3
    const pizzaRow = screen.getByText('Pizza');
    fireEvent.click(pizzaRow);

    const increaseBtn = screen.getByRole('button', { name: /Increase quantity of Pizza/i });
    fireEvent.click(increaseBtn); // qty = 2
    fireEvent.click(increaseBtn); // qty = 3

    expect(screen.getByText(/3 meals selected/i)).toBeInTheDocument();

    // Fill the remaining 4 days
    for (let i = 1; i < 5; i++) {
      const nextBtn = screen.getByRole('button', { name: 'Next' });
      fireEvent.click(nextBtn);
      const row = screen.getByText('Pizza');
      fireEvent.click(row);
    }

    const saveBtn = screen.getByRole('button', { name: /Save \(5\/5\)/i });
    fireEvent.click(saveBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    expect(await screen.findByTestId('success-modal')).toBeInTheDocument();
    expect(mockAdminOverrideSelections).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ menuDayId: 1, createdFor: null, guestCount: 3 }),
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
      createdById: 132,
      createdBy: 'Bismark Owiredu Owusu',
      createdForId: 132,
      createdFor: 'Bismark Owiredu Owusu',
      selectionStatus: 'SUBMITTED',
      mealSelections: {
        MONDAY: { id: 501, mealID: 1, mealName: 'Pizza', mealImagePath: 'pizza.png', foodCode: 'PIZZA', calories: 400, selectionType: 'MEAL' },
        TUESDAY: { id: 502, mealID: 1, mealName: 'Pizza', mealImagePath: 'pizza.png', foodCode: 'PIZZA', calories: 400, selectionType: 'MEAL' },
        WEDNESDAY: { id: 503, mealID: null, mealName: 'Unavailable', mealImagePath: null, foodCode: '', calories: null, selectionType: 'UNAVAILABLE' },
        THURSDAY: { id: 504, mealID: 1, mealName: 'Pizza', mealImagePath: 'pizza.png', foodCode: 'PIZZA', calories: 400, selectionType: 'MEAL' },
        FRIDAY: { id: 505, mealID: 1, mealName: 'Pizza', mealImagePath: 'pizza.png', foodCode: 'PIZZA', calories: 400, selectionType: 'MEAL' },
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
    expect(screen.getByText('Confirm Meals')).toBeInTheDocument();

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
      createdById: 132,
      createdBy: 'Bismark Owiredu Owusu',
      createdForId: 132,
      createdFor: 'Bismark Owiredu Owusu',
      selectionStatus: 'SUBMITTED',
      mealSelections: {
        MONDAY: { id: 501, mealID: 1, mealName: 'Pizza', mealImagePath: 'pizza.png', foodCode: 'PIZZA', calories: 400, selectionType: 'MEAL' },
        TUESDAY: { id: 502, mealID: 1, mealName: 'Pizza', mealImagePath: 'pizza.png', foodCode: 'PIZZA', calories: 400, selectionType: 'MEAL' },
        WEDNESDAY: { id: 503, mealID: null, mealName: 'Unavailable', mealImagePath: null, foodCode: '', calories: null, selectionType: 'UNAVAILABLE' },
        THURSDAY: { id: 504, mealID: 1, mealName: 'Pizza', mealImagePath: 'pizza.png', foodCode: 'PIZZA', calories: 400, selectionType: 'MEAL' },
        FRIDAY: { id: 505, mealID: 1, mealName: 'Pizza', mealImagePath: 'pizza.png', foodCode: 'PIZZA', calories: 400, selectionType: 'MEAL' },
      },
    };

    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    const saveBtn = screen.getByRole('button', { name: /Save \(5\/5\)/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText('Confirm Meals')).toBeInTheDocument();

    // Click Cancel
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    // Confirm Meal modal should be closed
    expect(screen.queryByText('Confirm Meals')).not.toBeInTheDocument();
    expect(mockSubmitSelections).not.toHaveBeenCalled();
  });

  it('searches users safely when forSomeone=true, sets user, and displays user name in Confirm modal', async () => {
    render(
      <MemoryRouter initialEntries={['/select-meal?forSomeone=true']}>
        <SelectMealPage />
      </MemoryRouter>,
    );

    // Select User modal should be open
    expect(screen.getByText('Select user')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('bob.jones@company.com')).toBeInTheDocument();

    // Type in search input to filter for Bob
    const searchInput = screen.getByPlaceholderText('Search User');
    fireEvent.change(searchInput, { target: { value: 'bob' } });

    // Should filter and show only Bob
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();

    // Select Bob Jones
    const bobBtn = screen.getByText('Bob Jones').closest('button');
    expect(bobBtn).toBeTruthy();
    fireEvent.click(bobBtn!);

    // Click Continue
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);

    // Modal closes and selection header displays Bob Jones
    expect(screen.getByText('Selecting for: Bob Jones')).toBeInTheDocument();

    // Select pizza across all 5 days for Bob
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

    // Confirm modal should show Bob Jones name in description
    expect(screen.getByText('Confirm Meals')).toBeInTheDocument();
    expect(
      screen.getByText(/Please confirm that you are satisfied with the food choices for/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Bob Jones', { selector: 'span' })).toBeInTheDocument();
  });

  it('clears selections and existing IDs when changing from one user to another', async () => {
    render(
      <MemoryRouter initialEntries={['/select-meal?forSomeone=true']}>
        <SelectMealPage />
      </MemoryRouter>,
    );

    // 1. Select Alice Smith first
    const aliceBtn = screen.getByText('Alice Smith').closest('button');
    expect(aliceBtn).toBeTruthy();
    fireEvent.click(aliceBtn!);

    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);
    expect(screen.getByText('Selecting for: Alice Smith')).toBeInTheDocument();

    // Select meals for Alice across all 5 days
    for (let i = 0; i < 5; i++) {
      const pizzaRadio = screen.getAllByRole('radio')[0];
      fireEvent.click(pizzaRadio);
      if (i < 4) {
        const nextBtn = screen.getByRole('button', { name: 'Next' });
        fireEvent.click(nextBtn);
      }
    }

    // Alice has 5/5 selected
    expect(screen.getByRole('button', { name: /Save \(5\/5\)/i })).toBeInTheDocument();

    // 2. Click "Change" in header to switch to Bob Jones
    const changeBtn = screen.getByRole('button', { name: 'Change' });
    fireEvent.click(changeBtn);

    expect(screen.getByText('Select user')).toBeInTheDocument();
    const bobBtn = screen.getByText('Bob Jones').closest('button');
    expect(bobBtn).toBeTruthy();
    fireEvent.click(bobBtn!);

    const continueBtn2 = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn2);

    // 3. User is now Bob Jones, and Alice's selections should be cleared (Save 0/5)
    expect(screen.getByText('Selecting for: Bob Jones')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save \(0\/5\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save \(0\/5\)/i })).toBeDisabled();
  });

  it('supports batch meal selection for multiple users via userIds URL param and submits batch override payload', async () => {
    mockCurrentUserRole = 'admin';
    mockAdminOverrideSelections.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/select-meal?forSomeone=true&userIds=200,201']}>
        <SelectMealPage />
      </MemoryRouter>,
    );

    // Header displays 2 Users
    expect(screen.getByText(/Selecting for:/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Users/i)).toBeInTheDocument();

    // Select pizza across all 5 days for both users
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

    // Confirm modal should show 2 selected users
    expect(screen.getByText('Confirm Meals')).toBeInTheDocument();
    expect(screen.getByText(/2 selected users/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockAdminOverrideSelections).toHaveBeenCalledTimes(1);
      const payload = mockAdminOverrideSelections.mock.calls[0][0];
      // 5 days * 2 users = 10 items
      expect(payload).toHaveLength(10);
      expect(payload.filter((item: CreateSelectionRequest) => item.createdFor === 200)).toHaveLength(5);
      expect(payload.filter((item: CreateSelectionRequest) => item.createdFor === 201)).toHaveLength(5);
    });
  });

  it('allows selecting all users from the user selection modal in admin mode', async () => {
    mockCurrentUserRole = 'admin';
    render(
      <MemoryRouter initialEntries={['/select-meal?forSomeone=true']}>
        <SelectMealPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Select user(s)')).toBeInTheDocument();

    // Click "Select All"
    const selectAllBtn = screen.getByRole('button', { name: /Select All/i });
    fireEvent.click(selectAllBtn);

    // Continue button shows (2 users)
    const continueBtn = screen.getByRole('button', { name: /Continue \(2 users\)/i });
    fireEvent.click(continueBtn);

    expect(screen.getByText(/2 Users/i)).toBeInTheDocument();
  });

  it('displays closed notice banner and disables Save button when schedule is CLOSED', () => {
    mockWeekScheduleData = { id: 1, menu: { id: 1 }, status: 'CLOSED' };

    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Meal selection for this week is currently closed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled();
  });

  it('displays warning banner and disables Save button when selecting for a user who already selected', () => {
    mockWeeklySelectionsData = {
      createdById: 200,
      createdBy: 'Alice Smith',
      createdForId: 200,
      createdFor: 'Alice Smith',
      selectionStatus: 'SUBMITTED',
      mealSelections: {
        MONDAY: {
          id: 501,
          mealName: 'Pizza',
          mealID: 1,
          mealImagePath: 'pizza.png',
          foodCode: '',
          calories: null,
          selectionType: 'MEAL',
        },
      },
    };

    render(
      <MemoryRouter initialEntries={['/select-meal?forSomeone=true&userId=200']}>
        <SelectMealPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Alice Smith has already made meal selections for this week/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeDisabled();
  });

  it('displays server error message in toast when submit fails', async () => {
    mockSubmitSelections.mockRejectedValue({
      response: {
        data: {
          message: 'The recipient has already made meal selections for this week.',
        },
      },
    });

    render(
      <MemoryRouter>
        <SelectMealPage />
      </MemoryRouter>,
    );

    // Select meals across all 5 days
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

    await waitFor(() => {
      expect(screen.getByText('The recipient has already made meal selections for this week.')).toBeInTheDocument();
    });
  });
});



