import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AddMenu } from './AddMenu';
import { availableMeals } from '../../../helpers/availableMeals';

jest.mock('../../../helpers/availableMeals', () => ({
    availableMeals: []
}));

describe('AddMenu Component', () => {
    beforeEach(() => {
        localStorage.clear();
        availableMeals.length = 0;
        availableMeals.push({ id: '1', title: 'Pizza', imageUrl: 'pizza.png' });
        jest.clearAllMocks();
    });

    const renderWithRouter = () => {
        return render(
            <MemoryRouter initialEntries={['/admin/menu/add-menu/TestMenu']}>
                <Routes>
                    <Route path="/admin/menu/add-menu/:menuName" element={<AddMenu />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders the days and save button', () => {
        renderWithRouter();
        expect(screen.getByText('TestMenu')).toBeInTheDocument();
        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Friday')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('prevents saving if meals are missing', () => {
        renderWithRouter();
        const saveBtn = screen.getByRole('button', { name: 'Save' });
        fireEvent.click(saveBtn);
        
        expect(screen.getByText(/Please add meals for: Monday, Tuesday, Wednesday, Thursday, Friday/i)).toBeInTheDocument();
    });

    it('allows adding a meal to a day', () => {
        renderWithRouter();
        const addBtns = screen.getAllByRole('button', { name: /Add Meal\(s\)/i });
        fireEvent.click(addBtns[0]); // Monday
        
        // Modal opens with all meals
        expect(screen.getByText('All Menu')).toBeInTheDocument();
        
        // Click the pizza list card (or its checkbox)
        const checkbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(checkbox);
        
        const addMealBtn = screen.getByRole('button', { name: 'Add' });
        fireEvent.click(addMealBtn);
        
        // Modal closes and pizza is listed under Monday
        expect(screen.queryByText('All Menu')).not.toBeInTheDocument();
        expect(screen.getAllByText('Pizza').length).toBeGreaterThan(0);
    });
});
