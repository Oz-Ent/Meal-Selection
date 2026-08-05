import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResetPassword } from './ResetPassword';

jest.mock('../../../../api/useApiQueries', () => ({
  useResetPasswordMutation: () => ({ mutateAsync: jest.fn() }),
}));

describe('ResetPassword Page', () => {
  it('renders the Reset Password heading', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('renders the reset password image', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    expect(screen.getByAltText('Reset Password')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Set a new password to regain access/i)).toBeInTheDocument();
  });

  it('renders two password fields', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders the Reset Password button', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('renders the Reset Password button as disabled when fields are empty', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeDisabled();
  });

  it('shows error when passwords do not match', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'password1' } });
    fireEvent.change(confirmInput, { target: { value: 'password2' } });

    const resetButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetButton);

    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
  });

  it('does not show error when passwords match', () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );
    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm Password');

    fireEvent.change(passwordInput, { target: { value: 'password1' } });
    fireEvent.change(confirmInput, { target: { value: 'password1' } });

    const resetButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetButton);

    expect(screen.queryByText("Passwords don't match.")).not.toBeInTheDocument();
  });
});
