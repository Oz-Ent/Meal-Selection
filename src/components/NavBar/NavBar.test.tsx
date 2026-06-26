import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavBar } from './NavBar';

describe('NavBar Component', () => {
    it('renders title correctly', () => {
        render(
            <MemoryRouter>
                <NavBar title="Dashboard" />
            </MemoryRouter>
        );
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders back link correctly', () => {
        render(
            <MemoryRouter>
                <NavBar title="Dashboard" backUrl="/home" />
            </MemoryRouter>
        );
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/home');
    });

    it('renders Add button and handles click', () => {
        const onAddButtonClick = jest.fn();
        render(
            <MemoryRouter>
                <NavBar title="Dashboard" onAddButtonClick={onAddButtonClick} />
            </MemoryRouter>
        );
        const addButton = screen.getByRole('button', { name: /add/i });
        expect(addButton).toBeInTheDocument();
        fireEvent.click(addButton);
        expect(onAddButtonClick).toHaveBeenCalledTimes(1);
    });

    it('renders Export button and handles click', () => {
        const onExportClick = jest.fn();
        render(
            <MemoryRouter>
                <NavBar title="Dashboard" onExportClick={onExportClick} />
            </MemoryRouter>
        );
        const exportButton = screen.getByRole('button', { name: /export/i });
        expect(exportButton).toBeInTheDocument();
        fireEvent.click(exportButton);
        expect(onExportClick).toHaveBeenCalledTimes(1);
    });
});
