import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';



describe('Modal Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
        document.body.style.overflow = 'auto';
    });

    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        variant: 'center' as const,
    };

    it('should not render anything when isOpen is false', () => {
        render(<Modal {...defaultProps} isOpen={false}><div data-testid="content">Test Content</div></Modal>);
        expect(screen.queryByTestId('content')).toBeNull();
    });

    it('should render children when isOpen is true', () => {
        render(<Modal {...defaultProps}><div data-testid="content">Test Content</div></Modal>);
        expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should call onClose when the backdrop is clicked', () => {
        const onClose = jest.fn();
        render(<Modal {...defaultProps} onClose={onClose}><div>Test Content</div></Modal>);
        
        const content = screen.getByText('Test Content');
        const modalContainer = content.parentElement?.parentElement; 
        const backdrop = modalContainer?.parentElement;

        if (backdrop) {
            fireEvent.click(backdrop);
            expect(onClose).toHaveBeenCalledTimes(1);
        }
    });

    it('should not call onClose when clicking inside the modal content', () => {
        const onClose = jest.fn();
        render(<Modal {...defaultProps} onClose={onClose}><div data-testid="content">Test Content</div></Modal>);
        
        const contentContainer = screen.getByTestId('content');
        fireEvent.click(contentContainer);
        

        expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when the Escape key is pressed', () => {
        const onClose = jest.fn();
        render(<Modal {...defaultProps} onClose={onClose}><div>Test Content</div></Modal>);
        
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should lock body scroll when open and restore when closed', () => {
        const { unmount } = render(<Modal {...defaultProps}><div>Test Content</div></Modal>);
        expect(document.body.style.overflow).toBe('hidden');

        unmount(); 
        expect(document.body.style.overflow).toBe('auto');
    });

    describe('Close Button', () => {
        it('should render the close button if showCloseButton is true', () => {
            render(<Modal {...defaultProps} showCloseButton={true}><div>Test Content</div></Modal>);
            expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
        });

        it('should not render the close button if showCloseButton is false or omitted', () => {
            render(<Modal {...defaultProps} showCloseButton={false}><div>Test Content</div></Modal>);
            expect(screen.queryByRole('button', { name: /close modal/i })).toBeNull();
        });

        it('should call onClose when the close button is clicked', () => {
            const onClose = jest.fn();
            render(<Modal {...defaultProps} onClose={onClose} showCloseButton={true}><div>Test Content</div></Modal>);
            
            const closeBtn = screen.getByRole('button', { name: /close modal/i });
            fireEvent.click(closeBtn);
            
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
