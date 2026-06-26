import { render } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
    it('renders the spinner elements', () => {
        const { container } = render(<LoadingSpinner />);
        const spinnerContainer = container.firstChild as HTMLElement;
        expect(spinnerContainer).toHaveClass('flex justify-center items-center h-full w-full');
        const spinner = spinnerContainer.firstChild as HTMLElement;
        expect(spinner).toHaveClass('animate-spin');
    });
});
