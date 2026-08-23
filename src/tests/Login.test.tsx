import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Auth/Login/Login';

jest.mock('../pages/Auth/LoginHandler/LoginHandler', () => ({
  useLoginHandler: () => jest.fn(),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

describe('Login Component', () => {
  it('renders login heading', () => {
    renderLogin();
    const heading = screen.getByRole('heading', { name: /Login/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderLogin();
    const description = screen.getByText(
      /Log in to choose your weekly meals. Create your ideal menu and make every meal a delight./i,
    );
    expect(description).toBeInTheDocument();
  });

  it('renders email input field', () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toBeInTheDocument();
  });

  it('renders password input field', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    renderLogin();
    const forgotPasswordLink = screen.getByText(/Forgot Password\?/i);
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it('renders keep me signed in checkbox', () => {
    renderLogin();
    const checkbox = screen.getByLabelText(/Keep me signed in\./i);
    expect(checkbox).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderLogin();
    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('renders sign up link', () => {
    renderLogin();
    const signUpPrompt = screen.getByText(/Don't have an account\?/i);
    const signUpLink = screen.getByRole('link', { name: /Sign up/i });
    expect(signUpPrompt).toBeInTheDocument();
    expect(signUpLink).toBeInTheDocument();
  });
});
