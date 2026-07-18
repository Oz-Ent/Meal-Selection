import { render, screen, fireEvent } from '@testing-library/react';
import AuthLink from './AuthLink';

describe('AuthLink Component', () => {
    it('renders the text correctly', () => {
        const onClick = jest.fn();
        render(<AuthLink text="Sign up" onClick={onClick} />);
        expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const onClick = jest.fn();
        render(<AuthLink text="Sign up" onClick={onClick} />);
        fireEvent.click(screen.getByText('Sign up'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders as an anchor element', () => {
        const onClick = jest.fn();
        render(<AuthLink text="Sign up" onClick={onClick} />);
        const link = screen.getByText('Sign up');
        expect(link.tagName).toBe('A');
    });

    it('applies the href from the to prop', () => {
        const onClick = jest.fn();
        render(<AuthLink text="Sign up" onClick={onClick} to="/signup" />);
        const link = screen.getByText('Sign up');
        expect(link).toHaveAttribute('href', '/signup');
    });

    it('applies custom className', () => {
        const onClick = jest.fn();
        render(<AuthLink text="Sign up" onClick={onClick} className="custom-class" />);
        const link = screen.getByText('Sign up');
        expect(link).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
        const onClick = jest.fn();
        render(<AuthLink text="Sign up" onClick={onClick} style={{ color: 'red' }} />);
        const link = screen.getByText('Sign up');
        expect(link).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });
});
