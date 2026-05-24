import { render, screen, fireEvent } from '@testing-library/react';
import ListCard from './ListCard';

describe('ListCard Component', () => {
    const mockOnChange = jest.fn();

    const defaultProps = {
        id: '1',
        title: 'Test Meal',
        imageUrl: 'http://example.com/image.jpg',
        selectedValue: '',
        onChange: mockOnChange,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the title and image correctly', () => {
        render(<ListCard {...defaultProps} />);
        
        expect(screen.getByText('Test Meal')).toBeInTheDocument();
        const img = screen.getByRole('img', { name: 'Test Meal' });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'http://example.com/image.jpg');
    });

    it('renders a radio button by default and handles click', () => {
        render(<ListCard {...defaultProps} />);
        
        const radio = screen.getByRole('radio');
        expect(radio).toBeInTheDocument();
        
        fireEvent.click(radio);
        expect(mockOnChange).toHaveBeenCalledWith('1');
    });

    it('renders a checkbox when inputType is checkbox and handles click', () => {
        render(<ListCard {...defaultProps} inputType="checkbox" />);
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        
        fireEvent.click(checkbox);
        expect(mockOnChange).toHaveBeenCalledWith('1');
    });

    it('renders a delete button when inputType is delete and handles click', () => {
        render(<ListCard {...defaultProps} inputType="delete" />);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        
        fireEvent.click(button);
        expect(mockOnChange).toHaveBeenCalledWith('1');
    });

    it('renders an expand button when inputType is expand and handles click', () => {
        render(<ListCard {...defaultProps} inputType="expand" />);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        
        fireEvent.click(button);
        expect(mockOnChange).toHaveBeenCalledWith('1');
    });

    it('applies selected styles when selectedValue exactly matches id as a string', () => {
        const { container } = render(<ListCard {...defaultProps} selectedValue="1" />);
        
        const span = screen.getByText('Test Meal');
        expect(span).toHaveClass('font-semibold');
        

        const label = container.querySelector('label');
        expect(label).toHaveClass('bg-gray-50');
    });

    it('applies selected styles when selectedValue is an array containing the id', () => {
        render(<ListCard {...defaultProps} inputType="checkbox" selectedValue={['1', '2']} />);
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
        
        const span = screen.getByText('Test Meal');
        expect(span).toHaveClass('font-semibold');
    });
    
    it('does not apply selected styles when selectedValue does not match', () => {
        render(<ListCard {...defaultProps} selectedValue="2" />);
        
        const span = screen.getByText('Test Meal');
        expect(span).not.toHaveClass('font-semibold');
    });
});
