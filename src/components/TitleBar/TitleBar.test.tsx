import { render, screen } from '@testing-library/react';
import { TitleBar } from './TitleBar';

describe('TitleBar Component', () => {
    it('renders the greeting and logout button', () => {
        render(<TitleBar />);
        expect(screen.getByText(/Hi Eric,/i)).toBeInTheDocument();
        const logoutBtn = screen.getByRole('button');
        expect(logoutBtn).toBeInTheDocument();
        // Check for LogoutIcon SVG by class or tag if necessary
        expect(logoutBtn.querySelector('svg')).toBeInTheDocument();
    });
});
