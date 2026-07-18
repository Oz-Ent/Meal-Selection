import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResetSuccess } from './ResetSuccess';

describe('ResetSuccess Page', () => {
    it('renders the Successful heading', () => {
        render(
            <MemoryRouter>
                <ResetSuccess />
            </MemoryRouter>
        );
        expect(screen.getByText('Successful')).toBeInTheDocument();
    });

    it('renders the success image', () => {
        render(
            <MemoryRouter>
                <ResetSuccess />
            </MemoryRouter>
        );
        expect(screen.getByAltText('Password reset successful')).toBeInTheDocument();
    });

    it('renders the success description text', () => {
        render(
            <MemoryRouter>
                <ResetSuccess />
            </MemoryRouter>
        );
        expect(screen.getByText(/Your password has been reset successfully/i)).toBeInTheDocument();
    });

    it('renders the Back To Login button', () => {
        render(
            <MemoryRouter>
                <ResetSuccess />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /Back To Login/i })).toBeInTheDocument();
    });
});
