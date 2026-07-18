import { render, screen, fireEvent } from '@testing-library/react';
import GoogleButton from './GoogleButton';

describe('GoogleButton Component', () => {
    it('renders the button with Google text', () => {
        const onClick = jest.fn();
        render(<GoogleButton onClick={onClick} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    });

    it('renders the Google icon', () => {
        const onClick = jest.fn();
        render(<GoogleButton onClick={onClick} />);
        const img = screen.getByAltText('Google');
        expect(img).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const onClick = jest.fn();
        render(<GoogleButton onClick={onClick} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom style', () => {
        const onClick = jest.fn();
        render(<GoogleButton onClick={onClick} style={{ width: '100%' }} />);
        const button = screen.getByRole('button');
        expect(button).toHaveStyle({ width: '100%' });
    });
});
