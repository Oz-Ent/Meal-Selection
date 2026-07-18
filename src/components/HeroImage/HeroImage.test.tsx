import { render, screen } from '@testing-library/react';
import HeroImage from './HeroImage';

describe('HeroImage Component', () => {
    it('renders the hero image with correct alt text', () => {
        render(<HeroImage />);
        const img = screen.getByAltText('Image of welcoming face and food.');
        expect(img).toBeInTheDocument();
    });

    it('renders as an img element', () => {
        render(<HeroImage />);
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
    });

    it('has a src attribute', () => {
        render(<HeroImage />);
        const img = screen.getByAltText('Image of welcoming face and food.');
        expect(img).toHaveAttribute('src');
    });
});
