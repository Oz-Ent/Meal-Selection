import { render, screen, fireEvent } from '@testing-library/react';
import { SuccessModal } from './SuccessModal';

// Mock MealOverview so we don't have to render its full tree
jest.mock('./MealOverview', () => ({
    MealOverview: () => <div data-testid="meal-overview-mock">MealOverview</div>
}));

describe('SuccessModal Component', () => {
    it('renders the success message and button', () => {
        render(<SuccessModal selectedMeals={{ monday: 'Pizza' }} />);
        expect(screen.getByText('Successful')).toBeInTheDocument();
        expect(screen.getByText(/The meals you have chosen for the week has successfully been recorded./i)).toBeInTheDocument();
        
        const btn = screen.getByRole('button', { name: 'View Your Meals For The Week' });
        expect(btn).toBeInTheDocument();
    });

    it('opens MealOverview when the button is clicked', () => {
        render(<SuccessModal selectedMeals={{ monday: 'Pizza' }} />);
        const btn = screen.getByRole('button', { name: 'View Your Meals For The Week' });
        
        expect(screen.queryByTestId('meal-overview-mock')).not.toBeInTheDocument();
        fireEvent.click(btn);
        
        // Assuming Modal handles visibility, MealOverview should now be in document
        expect(screen.getByTestId('meal-overview-mock')).toBeInTheDocument();
    });
});
