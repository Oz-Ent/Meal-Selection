import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
    it('renders with label correctly', () => {
        const onClick = jest.fn();
        render(<Button label="Submit" onClick={onClick} />);
        expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('renders children if provided instead of label', () => {
        const onClick = jest.fn();
        render(
            <Button onClick={onClick}>
                <span data-testid="child">Child Content</span>
            </Button>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const onClick = jest.fn();
        render(<Button label="Click Me" onClick={onClick} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        const onClick = jest.fn();
        render(<Button label="Disabled" disabled onClick={onClick} />);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('is disabled and shows spinner when pending is true', () => {
        const onClick = jest.fn();
        render(<Button label="Pending" pending onClick={onClick} />);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
        // The LoadingSpinner should be present, rendering the spinner div
        // (Assuming standard LoadingSpinner has animate-spin class)
        expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
        const onClick = jest.fn();
        const { container } = render(<Button label="Danger" variant="danger" onClick={onClick} />);
        expect(container.firstChild).toHaveClass('bg-red-600');
    });
});
