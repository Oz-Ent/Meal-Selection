import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SelectionStatus } from './SelectionStatus';
import {
  useBulkDeleteGuestSelectionsMutation,
  useDeleteGuestSelectionMutation,
  useSubmitWeeklySelectionsMutation,
  useUpdateWeekScheduleMutation,
  useUsersQuery,
  useWeeklyGuestSelectionsQuery,
  useWeeklyNoSelectionsQuery,
  useWeeklySelectionsQuery,
  useWeeklyWithSelectionsQuery,
  useWeekScheduleQuery,
} from '../../../api/useApiQueries';

jest.mock('../../../api/useApiQueries', () => ({
  useWeekScheduleQuery: jest.fn(),
  useWeeklyNoSelectionsQuery: jest.fn(),
  useWeeklyWithSelectionsQuery: jest.fn(),
  useWeeklyGuestSelectionsQuery: jest.fn(),
  useWeeklySelectionsQuery: jest.fn(),
  useUsersQuery: jest.fn(),
  useUpdateWeekScheduleMutation: jest.fn(),
  useSubmitWeeklySelectionsMutation: jest.fn(),
  useDeleteGuestSelectionMutation: jest.fn(),
  useBulkDeleteGuestSelectionsMutation: jest.fn(),
}));

const mockUpdateSchedule = jest.fn();
const mockSubmitWeekly = jest.fn();
const mockDeleteGuest = jest.fn();
const mockBulkDeleteGuest = jest.fn();
const mockRefetchSchedule = jest.fn();
const mockRefetchNoSelections = jest.fn();
const mockRefetchWithSelections = jest.fn();
const mockRefetchGuestSelections = jest.fn();
const mockRefetchUsers = jest.fn();

const sampleSchedule = {
  id: 1,
  week: 34,
  year: 2026,
  status: 'ACTIVE',
  menu: { id: 10, title: 'Hub Standard Menu' },
};

const samplePendingUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
];

const sampleSubmittedUsers = [
  { id: 4, name: 'David Lee', email: 'david@example.com', status: 'ACTIVE' },
];

const sampleAllUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', status: 'ACTIVE' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', status: 'ACTIVE' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', status: 'ACTIVE' },
  { id: 4, name: 'David Lee', email: 'david@example.com', status: 'ACTIVE' },
];

const sampleGuestSelections = [
  {
    id: 101,
    guestCount: 1,
    weekMenuScheduleId: 1,
    selectionStatus: 'SUBMITTED',
    selectionType: 'MEAL',
    createdByUser: { id: 4, name: 'David Lee' },
    menuDay: { id: 1, day: 'MONDAY' },
    dayMeal: {
      id: 50,
      meal: {
        id: 10,
        name: 'Jollof Rice & Chicken',
        imagePath: '/images/jollof.jpg',
        calories: 650,
      },
    },
  },
  {
    id: 102,
    guestCount: 3,
    weekMenuScheduleId: 1,
    selectionStatus: 'SUBMITTED',
    selectionType: 'MEAL',
    createdByUser: { id: 4, name: 'David Lee' },
    menuDay: { id: 2, day: 'TUESDAY' },
    dayMeal: {
      id: 51,
      meal: {
        id: 11,
        name: 'Fried Rice & Beef',
        imagePath: '/images/fried_rice.jpg',
        calories: 700,
      },
    },
  },
];

describe('SelectionStatus Admin Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useWeekScheduleQuery as jest.Mock).mockReturnValue({
      data: sampleSchedule,
      isLoading: false,
      refetch: mockRefetchSchedule,
    });

    (useWeeklyNoSelectionsQuery as jest.Mock).mockReturnValue({
      data: samplePendingUsers,
      isLoading: false,
      refetch: mockRefetchNoSelections,
    });

    (useWeeklyWithSelectionsQuery as jest.Mock).mockReturnValue({
      data: sampleSubmittedUsers,
      isLoading: false,
      refetch: mockRefetchWithSelections,
    });

    (useWeeklyGuestSelectionsQuery as jest.Mock).mockReturnValue({
      data: sampleGuestSelections,
      isLoading: false,
      refetch: mockRefetchGuestSelections,
    });

    (useWeeklySelectionsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    (useUsersQuery as jest.Mock).mockReturnValue({
      data: sampleAllUsers,
      isLoading: false,
      refetch: mockRefetchUsers,
    });

    (useUpdateWeekScheduleMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdateSchedule,
      isPending: false,
    });

    (useSubmitWeeklySelectionsMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockSubmitWeekly,
      isPending: false,
    });

    (useDeleteGuestSelectionMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockDeleteGuest.mockResolvedValue({
        deleted: true,
        remainingCount: 0,
        message: 'Guest selection removed.',
      }),
      isPending: false,
    });

    (useBulkDeleteGuestSelectionsMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockBulkDeleteGuest.mockResolvedValue({
        deletedCount: 1,
        message: 'Deleted 1 guest selection(s).',
      }),
      isPending: false,
    });
  });

  const TestSelectMealTarget = () => {
    const location = useLocation();
    return (
      <div data-testid="select-meal-route">
        <span>Select Meal Route</span>
        <span data-testid="search-params">{location.search}</span>
      </div>
    );
  };

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/admin/selection-status']}>
        <Routes>
          <Route path="/admin/selection-status" element={<SelectionStatus />} />
          <Route path="/select-meal" element={<TestSelectMealTarget />} />
        </Routes>
      </MemoryRouter>,
    );

  it('renders the header, week details, scheduled menu, and pending users', () => {
    renderComponent();

    expect(screen.getByText('Selection Status')).toBeInTheDocument();
    expect(screen.getByText('Hub Standard Menu')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getAllByText('Pending Users').length).toBeGreaterThan(0);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  it('calculates metrics correctly for unscheduled weeks as 0/0 and 0%', () => {
    (useWeekScheduleQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: mockRefetchSchedule,
    });
    (useWeeklyNoSelectionsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetchNoSelections,
    });

    renderComponent();

    expect(screen.getAllByText(/no menu scheduled/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /schedule a menu/i })).toBeInTheDocument();

    // Check completion rate and metrics
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText(/0 of 4|0 of 40/)).toBeInTheDocument();
  });

  it('filters pending users by search query', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/search pending users/i);
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
  });

  it('navigates to select-meal with week and year when clicking Select for User', () => {
    renderComponent();

    const selectButtons = screen.getAllByRole('button', { name: /select for user/i });
    fireEvent.click(selectButtons[0]);

    expect(screen.getByTestId('select-meal-route')).toBeInTheDocument();
    const search = screen.getByTestId('search-params').textContent;
    expect(search).toContain('forSomeone=true');
    expect(search).toContain('userId=1');
    expect(search).toContain('week=');
    expect(search).toContain('year=');
  });

  it('allows switching to Submitted tab and viewing submitted user selections', () => {
    renderComponent();

    const submittedTab = screen.getByRole('button', { name: /submitted/i });
    fireEvent.click(submittedTab);

    // David Lee is submitted (active user not in pending list)
    expect(screen.getByText('David Lee')).toBeInTheDocument();
    expect(screen.getByText('david@example.com')).toBeInTheDocument();

    // Click "View Selections" opens modal
    const viewBtn = screen.getByRole('button', { name: /view selections/i });
    fireEvent.click(viewBtn);

    expect(screen.getAllByText(/david lee/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/edit meals/i)).toBeInTheDocument();
  });

  it('allows switching to Guest Meals tab, opens confirmation modal for single portion and multi-portions', async () => {
    renderComponent();

    const guestTab = screen.getByRole('button', { name: /guest meals/i });
    fireEvent.click(guestTab);

    expect(screen.getByText('Jollof Rice & Chicken')).toBeInTheDocument();
    expect(screen.getByText('1 portion')).toBeInTheDocument();
    expect(screen.getByText('Fried Rice & Beef')).toBeInTheDocument();
    expect(screen.getByText('3 portions')).toBeInTheDocument();

    // Click delete on 1-portion item -> opens confirmation modal
    const deleteButtons = screen.getAllByRole('button', { name: /delete guest selection/i });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/delete guest selection/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmSingleDeleteBtn = screen.getByRole('button', { name: /delete selection/i });
    fireEvent.click(confirmSingleDeleteBtn);

    await waitFor(() => {
      expect(mockDeleteGuest).toHaveBeenCalledWith({ id: 101, count: 1 });
    });

    // Click delete on 3-portion item -> opens modal to choose portions to delete
    fireEvent.click(deleteButtons[1]);

    expect(screen.getByText(/remove guest selections/i)).toBeInTheDocument();
    expect(screen.getByText(/portions to delete/i)).toBeInTheDocument();

    // Increase to 2 portions and delete
    const plusBtn = screen.getByRole('button', { name: /increase portions to delete/i });
    fireEvent.click(plusBtn);

    const confirmDeleteBtn = screen.getByRole('button', { name: /delete \(2\)/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockDeleteGuest).toHaveBeenCalledWith({ id: 102, count: 2 });
    });
  });

  it('copies pending user names to clipboard and respects search filter', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    renderComponent();

    const copyButton = screen.getByRole('button', { name: /copy names/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `*_Those who haven't made selection for this week_*\n*Alice*\n*Bob*\n*Charlie*`,
      );
    });
  });

  it('allows selecting individual users, toggling select all, and navigating to batch select meals with week params', () => {
    renderComponent();

    // Select a single user
    fireEvent.click(screen.getByRole('button', { name: /select alice smith/i }));

    const batchBtn = screen.getByRole('button', { name: /select meals/i });
    const batchBar = batchBtn.closest('div.sticky');
    expect(batchBar).toHaveTextContent(/1\s*user selected/i);

    // Click "Select All"
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));

    expect(batchBar).toHaveTextContent(/3\s*users selected/i);
    expect(screen.getByRole('button', { name: /deselect all/i })).toBeInTheDocument();

    // Navigate to batch meal selection
    fireEvent.click(batchBtn);

    expect(screen.getByTestId('select-meal-route')).toBeInTheDocument();
    const search = screen.getByTestId('search-params').textContent;
    expect(search).toContain('forSomeone=true');
    expect(search).toContain('userIds=1,2,3');
    expect(search).toContain('week=');
    expect(search).toContain('year=');
  });

  it('shows a progress indicator on the Guest Meals tab when guest selections are refetching', () => {
    (useWeeklyGuestSelectionsQuery as jest.Mock).mockReturnValue({
      data: sampleGuestSelections,
      isLoading: false,
      isFetching: true,
      refetch: mockRefetchGuestSelections,
    });

    renderComponent();

    const guestTab = screen.getByRole('button', { name: /guest meals/i });
    fireEvent.click(guestTab);

    expect(screen.getByTestId('guest-fetching-indicator')).toBeInTheDocument();
    expect(screen.getByText(/updating guest selections\.\.\./i)).toBeInTheDocument();
  });

  it('allows checking 1-portion guest meals and performing bulk deletion with confirmation modal', async () => {
    renderComponent();

    const guestTab = screen.getByRole('button', { name: /guest meals/i });
    fireEvent.click(guestTab);

    // 1-portion item has a checkbox (Jollof Rice & Chicken)
    const select1PortionBtn = screen.getByRole('button', {
      name: /select guest meal jollof rice & chicken/i,
    });
    expect(select1PortionBtn).toBeInTheDocument();

    // Check the box for Jollof Rice (id: 101)
    fireEvent.click(select1PortionBtn);

    // Floating action bar appears
    const deleteSelectedBtn = screen.getByRole('button', { name: /delete selected \(1\)/i });
    expect(deleteSelectedBtn).toBeInTheDocument();
    expect(deleteSelectedBtn.closest('div.sticky')).toHaveTextContent(/1\s*guest meal selected/i);

    // Clicking delete selected opens confirmation modal
    fireEvent.click(deleteSelectedBtn);

    expect(screen.getByText(/delete 1 guest selection\?/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete 1 selected guest meal/i)).toBeInTheDocument();

    // Click confirm delete
    const confirmDeleteBtn = screen.getByRole('button', { name: /confirm delete/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockBulkDeleteGuest).toHaveBeenCalledWith([101]);
    });
  });
});
