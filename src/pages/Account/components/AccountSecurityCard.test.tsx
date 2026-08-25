import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountSecurityCard } from './AccountSecurityCard';

const mockMutateAsync = jest.fn();

jest.mock('../../../api/useApiQueries', () => ({
  useChangePasswordMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

describe('AccountSecurityCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders password input fields and headers', () => {
    render(<AccountSecurityCard />);

    expect(screen.getByText('Security & Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
  });

  it('shows error if current password is empty on submit', () => {
    render(<AccountSecurityCard />);

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    expect(screen.getByText('Please enter your current password.')).toBeInTheDocument();
  });

  it('shows error if new password is too short', () => {
    render(<AccountSecurityCard />);

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldPass123' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    expect(screen.getByText('New password must be at least 6 characters.')).toBeInTheDocument();
  });

  it('shows error if passwords do not match', () => {
    render(<AccountSecurityCard />);

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldPass123' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newPass123' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'differentPass' } });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
  });

  it('toggles password visibility for inputs', () => {
    render(<AccountSecurityCard />);

    const currentInput = screen.getByLabelText('Current Password');
    expect(currentInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: 'Show current password' });
    fireEvent.click(toggleBtn);
    expect(currentInput).toHaveAttribute('type', 'text');
  });

  it('submits change password successfully', async () => {
    mockMutateAsync.mockResolvedValue({ message: 'Password changed successfully!' });

    render(<AccountSecurityCard />);

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldPass123' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newSecretPass' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'newSecretPass' } });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        currentPassword: 'oldPass123',
        newPassword: 'newSecretPass',
      });
      expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
    });
  });
});
