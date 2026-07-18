import { render, screen } from '@testing-library/react';
import Container from './Container';

describe('Container Component', () => {
    it('renders children correctly', () => {
        render(
            <Container>
                <p>Child content</p>
            </Container>
        );
        expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
        const { container } = render(
            <Container>
                <span>Content</span>
            </Container>
        );
        expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('applies expected styling classes', () => {
        const { container } = render(
            <Container>
                <span>Content</span>
            </Container>
        );
        const div = container.firstChild as HTMLElement;
        expect(div).toHaveClass('w-full');
        expect(div).toHaveClass('bg-white');
        expect(div).toHaveClass('rounded-3xl');
    });
});
