import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Activities } from './Activities';

jest.mock('../../components/TitleBar/TitleBar', () => ({
    TitleBar: () => <div>Hi Test User,</div>,
}));

describe('Activities Component', () => {
    it('renders the header and all activity cards', () => {
        render(
            <MemoryRouter>
                <Activities />
            </MemoryRouter>
        );

        expect(screen.getByText(/Manage and/i)).toBeInTheDocument();
        expect(screen.getByText('All Menus')).toBeInTheDocument();
        expect(screen.getByText('All Meals')).toBeInTheDocument();
        expect(screen.getByText('Choose Meals')).toBeInTheDocument();
        expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('navigates when activity cards are clicked', () => {
        render(
            <MemoryRouter initialEntries={['/admin/activities']}>
                <Routes>
                    <Route path="/admin/activities" element={<Activities />} />
                    <Route path="/admin/menu" element={<div data-testid="menu-route">Menu Route</div>} />
                    <Route path="/admin/meal" element={<div data-testid="meal-route">Meal Route</div>} />
                    <Route path="/admin/report" element={<div data-testid="report-route">Report Route</div>} />
                </Routes>
            </MemoryRouter>
        );

        // Click All Menus
        fireEvent.click(screen.getByText('All Menus'));
        expect(screen.getByTestId('menu-route')).toBeInTheDocument();

        // Need to render again to test other routes from base since we navigated away
    });

    it('navigates to report route', () => {
        render(
            <MemoryRouter initialEntries={['/admin/activities']}>
                <Routes>
                    <Route path="/admin/activities" element={<Activities />} />
                    <Route path="/admin/report" element={<div data-testid="report-route">Report Route</div>} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Reports'));
        expect(screen.getByTestId('report-route')).toBeInTheDocument();
    });
});
