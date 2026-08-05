import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Menu } from './Menu';

const mockCreateSchedule = jest.fn();
const mockUpdateSchedule = jest.fn();

jest.mock('../../../api/useApiQueries', () => ({
    useMenusQuery: jest.fn(),
    useWeekSchedulesQuery: jest.fn(),
    useCreateWeekScheduleMutation: () => ({ mutateAsync: mockCreateSchedule, isPending: false }),
    useUpdateWeekScheduleMutation: () => ({ mutateAsync: mockUpdateSchedule, isPending: false }),
    useDeleteMenuMutation: () => ({ mutateAsync: jest.fn() }),
}));

import { useMenusQuery, useWeekSchedulesQuery } from '../../../api/useApiQueries';

const mockUseMenusQuery = useMenusQuery as jest.MockedFunction<typeof useMenusQuery>;
const mockUseWeekSchedulesQuery = useWeekSchedulesQuery as jest.MockedFunction<typeof useWeekSchedulesQuery>;
const menu = { id: 1, title: 'Weekly Menu', description: 'Lunch plan', isActive: true, createdAt: '', updatedAt: '' };

describe('Menu Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseMenusQuery.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useMenusQuery>);
        mockUseWeekSchedulesQuery.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useWeekSchedulesQuery>);
    });

    it('renders empty page when no menus exist', () => {
        render(
            <MemoryRouter>
                <Menu />
            </MemoryRouter>
        );
        expect(screen.getByText(/There are no menus/i)).toBeInTheDocument();
    });

    it('renders menus returned by the API', () => {
        mockUseMenusQuery.mockReturnValue({ data: [menu], isLoading: false } as unknown as ReturnType<typeof useMenusQuery>);
        
        render(
            <MemoryRouter>
                <Menu />
            </MemoryRouter>
        );
        
        expect(screen.getByText('Weekly Menu')).toBeInTheDocument();
    });

    it('opens dropdown and can select a menu', () => {
        mockUseMenusQuery.mockReturnValue({ data: [menu], isLoading: false } as unknown as ReturnType<typeof useMenusQuery>);
        
        render(
            <MemoryRouter>
                <Menu />
            </MemoryRouter>
        );
        
        const moreOptionsBtn = screen.getByRole('button', { name: /More options/i });
        fireEvent.click(moreOptionsBtn);
        
        const selectMenuBtn = screen.getByRole('button', { name: 'Select menu for this week' });
        expect(selectMenuBtn).toBeInTheDocument();
        
        fireEvent.click(selectMenuBtn);
        expect(mockCreateSchedule).toHaveBeenCalledTimes(1);
    });

    it('opens add menu modal and redirects when name is entered', () => {
        render(
            <MemoryRouter initialEntries={['/admin/menu']}>
                <Routes>
                    <Route path="/admin/menu" element={<Menu />} />
                    <Route path="/admin/menu/add-menu/:menuName" element={<div data-testid="add-menu-route">Add Menu Route</div>} />
                </Routes>
            </MemoryRouter>
        );
        
        const addBtn = screen.getByRole('button', { name: /add/i });
        fireEvent.click(addBtn);
        
        const input = screen.getByPlaceholderText('Enter name of the menu');
        fireEvent.change(input, { target: { value: 'NewMenu' } });
        
        const createBtn = screen.getByRole('button', { name: 'Create Menu' });
        fireEvent.click(createBtn);
        
        expect(screen.getByTestId('add-menu-route')).toBeInTheDocument();
    });
});
