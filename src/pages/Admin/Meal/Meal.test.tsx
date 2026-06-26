import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Meal } from './Meal';
import { availableMeals } from '../../../helpers/availableMeals';

jest.mock('../../../helpers/availableMeals', () => ({
    availableMeals: []
}));

describe('Meal Component', () => {
    beforeEach(() => {
        // Reset availableMeals to empty before each test
        availableMeals.length = 0;
        jest.clearAllMocks();
    });

    it('renders empty page when no meals exist', () => {
        render(
            <MemoryRouter>
                <Meal />
            </MemoryRouter>
        );
        expect(screen.getByText(/There are no meals, click on “add” to create a new meal/i)).toBeInTheDocument();
    });

    it('renders meals when availableMeals is populated', () => {
        availableMeals.push({ id: '1', title: 'Pizza', imageUrl: 'pizza.png' });
        
        render(
            <MemoryRouter>
                <Meal />
            </MemoryRouter>
        );
        
        expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    it('opens add meal modal when Add button is clicked in NavBar', () => {
        render(
            <MemoryRouter>
                <Meal />
            </MemoryRouter>
        );
        
        const addBtn = screen.getByRole('button', { name: /add/i });
        fireEvent.click(addBtn);
        
        expect(screen.getByText('New Meal')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter name of the meal')).toBeInTheDocument();
    });

    it('adds a new meal and shows success status', () => {
        render(
            <MemoryRouter>
                <Meal />
            </MemoryRouter>
        );
        
        const addBtn = screen.getByRole('button', { name: /add/i });
        fireEvent.click(addBtn);
        
        const input = screen.getByPlaceholderText('Enter name of the meal');
        fireEvent.change(input, { target: { value: 'Burger' } });
        
        const submitBtn = screen.getByRole('button', { name: 'Add New Meal' });
        fireEvent.click(submitBtn);
        
        expect(availableMeals.length).toBe(1);
        expect(availableMeals[0].title).toBe('Burger');
        
        // Success modal should be visible
        expect(screen.getByText('New meal created successfully')).toBeInTheDocument();
    });
});
