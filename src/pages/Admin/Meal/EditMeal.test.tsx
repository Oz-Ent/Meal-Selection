import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { EditMeal } from './EditMeal';
import { availableMeals } from '../../../helpers/availableMeals';

jest.mock('../../../helpers/availableMeals', () => ({
    availableMeals: []
}));

describe('EditMeal Component', () => {
    beforeEach(() => {
        availableMeals.length = 0;
        availableMeals.push(
            { id: '1', title: 'Meal 1', imageUrl: 'img1.png' },
            { id: '2', title: 'Meal 2', imageUrl: 'img2.png' }
        );
        jest.clearAllMocks();
    });

    const renderWithRouter = (initialRoute = '/admin/meal/edit') => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                    <Route path="/admin/meal/edit/:cardId" element={<EditMeal />} />
                    <Route path="/admin/meal/edit" element={<EditMeal />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders with pre-selected cardId from URL', () => {
        renderWithRouter('/admin/meal/edit/1');
        
        // The nav bar should show "1" because one item is selected
        expect(screen.getByText('1')).toBeInTheDocument();
        
        // Meal 1 should be rendered
        expect(screen.getByText('Meal 1')).toBeInTheDocument();
        expect(screen.getByText('Meal 2')).toBeInTheDocument();
    });

    it('selects and deselects all meals when "Select All" is clicked', () => {
        renderWithRouter();
        
        // Note: 'Select All' is a span next to the checkbox, so we can click the wrapper section
        const selectAllSection = screen.getByText('Select All');
        
        fireEvent.click(selectAllSection);
        expect(screen.getByText('2')).toBeInTheDocument(); // 2 items selected
        
        fireEvent.click(selectAllSection);
        expect(screen.queryByText('2')).not.toBeInTheDocument(); // 0 items selected
    });

    it('opens Edit Modal when edit button is clicked for one selected item', () => {
        renderWithRouter('/admin/meal/edit/1');
        
        const editBtns = screen.getAllByRole('button');
        const editBtn = editBtns[0]; // Assuming edit is first in header
        
        fireEvent.click(editBtn);
        
        expect(screen.getByRole('heading', { name: 'Edit Meal' })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Meal 1')).toBeInTheDocument();
    });

    it('opens Delete Modal and removes item', () => {
        renderWithRouter('/admin/meal/edit/1');
        
        const actionBtns = screen.getAllByRole('button');
        const deleteBtn = actionBtns[1]; // Delete is second
        
        fireEvent.click(deleteBtn);
        expect(screen.getByText(/Please confirm if you want to delete meal/i)).toBeInTheDocument();
        
        const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
        fireEvent.click(confirmBtn);
        
        // Meal 1 should be removed
        expect(availableMeals.length).toBe(1);
        expect(availableMeals[0].id).toBe('2');
        expect(screen.getByText('Meal(s) deleted successfully')).toBeInTheDocument();
    });
});
