import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFound';

describe('NotFound Page', () => {
    it('renders the 404 heading', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );
        expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
    });

    it('renders the description text', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/The page you are looking for does not exist/i)).toBeInTheDocument();
    });

    it('renders a link back to home', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        );
        const link = screen.getByRole('link', { name: /return to home/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/');
    });
});
