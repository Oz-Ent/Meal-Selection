import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { EditMeal } from './EditMeal';

const meals = [
    { id: 1, name: 'Meal 1', imagePath: 'img1.png', foodCode: 'SG-BS-PR-PP', calories: 100, description: null, isActive: true, createdAt: '', updatedAt: '' },
    { id: 2, name: 'Meal 2', imagePath: 'img2.png', foodCode: 'SG-BS-PR-PP', calories: 200, description: null, isActive: true, createdAt: '', updatedAt: '' },
];
const mockDeleteMeals = jest.fn();

jest.mock('../../../api/useApiQueries', () => ({
    useMealsQuery: () => ({ data: { meals }, isLoading: false }),
    useFoodLibraryQuery: () => ({ data: [], isLoading: false }),
    useUpdateMealMutation: () => ({ mutateAsync: jest.fn() }),
    useDeleteMealsMutation: () => ({ mutateAsync: mockDeleteMeals }),
}));

describe('EditMeal Component', () => {
    beforeEach(() => {
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
        
        // The nav bar should show "1 Selected" because one item is selected
        expect(screen.getByText(/1 Selected/i)).toBeInTheDocument();
        
        // Meal 1 should be rendered
        expect(screen.getByText('Meal 1')).toBeInTheDocument();
        expect(screen.getByText('Meal 2')).toBeInTheDocument();
    });

    it('selects and deselects all meals when "Select All" is clicked', () => {
        renderWithRouter();
        
        // Note: 'Select All' is a span next to the checkbox, so we can click the wrapper section
        const selectAllSection = screen.getByText('Select All');
        
        fireEvent.click(selectAllSection);
        expect(screen.getByText(/2 Selected/i)).toBeInTheDocument(); // 2 items selected
        
        fireEvent.click(selectAllSection);
        expect(screen.queryByText(/2 Selected/i)).not.toBeInTheDocument(); // 0 items selected
    });

    it('renders back button and navigates', () => {
        renderWithRouter('/admin/meal/edit/1');
        const backBtn = screen.getByRole('button', { name: 'Back' });
        expect(backBtn).toBeInTheDocument();
        fireEvent.click(backBtn);
    });

    it('opens Edit Modal when edit button is clicked for one selected item', () => {
        renderWithRouter('/admin/meal/edit/1');
        
        const editBtn = screen.getByRole('button', { name: 'Edit Meal' });
        fireEvent.click(editBtn);
        
        expect(screen.getByRole('heading', { name: 'Edit Meal' })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Meal 1')).toBeInTheDocument();
    });

    it('opens Delete Modal and removes item', () => {
        renderWithRouter('/admin/meal/edit/1');
        
        const deleteBtn = screen.getByRole('button', { name: 'Delete Meal' });
        fireEvent.click(deleteBtn);
        expect(screen.getByText(/Please confirm if you want to delete meal/i)).toBeInTheDocument();
        
        const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
        fireEvent.click(confirmBtn);
        
        expect(mockDeleteMeals).toHaveBeenCalledWith([1]);
    });
});
