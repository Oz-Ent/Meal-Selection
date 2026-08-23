import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Account } from './Account';

const mockProfile = {
  id: 101,
  name: 'Jane Doe',
  email: 'jane.doe@personal.com',
  referenceEmail: 'jane.doe@seneca.com',
  referenceId: 101,
  status: 'ACTIVE',
  roleId: 2,
  roleName: 'Admin',
  createdAt: '2025-01-15T10:00:00Z',
  isActivated: true,
  preferences: {
    userId: 101,
    dislikes: ['Pork', 'Mushrooms'],
    excludedMealIds: [],
    updatedAt: '2025-02-01T10:00:00Z',
  },
  leaves: [
    {
      id: 1,
      userId: 101,
      startDate: '2026-09-01T00:00:00Z',
      endDate: '2026-09-05T00:00:00Z',
      daysCount: 5,
      createdAt: '2026-08-20T00:00:00Z',
    },
  ],
  upcomingOrActiveLeaves: [
    {
      id: 1,
      userId: 101,
      startDate: '2026-09-01T00:00:00Z',
      endDate: '2026-09-05T00:00:00Z',
      daysCount: 5,
      createdAt: '2026-08-20T00:00:00Z',
    },
  ],
  totalLeaveDays: 5,
  stats: {
    totalSelections: 24,
    totalPresets: 3,
  },
};

const mockMutateAsync = jest.fn();
const mockLogout = jest.fn();
const mockRefetch = jest.fn();

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: {
      user: {
        id: 101,
        email: 'jane.doe@seneca.com',
        name: 'Jane Doe',
        roleId: 2,
        roleName: 'Admin',
      },
    },
    token: 'fake-token',
    refreshToken: 'fake-refresh-token',
    logout: mockLogout,
  }),
}));

const mockUpdatePreferencesMutation = jest.fn();

jest.mock('../../api/useApiQueries', () => ({
  useUserProfileQuery: () => ({
    data: mockProfile,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  }),
  useUserPreferencesQuery: () => ({
    data: mockProfile.preferences,
    isLoading: false,
    error: null,
  }),
  useUpdateUserPreferencesMutation: () => ({
    mutateAsync: mockUpdatePreferencesMutation,
    isPending: false,
  }),
  useFoodLibraryQuery: () => ({
    data: [
      { id: 1, name: 'Pork', foodCode: 'PK', foodGroup: 'PROTEIN' },
      { id: 2, name: 'Mushrooms', foodCode: 'MS', foodGroup: 'BASE' },
    ],
    isLoading: false,
  }),
  useMealsQuery: () => ({
    data: {
      message: 'Meals fetched',
      meals: [],
    },
    isLoading: false,
  }),
  useChangePasswordMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

jest.mock('../../api/Services/AuthServices', () => ({
  authService: {
    logout: jest.fn().mockResolvedValue({ message: 'Logged out' }),
  },
}));

describe('Account Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders account page title and main sections', () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Account & Settings/i })).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getAllByText('jane.doe@seneca.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
  });

  it('renders leave days information correctly', () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    expect(screen.getByText(/Leave Days & Availability/i)).toBeInTheDocument();
    expect(screen.getByText('5 Days')).toBeInTheDocument();
    expect(screen.getByText(/Available for Meals/i)).toBeInTheDocument();
  });

  it('renders dietary preferences and shortcuts', () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    expect(screen.getByText(/Meal & Dietary Preferences/i)).toBeInTheDocument();
    expect(screen.getByText('Pork')).toBeInTheDocument();
    expect(screen.getByText('Mushrooms')).toBeInTheDocument();
    expect(screen.getByText(/3 active presets/i)).toBeInTheDocument();
  });

  it('validates password change submission', async () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Please enter your current password/i)).toBeInTheDocument();
  });

  it('submits password change when fields are valid', async () => {
    mockMutateAsync.mockResolvedValueOnce({ message: 'Password successfully updated!' });

    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter current password/i), {
      target: { value: 'OldPass123!' },
    });
    fireEvent.change(screen.getByPlaceholderText(/At least 6 characters/i), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Re-enter new password/i), {
      target: { value: 'NewPass123!' },
    });

    const submitBtn = screen.getByRole('button', { name: /Change Password/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      });
    });

    expect(await screen.findByText(/Password successfully updated!/i)).toBeInTheDocument();
  });

  it('opens logout confirmation modal and logs out user', async () => {
    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    const signOutBtns = screen.getAllByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtns[0]);

    expect(screen.getByText(/Sign Out of Account\?/i)).toBeInTheDocument();

    const allSignOutBtns = screen.getAllByRole('button', { name: /Sign Out/i });
    const modalConfirmBtn = allSignOutBtns[allSignOutBtns.length - 1];
    fireEvent.click(modalConfirmBtn);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('opens preferences modal and allows updating exclusions', async () => {
    mockUpdatePreferencesMutation.mockResolvedValueOnce({ message: 'Updated' });

    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    const configureBtn = screen.getByRole('button', { name: /Configure/i });
    fireEvent.click(configureBtn);

    expect(screen.getByText(/Manage Meal Preferences/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /Save Preferences/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdatePreferencesMutation).toHaveBeenCalled();
    });
  });
});
