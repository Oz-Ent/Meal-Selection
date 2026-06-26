import { render, screen } from '@testing-library/react';
import { EmptyPage } from './EmptyPage';

describe('EmptyPage Component', () => {
    it('renders the item name correctly', () => {
        render(<EmptyPage item="User" />);
        expect(screen.getByText(/There are no Users, click on “add” to create a new User/i)).toBeInTheDocument();
        const img = screen.getByRole('img', { name: /empty/i });
        expect(img).toBeInTheDocument();
    });
});
