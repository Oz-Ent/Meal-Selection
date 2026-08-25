import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SelectionStatus } from './SelectionStatus';
import {
  useSubmitWeeklySelectionsMutation,
  useUpdateWeekScheduleMutation,
  useUsersQuery,
  useWeeklyNoSelectionsQuery,
  useWeekScheduleQuery,
} from '../../../api/useApiQueries';

jest.mock('../../../api/useApiQueries', () => ({
  useWeekScheduleQuery: jest.fn(),
  useWeeklyNoSelectionsQuery: jest.fn(),
  useUsersQuery: jest.fn(),
  useUpdateWeekScheduleMutation: jest.fn(),
  useSubmitWeeklySelectionsMutation: jest.fn(),
}));

const mockUpdateSchedule = jest.fn();
const mockSubmitWeekly = jest.fn();
const mockRefetchSchedule = jest.fn();
const mockRefetchNoSelections = jest.fn();
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

const sampleAllUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', status: 'ACTIVE' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', status: 'ACTIVE' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', status: 'ACTIVE' },
  { id: 4, name: 'David Lee', email: 'david@example.com', status: 'ACTIVE' },
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
      data: samplePendingPending(3),
      isLoading: false,
      refetch: mockRefetchNoSelections,
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
  });

  function samplePendingPending(count = 3) {
    return samplePendingUsers.slice(0, count);
  }

  const renderComponent = () =>
    render(
      <MemoryRouter initialEntries={['/admin/selection-status']}>
        <Routes>
          <Route path="/admin/selection-status" element={<SelectionStatus />} />
          <Route
            path="/select-meal"
            element={<div data-testid="select-meal-route">Select Meal Route</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

  it('renders the header, week details, scheduled menu, and pending users', () => {
    renderComponent();

    expect(screen.getByText('Selection Status')).toBeInTheDocument();
    expect(screen.getByText('Hub Standard Menu')).toBeInTheDocument();
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('Pending Users')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  it('filters pending users by search query', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/search pending users/i);
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
  });

  it('opens confirmation modal and closes weekly selection', async () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: /close selection/i });
    fireEvent.click(closeButton);

    expect(screen.getByText(/close selection for this week\?/i)).toBeInTheDocument();
    expect(screen.getByText(/have not submitted selections yet/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /yes, close selection/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockUpdateSchedule).toHaveBeenCalledWith({
        id: 1,
        data: { status: 'CLOSED' },
      });
      expect(mockSubmitWeekly).toHaveBeenCalledWith({
        weekNumber: expect.any(Number),
        year: expect.any(Number),
        status: 'SUBMITTED',
      });
    });
  });

  it('reopens selection when schedule is currently closed', async () => {
    (useWeekScheduleQuery as jest.Mock).mockReturnValue({
      data: { ...sampleSchedule, status: 'CLOSED' },
      isLoading: false,
      refetch: mockRefetchSchedule,
    });

    renderComponent();

    expect(screen.getByText('CLOSED')).toBeInTheDocument();

    const reopenButton = screen.getByRole('button', { name: /reopen selection/i });
    fireEvent.click(reopenButton);

    expect(screen.getByText(/reopen selection for this week\?/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /yes, reopen selection/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockUpdateSchedule).toHaveBeenCalledWith({
        id: 1,
        data: { status: 'ACTIVE' },
      });
    });
  });

  it('displays empty state when all users have submitted', () => {
    (useWeeklyNoSelectionsQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetchNoSelections,
    });

    renderComponent();

    expect(screen.getByText(/all selections submitted!/i)).toBeInTheDocument();
  });

  it('displays empty state when no menu is scheduled', () => {
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
  });

  it('navigates to select-meal when clicking Select for User', () => {
    renderComponent();

    const selectButtons = screen.getAllByRole('button', { name: /select for user/i });
    fireEvent.click(selectButtons[0]);

    expect(screen.getByTestId('select-meal-route')).toBeInTheDocument();
  });

  it('copies pending user names to clipboard and respects search filter', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    renderComponent();

    // 1. Copy all names (unique first names: Alice, Bob, Charlie)
    const copyButton = screen.getByRole('button', { name: /copy names/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `*_Those who haven't made selection for this week_*\n*Alice*\n*Bob*\n*Charlie*`,
      );
    });

    // 2. Filter and copy only filtered names
    const searchInput = screen.getByPlaceholderText(/search pending users/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `*_Those who haven't made selection for this week_*\n*Alice*`,
      );
    });
  });

  it('allows selecting individual users, toggling select all, and navigating to batch select meals', () => {
    renderComponent();

    // Check individual user
    const aliceCheckbox = screen.getByRole('button', { name: /select alice smith/i });
    fireEvent.click(aliceCheckbox);

    expect(screen.getByText(/1 user selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /batch select meals/i })).toBeInTheDocument();

    // Click "Select All"
    const selectAllBtn = screen.getByRole('button', { name: /select all/i });
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/3 users selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deselect all/i })).toBeInTheDocument();

    // Click Batch Select Meals
    const batchBtn = screen.getByRole('button', { name: /batch select meals/i });
    fireEvent.click(batchBtn);

    expect(screen.getByTestId('select-meal-route')).toBeInTheDocument();
  });
});

