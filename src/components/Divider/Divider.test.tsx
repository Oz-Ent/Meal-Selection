import { render, screen } from '@testing-library/react';
import Divider from './Divider';

describe('Divider Component', () => {
    it('renders label text when provided', () => {
        render(<Divider label="Or login with" />);
        expect(screen.getByText('Or login with')).toBeInTheDocument();
    });

    it('does not render label text when not provided', () => {
        const { container } = render(<Divider />);
        const spans = container.querySelectorAll('span');
        expect(spans.length).toBe(0);
    });

    it('renders two divider lines', () => {
        const { container } = render(<Divider label="Or" />);
        const lines = container.querySelectorAll('.h-px');
        expect(lines.length).toBe(2);
    });

    it('renders two divider lines even without label', () => {
        const { container } = render(<Divider />);
        const lines = container.querySelectorAll('.h-px');
        expect(lines.length).toBe(2);
    });
});
