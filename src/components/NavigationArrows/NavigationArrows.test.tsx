import { render, screen, fireEvent } from '@testing-library/react';
import NavigationArrows from './NavigationArrows';

describe('NavigationArrows Component', () => {
    const defaultProps = {
        prevDisabled: false,
        nextDisabled: false,
        ariaSectionName: 'Steps',
        onPrevClick: jest.fn(),
        onNextClick: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders buttons correctly', () => {
        render(<NavigationArrows {...defaultProps} />);
        expect(screen.getByRole('button', { name: 'Previous Steps' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Next Steps' })).toBeInTheDocument();
    });

    it('handles previous click', () => {
        render(<NavigationArrows {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Previous Steps' }));
        expect(defaultProps.onPrevClick).toHaveBeenCalledTimes(1);
    });

    it('handles next click', () => {
        render(<NavigationArrows {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Next Steps' }));
        expect(defaultProps.onNextClick).toHaveBeenCalledTimes(1);
    });

    it('disables previous button', () => {
        render(<NavigationArrows {...defaultProps} prevDisabled={true} />);
        expect(screen.getByRole('button', { name: 'Previous Steps' })).toBeDisabled();
    });

    it('disables next button', () => {
        render(<NavigationArrows {...defaultProps} nextDisabled={true} />);
        expect(screen.getByRole('button', { name: 'Next Steps' })).toBeDisabled();
    });

    it('renders center content if provided', () => {
        render(<NavigationArrows {...defaultProps} centerContent={<span data-testid="center">Center</span>} />);
        expect(screen.getByTestId('center')).toBeInTheDocument();
    });
});
