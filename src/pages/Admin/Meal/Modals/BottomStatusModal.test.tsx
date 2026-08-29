import { render, screen, fireEvent } from '@testing-library/react';
import { BottomStatusModal } from './BottomStatusModal';

describe('BottomStatusModal Component', () => {
    const defaultProps = {
        message: 'Action completed',
        onClose: jest.fn(),
        retry: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders success state correctly', () => {
        render(<BottomStatusModal {...defaultProps} type="success" />);
        expect(screen.getByText('Action completed')).toBeInTheDocument();
        const img = screen.getByRole('img');
        expect(img).toHaveAccessibleName('Success');
        
        const closeBtn = screen.getByRole('button', { name: 'Close' });
        expect(closeBtn).toBeInTheDocument();
        fireEvent.click(closeBtn);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        
        expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
    });

    it('renders error state correctly', () => {
        render(<BottomStatusModal {...defaultProps} type="error" />);
        expect(screen.getByText('Action completed')).toBeInTheDocument();
        const img = screen.getByRole('img');
        expect(img).toHaveAccessibleName('Error');
        
        const retryBtn = screen.getByRole('button', { name: 'Try Again' });
        const closeBtn = screen.getByRole('button', { name: 'Close' });
        expect(retryBtn).toBeInTheDocument();
        expect(closeBtn).toBeInTheDocument();
        
        fireEvent.click(retryBtn);
        expect(defaultProps.retry).toHaveBeenCalledTimes(1);
    });
});
