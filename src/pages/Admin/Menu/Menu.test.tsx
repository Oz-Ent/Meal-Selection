import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Menu } from './Menu';

describe('Menu Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('renders empty page when no menus exist', () => {
        render(
            <MemoryRouter>
                <Menu />
            </MemoryRouter>
        );
        expect(screen.getByText(/There are no menus/i)).toBeInTheDocument();
    });

    it('renders menus from localStorage', () => {
        localStorage.setItem("menus", JSON.stringify({
            "Weekly Menu": []
        }));
        
        render(
            <MemoryRouter>
                <Menu />
            </MemoryRouter>
        );
        
        expect(screen.getByText('Weekly Menu')).toBeInTheDocument();
    });

    it('opens dropdown and can select a menu', () => {
        localStorage.setItem("menus", JSON.stringify({
            "Weekly Menu": []
        }));
        
        render(
            <MemoryRouter>
                <Menu />
            </MemoryRouter>
        );
        
        const moreOptionsBtn = screen.getByRole('button', { name: /More options/i });
        fireEvent.click(moreOptionsBtn);
        
        const selectMenuBtn = screen.getByRole('button', { name: 'Select menu for the week' });
        expect(selectMenuBtn).toBeInTheDocument();
        
        fireEvent.click(selectMenuBtn);
        expect(screen.getByText('Weekly Menu selected successfully')).toBeInTheDocument();
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
