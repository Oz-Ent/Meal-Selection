import { render, screen, fireEvent } from '@testing-library/react';
import { MealModal } from './MealModal';

describe('MealModal Component', () => {
    const mockOnAddMeal = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly in add mode', () => {
        render(<MealModal onAddMeal={mockOnAddMeal} onClose={mockOnClose} />);
        expect(screen.getByText('New Meal')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add New Meal' })).toBeDisabled(); // Disabled initially because name is empty
    });

    it('renders correctly in edit mode with provided data', () => {
        render(
            <MealModal 
                onAddMeal={mockOnAddMeal} 
                onClose={mockOnClose} 
                isEditMode={true} 
                mealData={{ id: '1', title: 'Pizza', imageUrl: 'pizza.png' }} 
            />
        );
        expect(screen.getByRole('heading', { name: 'Edit Meal' })).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('Pizza');
        const img = screen.getByAltText('Meal Image');
        expect(img).toHaveAttribute('src', 'pizza.png');
        
        const submitBtn = screen.getByRole('button', { name: 'Edit Meal' });
        expect(submitBtn).not.toBeDisabled();
        
        fireEvent.click(submitBtn);
        expect(mockOnAddMeal).toHaveBeenCalledWith({ id: '1', title: 'Pizza', imageUrl: 'pizza.png' });
    });

    it('enables submit button when name is typed and calls onAddMeal', () => {
        render(<MealModal onAddMeal={mockOnAddMeal} onClose={mockOnClose} />);
        const input = screen.getByRole('textbox');
        const submitBtn = screen.getByRole('button', { name: 'Add New Meal' });
        
        expect(submitBtn).toBeDisabled();
        fireEvent.change(input, { target: { value: 'Burger' } });
        expect(submitBtn).not.toBeDisabled();
        
        fireEvent.click(submitBtn);
        expect(mockOnAddMeal).toHaveBeenCalledWith(expect.objectContaining({ title: 'Burger' }));
    });

    it('shows confirmation modal when attempting to close with unsaved changes', async () => {
        render(<MealModal onAddMeal={mockOnAddMeal} onClose={mockOnClose} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Burger' } });
        
        // Find close button for the Modal (from Modal component implementation)
        const closeBtn = screen.getAllByRole('button')[0]; 
        fireEvent.click(closeBtn);
        
        // Ensure confirmation dialog appears
        expect(await screen.findByText('Are you sure you want to close without saving?')).toBeInTheDocument();
        
        const yesBtn = screen.getByRole('button', { name: 'Yes' });
        fireEvent.click(yesBtn);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
