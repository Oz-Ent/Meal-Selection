import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
    const defaultProps = {
        type: 'activity' as const,
        title: 'Test Card',
        description: 'Test Description',
        imageUrl: 'http://example.com/image.jpg',
    };

    it('renders the title and description correctly', () => {
        const { container } = render(<Card {...defaultProps} />);
        expect(screen.getByText('Test Card')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        const img = container.querySelector('img');
        expect(img).toHaveAttribute('src', 'http://example.com/image.jpg');
    });

    it('calls onButtonClick when the card is clicked', () => {
        const onButtonClick = jest.fn();
        const { container } = render(<Card {...defaultProps} onButtonClick={onButtonClick} />);
        fireEvent.click(container.firstChild as Element);
        expect(onButtonClick).toHaveBeenCalledTimes(1);
    });

    it('renders ellipsis button when type is menu and action is provided', () => {
        const vertEllipsisIconAction = jest.fn();
        render(<Card {...defaultProps} type="menu" vertEllipsisIconAction={vertEllipsisIconAction} />);
        const button = screen.getByRole('button', { name: /more options/i });
        expect(button).toBeInTheDocument();
        
        fireEvent.click(button);
        expect(vertEllipsisIconAction).toHaveBeenCalledTimes(1);
    });

    it('does not render ellipsis button when type is activity', () => {
        const vertEllipsisIconAction = jest.fn();
        render(<Card {...defaultProps} type="activity" vertEllipsisIconAction={vertEllipsisIconAction} />);
        expect(screen.queryByRole('button', { name: /more options/i })).not.toBeInTheDocument();
    });
});
