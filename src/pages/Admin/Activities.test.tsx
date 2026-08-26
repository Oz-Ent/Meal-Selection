import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Activities } from './Activities';

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: {
      user: { name: 'Admin Test' },
    },
  }),
}));

describe('Admin Activities Component', () => {
  it('renders the header, welcome banner, and all activity cards', () => {
    render(
      <MemoryRouter>
        <Activities />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Welcome, Admin/i)).toBeInTheDocument();
    expect(screen.getByText('Menus')).toBeInTheDocument();
    expect(screen.getByText('Meals')).toBeInTheDocument();
    expect(screen.getByText('Food Assignment')).toBeInTheDocument();
    expect(screen.getByText('Mark Holidays')).toBeInTheDocument();
    expect(screen.getByText('Selection Status')).toBeInTheDocument();
  });

  it('navigates when activity cards are clicked', () => {
    render(
      <MemoryRouter initialEntries={['/admin/activities']}>
        <Routes>
          <Route path="/admin/activities" element={<Activities />} />
          <Route path="/admin/menu" element={<div data-testid="menu-route">Menu Route</div>} />
          <Route path="/admin/meal" element={<div data-testid="meal-route">Meal Route</div>} />
          <Route
            path="/admin/selection-activity"
            element={<div data-testid="food-assignment-route">Food Assignment Route</div>}
          />
          <Route
            path="/admin/selection-status"
            element={<div data-testid="selection-status-route">Selection Status Route</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Click Menus
    fireEvent.click(screen.getByText('Menus'));
    expect(screen.getByTestId('menu-route')).toBeInTheDocument();
  });

  it('navigates to selection status route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/activities']}>
        <Routes>
          <Route path="/admin/activities" element={<Activities />} />
          <Route
            path="/admin/selection-status"
            element={<div data-testid="selection-status-route">Selection Status Route</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Selection Status'));
    expect(screen.getByTestId('selection-status-route')).toBeInTheDocument();
  });

  it('navigates to food assignment route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/activities']}>
        <Routes>
          <Route path="/admin/activities" element={<Activities />} />
          <Route
            path="/admin/selection-activity"
            element={<div data-testid="food-assignment-route">Food Assignment Route</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Food Assignment'));
    expect(screen.getByTestId('food-assignment-route')).toBeInTheDocument();
  });

  it('opens logout confirmation modal when logout button is clicked', () => {
    render(
      <MemoryRouter>
        <Activities />
      </MemoryRouter>
    );

    const logoutButton = screen.getByRole('button', { name: /sign out|log out/i });
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);

    expect(screen.getByText(/Sign Out of Account\?/i)).toBeInTheDocument();
  });
});

