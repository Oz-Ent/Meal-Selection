import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from './Signup';

jest.mock('../LoginHandler/LoginHandler', () => ({
  useLoginHandler: () => jest.fn(),
}));

jest.mock('../../../api/useApiQueries', () => ({
  useOnboardingMutation: () => ({ mutateAsync: jest.fn() }),
  useRegisterMutation: () => ({ mutateAsync: jest.fn() }),
}));

describe('Signup Page', () => {
  it('renders the Sign Up heading', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Sign up and start planning your weekly menu/i)).toBeInTheDocument();
  });

  it('renders email input field', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('renders password input field', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('renders token input field', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByRole('textbox', { name: 'Token' })).toBeInTheDocument();
  });

  it('renders keep me signed in checkbox', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/Keep me signed in/i)).toBeInTheDocument();
  });

  it('renders Sign Up button', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
  });

  it('renders login link', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Forgot Password\?/i)).toBeInTheDocument();
  });
});
