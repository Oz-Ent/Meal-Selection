import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResetEmail } from './ResetEmail';

jest.mock('../../../../api/useApiQueries', () => ({
  useGeneratePasswordTokenMutation: () => ({ mutateAsync: jest.fn() }),
}));

describe('ResetEmail Page', () => {
  it('renders the Email heading', () => {
    render(
      <MemoryRouter>
        <ResetEmail />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Email/i })).toBeInTheDocument();
  });

  it('renders the email image', () => {
    render(
      <MemoryRouter>
        <ResetEmail />
      </MemoryRouter>,
    );
    expect(screen.getByAltText('Email')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(
      <MemoryRouter>
        <ResetEmail />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/Enter the email you would like to reset your password with/i),
    ).toBeInTheDocument();
  });

  it('renders the email input field', () => {
    render(
      <MemoryRouter>
        <ResetEmail />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('renders the Continue button', () => {
    render(
      <MemoryRouter>
        <ResetEmail />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  it('renders the Continue button as disabled when email is empty', () => {
    render(
      <MemoryRouter>
        <ResetEmail />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled();
  });

  it('shows error for invalid email format', () => {
    render(
      <MemoryRouter>
        <ResetEmail />
      </MemoryRouter>,
    );
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    expect(screen.getByText('Invalid email.')).toBeInTheDocument();
  });

  it('does not show error for valid email format', () => {
    render(
      <MemoryRouter>
        <ResetEmail />
      </MemoryRouter>,
    );
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    expect(screen.queryByText('Invalid email.')).not.toBeInTheDocument();
  });
});
