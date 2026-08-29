import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountProfileCard } from './AccountProfileCard';
import type { UserProfileResponse } from '../../../api/Services/UserServices';

const mockMutateAsync = jest.fn();
let mockIsPending = false;

jest.mock('../../../api/useApiQueries', () => ({
  useUpdateUserProfileMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: mockIsPending,
  }),
}));

const mockProfile: UserProfileResponse = {
  id: 1,
  name: 'Kofi Mensah',
  email: 'kofi.mensah@example.com',
  referenceEmail: 'kofi@company.com',
  referenceId: 1042,
  roleName: 'Software Engineer',
  roleId: 2,
  status: 'ACTIVE',
  createdAt: '2023-01-15T00:00:00.000Z',
  isActivated: true,
  leaves: [],
  upcomingOrActiveLeaves: [],
  totalLeaveDays: 0,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AccountProfileCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPending = false;
  });

  it('renders user initials avatar, full name, emails, and reference details', () => {
    render(<AccountProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    expect(screen.getByText('KM')).toBeInTheDocument();
    expect(screen.getByText('Kofi Mensah')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Jan 2023')).toBeInTheDocument();
    expect(screen.getByText('#1042')).toBeInTheDocument();
    expect(screen.getByText('kofi.mensah@example.com')).toBeInTheDocument();
  });

  it('opens edit modal and displays current user details', () => {
    render(<AccountProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const editBtn = screen.getByRole('button');
    fireEvent.click(editBtn);

    expect(screen.getByText('Edit Account Details')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kofi Mensah')).toBeInTheDocument();
    expect(screen.getByDisplayValue('kofi.mensah@example.com')).toBeInTheDocument();
  });

  it('shows error when typing invalid email address or disposable domains', () => {
    render(<AccountProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const editBtn = screen.getByRole('button');
    fireEvent.click(editBtn);

    const emailInput = screen.getByDisplayValue('kofi.mensah@example.com');

    // Test invalid format
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).toBeDisabled();

    // Test disposable domain
    fireEvent.change(emailInput, { target: { value: 'test@mailinator.com' } });
    expect(screen.getByText(/Disposable \/ temporary email addresses cannot receive notification/i)).toBeInTheDocument();
    expect(saveBtn).toBeDisabled();
  });

  it('shows typo suggestions and applies suggestion on click', () => {
    render(<AccountProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const editBtn = screen.getByRole('button');
    fireEvent.click(editBtn);

    const emailInput = screen.getByDisplayValue('kofi.mensah@example.com');
    fireEvent.change(emailInput, { target: { value: 'kofi@gmai.com' } });

    expect(screen.getByText(/Did you mean/i)).toBeInTheDocument();
    expect(screen.getByText('kofi@gmail.com')).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /Apply/i });
    fireEvent.click(applyBtn);

    expect(screen.getByDisplayValue('kofi@gmail.com')).toBeInTheDocument();
    expect(screen.getByText(/Valid email address ready for notifications/i)).toBeInTheDocument();
  });

  it('submits updated email successfully', async () => {
    mockMutateAsync.mockResolvedValueOnce({ id: 1, email: 'kofi.updated@example.com' });

    render(<AccountProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const editBtn = screen.getByRole('button');
    fireEvent.click(editBtn);

    const emailInput = screen.getByDisplayValue('kofi.mensah@example.com');
    fireEvent.change(emailInput, { target: { value: 'kofi.updated@example.com' } });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 1,
        data: {
          name: 'Kofi Mensah',
          email: 'kofi.updated@example.com',
        },
      });
    });
  });

  it('displays progress indicator when mutation is pending', () => {
    mockIsPending = true;

    render(<AccountProfileCard profile={mockProfile} />, { wrapper: createWrapper() });

    const editBtn = screen.getByRole('button');
    fireEvent.click(editBtn);

    const saveBtn = screen.getByRole('button', { name: /Saving Changes.../i });
    expect(saveBtn).toBeDisabled();
    expect(saveBtn.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
