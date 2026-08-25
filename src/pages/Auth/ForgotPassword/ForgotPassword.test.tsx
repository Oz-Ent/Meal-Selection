import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPassword } from './ForgotPassword';

describe('ForgotPassword Page', () => {
    it('renders the Forgot Password heading', () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    });

    it('renders the description text', () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );
        expect(screen.getByText(/Choose your preferred method to reset password/i)).toBeInTheDocument();
    });

    it('renders the forget password image', () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );
        expect(screen.getByAltText('Forget Password')).toBeInTheDocument();
    });

    it('renders Continue with Email link', () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );
        const emailLink = screen.getByText(/Continue with Email/i);
        expect(emailLink).toBeInTheDocument();
        expect(emailLink).toHaveAttribute('href', '/forgot-password/email');
    });

    it('renders the NavBar with back navigation', () => {
        render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );
        const backLink = screen.getByRole('link', { name: 'Back' });
        expect(backLink).toHaveAttribute('href', '/login');
    });
});
