import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ViewUserSelectionsModal } from './ViewUserSelectionsModal';
import { useWeeklySelectionsQuery } from '../../../api/useApiQueries';
import type { User } from '../../../api/Services/UserServices';

jest.mock('../../../api/useApiQueries', () => ({
  useWeeklySelectionsQuery: jest.fn(),
}));

const mockUser: User = {
  id: 42,
  name: 'Jane Doe',
  email: 'jane@example.com',
  referenceEmail: 'jane@work.com',
  referenceId: 1042,
  roleId: 2,
  role: {
    name: 'employee',
  },
  status: 'ACTIVE',
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ViewUserSelectionsModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders skeleton and hides edit button while loading in query mode', () => {
    (useWeeklySelectionsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    renderWithProviders(
      <ViewUserSelectionsModal
        isOpen={true}
        onClose={jest.fn()}
        user={mockUser}
        targetDateString="2026-09-01"
        selectedWeek={36}
        selectedYear={2026}
      />,
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-container')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit meals/i })).not.toBeInTheDocument();
  });

  it('renders user selections with badges and shows edit button when loaded and not self-selected', () => {
    (useWeeklySelectionsQuery as jest.Mock).mockReturnValue({
      data: {
        createdById: 999, // Admin selected for user
        createdBy: 'Admin User',
        createdForId: 42,
        mealSelections: {
          MONDAY: {
            id: 1,
            mealName: 'Jollof Rice',
            mealImagePath: '/images/jollof.jpg',
            calories: 650,
            selectionType: 'MEAL',
          },
          TUESDAY: {
            id: 2,
            mealName: 'Unavailable',
            selectionType: 'UNAVAILABLE',
          },
          WEDNESDAY: {
            id: 3,
            mealName: 'Holiday',
            selectionType: 'HOLIDAY',
          },
        },
      },
      isLoading: false,
    });

    renderWithProviders(
      <ViewUserSelectionsModal
        isOpen={true}
        onClose={jest.fn()}
        user={mockUser}
        targetDateString="2026-09-01"
        selectedWeek={36}
        selectedYear={2026}
      />,
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText(/selected by admin user/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit meals/i })).toBeInTheDocument();
    expect(screen.getByText('Jollof Rice')).toBeInTheDocument();
    expect(screen.getByText('650 kcal')).toBeInTheDocument();
    expect(screen.getAllByText('Unavailable').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Holiday').length).toBeGreaterThanOrEqual(1);
  });

  it('renders direct selections and handles confirm & cancel actions', () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();

    renderWithProviders(
      <ViewUserSelectionsModal
        isOpen={true}
        onClose={handleClose}
        customTitle="Confirm Meals"
        customSubtitle="Please review your choices"
        directSelections={[
          {
            day: 'Monday',
            mealName: 'Fried Rice',
            calories: 500,
            selectionType: 'MEAL',
          },
          {
            day: 'Tuesday',
            mealName: 'Unavailable',
            selectionType: 'UNAVAILABLE',
          },
          {
            day: 'Wednesday',
            mealName: '2x Jollof, 1x Waakye',
            isGuest: true,
            selectionType: 'MEAL',
            guestQuantities: [
              { mealName: 'Jollof', quantity: 2 },
              { mealName: 'Waakye', quantity: 1 },
            ],
          },
        ]}
        confirmButton={{
          label: 'Save Choices',
          onClick: handleConfirm,
        }}
        showCancelButton={true}
      />,
    );

    expect(screen.getByText('Confirm Meals')).toBeInTheDocument();
    expect(screen.getByText('Please review your choices')).toBeInTheDocument();
    expect(screen.getByText('Fried Rice')).toBeInTheDocument();
    expect(screen.getByText('Qty: 2')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const confirmBtn = screen.getByRole('button', { name: 'Save Choices' });
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders Save selections as preset checkbox when showSaveAsPresetCheckbox is true', () => {
    const handleCheckboxChange = jest.fn();

    renderWithProviders(
      <ViewUserSelectionsModal
        isOpen={true}
        onClose={jest.fn()}
        customTitle="Confirm Meals"
        directSelections={[]}
        showSaveAsPresetCheckbox={true}
        saveAsPresetChecked={false}
        onSaveAsPresetChange={handleCheckboxChange}
        confirmButton={{
          label: 'Confirm',
          onClick: jest.fn(),
        }}
      />,
    );

    const checkbox = screen.getByLabelText(/Save selections as preset/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(handleCheckboxChange).toHaveBeenCalledWith(true);
  });
});
