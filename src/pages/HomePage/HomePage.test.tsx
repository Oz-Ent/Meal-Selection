import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage Component', () => {
    it('renders the Home Page text', () => {
        render(<HomePage />);
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
        const { container } = render(<HomePage />);
        expect(container.firstChild?.nodeName).toBe('DIV');
    });
});
