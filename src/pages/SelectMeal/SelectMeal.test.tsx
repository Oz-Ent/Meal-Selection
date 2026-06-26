import { render, screen, fireEvent } from '@testing-library/react';
import SelectMealPage from './SelectMeal';

jest.mock('../../helpers/availableMeals', () => ({
    availableMeals: [
        { id: '1', title: 'Pizza', imageUrl: 'pizza.png' }
    ]
}));

// Mock SuccessModal to prevent it from doing complex rendering logic
jest.mock('./SuccessModal', () => ({
    SuccessModal: () => <div data-testid="success-modal">Success Modal</div>
}));

describe('SelectMealPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders and navigates through days', () => {
        render(<SelectMealPage />);

        // By default should be Monday
        expect(screen.getByText('Monday')).toBeInTheDocument();

        // Select a meal to enable Next button
        const pizzaRadio = screen.getAllByRole('radio')[0]; // Pizza
        fireEvent.click(pizzaRadio);

        const nextBtn = screen.getByRole('button', { name: 'Next' });
        expect(nextBtn).not.toBeDisabled();
        
        // Go to Tuesday
        fireEvent.click(nextBtn);
        expect(screen.getByText('Tuesday')).toBeInTheDocument();
        
        // Go back to Monday
        const prevBtn = screen.getByRole('button', { name: 'Previous day navigation' });
        fireEvent.click(prevBtn);
        expect(screen.getByText('Monday')).toBeInTheDocument();
    });

    it('shows confirmation modal on last day and confirms', () => {
        render(<SelectMealPage />);

        // We need to click "Next" until Friday. For a quicker test, we can just select custom for all days
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        for (let i = 0; i < days.length; i++) {
            // Select pizza
            const pizzaRadio = screen.getAllByRole('radio')[0];
            fireEvent.click(pizzaRadio);
            
            const actionBtn = screen.getByRole('button', { name: i === days.length - 1 ? 'Confirm Menu' : 'Next' });
            fireEvent.click(actionBtn);
        }

        // Now confirm modal should be open
        expect(screen.getByText('Confirm Meal')).toBeInTheDocument();
        
        // Click Confirm
        const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
        fireEvent.click(confirmBtn);

        // SuccessModal should appear
        expect(screen.getByTestId('success-modal')).toBeInTheDocument();
    });
});
