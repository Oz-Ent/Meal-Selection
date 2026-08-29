import { render, screen, fireEvent } from '@testing-library/react';
import StatusModal from './StatusModal';

describe('StatusModal Component', () => {
    const defaultProps = {
        isOpen: true,
        status: 'success' as const,
        message: 'Action was successful',
        onClose: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders success status correctly', () => {
        render(<StatusModal {...defaultProps} title="Success" />);
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Action was successful')).toBeInTheDocument();
        const img = screen.getByRole('img');
        expect(img).toHaveAccessibleName('Success');
    });

    it('renders error status correctly', () => {
        render(<StatusModal {...defaultProps} status="error" title="Error Occurred" />);
        expect(screen.getByText('Error Occurred')).toBeInTheDocument();
        const img = screen.getByRole('img');
        expect(img).toHaveAccessibleName('Error');
    });

    it('renders primary button and handles click', () => {
        const onPrimaryActionClick = jest.fn();
        render(
            <StatusModal
                {...defaultProps}
                primaryActionLabel="Confirm"
                onPrimaryActionClick={onPrimaryActionClick}
            />
        );
        const btn = screen.getByRole('button', { name: 'Confirm' });
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(onPrimaryActionClick).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('calls onClose if primary action click handler is not provided', () => {
        render(
            <StatusModal
                {...defaultProps}
                primaryActionLabel="Confirm"
            />
        );
        const btn = screen.getByRole('button', { name: 'Confirm' });
        fireEvent.click(btn);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('renders secondary button and handles click', () => {
        const onSecondaryActionClick = jest.fn();
        render(
            <StatusModal
                {...defaultProps}
                secondaryActionLabel="Cancel"
                onSecondaryActionClick={onSecondaryActionClick}
            />
        );
        const btn = screen.getByRole('button', { name: 'Cancel' });
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(onSecondaryActionClick).toHaveBeenCalledTimes(1);
    });
});
