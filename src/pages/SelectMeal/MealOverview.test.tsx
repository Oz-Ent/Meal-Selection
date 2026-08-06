import { render, screen } from '@testing-library/react';
import { MealOverview } from './MealOverview';

describe('MealOverview Component', () => {
  it('renders selected meals correctly', () => {
    const selectedMeals = {
      Monday: { title: 'Pizza', imageUrl: 'pizza.png' },
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
