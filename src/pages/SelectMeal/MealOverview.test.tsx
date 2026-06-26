import { render, screen } from '@testing-library/react';
import { MealOverview } from './MealOverview';

jest.mock('../../helpers/availableMeals', () => ({
    availableMeals: [
        { id: '1', title: 'Pizza', imageUrl: 'pizza.png' }
    ]
}));

describe('MealOverview Component', () => {
    it('renders selected meals correctly', () => {
        const selectedMeals = {
            Monday: '1', // ID corresponds to Pizza
        };

        render(<MealOverview selectedMeals={selectedMeals} />);

        expect(screen.getByText('My Meals For The Week')).toBeInTheDocument();
        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    it('handles empty selections', () => {
        render(<MealOverview selectedMeals={{}} />);
        expect(screen.getByText('My Meals For The Week')).toBeInTheDocument();
        // Should not crash, just empty list
        expect(screen.queryByText('Monday')).not.toBeInTheDocument();
    });
});
