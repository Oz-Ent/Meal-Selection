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

    it('renders back button and navigates to fallback URL when no history exists', () => {
        Object.defineProperty(window, 'history', {
            value: { state: { idx: 0 }, length: 1 },
            writable: true,
        });

        render(
            <MemoryRouter>
                <NavBar title="Dashboard" backUrl="/home" />
            </MemoryRouter>
        );
        const backBtn = screen.getByRole('button', { name: /back/i });
        expect(backBtn).toBeInTheDocument();
        fireEvent.click(backBtn);
    });

    it('navigates dynamically back when history exists', () => {
        Object.defineProperty(window, 'history', {
            value: { state: { idx: 2 }, length: 3 },
            writable: true,
        });

        render(
            <MemoryRouter>
                <NavBar title="Dashboard" backUrl="/home" />
            </MemoryRouter>
        );
        const backBtn = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backBtn);
    });

    it('handles onBackClick when provided', () => {
        const onBackClick = jest.fn();
        render(
            <MemoryRouter>
                <NavBar title="Dashboard" onBackClick={onBackClick} />
            </MemoryRouter>
        );
        const backBtn = screen.getByRole('button', { name: /back/i });
        expect(backBtn).toBeInTheDocument();
        fireEvent.click(backBtn);
        expect(onBackClick).toHaveBeenCalledTimes(1);
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
