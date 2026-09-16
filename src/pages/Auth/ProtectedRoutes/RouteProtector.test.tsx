import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RouteProtector } from './RouteProtector';
import { useAuth } from '../useAuth/useAuth';
import { Role } from '../../../utils/Enums/Roles';

jest.mock('../useAuth/useAuth');

describe('RouteProtector Component', () => {
  it('redirects to /login if unauthenticated (no token)', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: null,
      token: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin/menu']}>
        <Routes>
          <Route
            path="/admin/menu"
            element={
              <RouteProtector allowedRoles={[Role.admin, Role.hr, Role.worker]}>
                <div>Menu Page</div>
              </RouteProtector>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children if user has an allowed role (e.g. worker accessing menu)', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: {
        user: { roleId: Role.worker },
      },
      token: 'valid-token',
    });

    render(
      <MemoryRouter initialEntries={['/admin/menu']}>
        <Routes>
          <Route
            path="/admin/menu"
            element={
              <RouteProtector allowedRoles={[Role.admin, Role.hr, Role.worker]}>
                <div>Menu Page</div>
              </RouteProtector>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Menu Page')).toBeInTheDocument();
  });

  it('redirects to /activities if user role is not in allowedRoles (e.g. worker accessing budgets)', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: {
        user: { roleId: Role.worker },
      },
      token: 'valid-token',
    });

    render(
      <MemoryRouter initialEntries={['/admin/budgets']}>
        <Routes>
          <Route
            path="/admin/budgets"
            element={
              <RouteProtector allowedRoles={[Role.admin, Role.manager]}>
                <div>Budgets Page</div>
              </RouteProtector>
            }
          />
          <Route path="/activities" element={<div>User Activities</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('User Activities')).toBeInTheDocument();
    expect(screen.queryByText('Budgets Page')).not.toBeInTheDocument();
  });

  it('allows Admin unrestricted access regardless of allowedRoles', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: {
        user: { roleId: Role.admin },
      },
      token: 'valid-token',
    });

    render(
      <MemoryRouter initialEntries={['/admin/budgets']}>
        <Routes>
          <Route
            path="/admin/budgets"
            element={
              <RouteProtector allowedRoles={[Role.manager]}>
                <div>Budgets Page</div>
              </RouteProtector>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Budgets Page')).toBeInTheDocument();
  });

  it('shows loading spinner while session is initializing', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: null,
      token: null,
      isInitializing: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin/menu']}>
        <Routes>
          <Route
            path="/admin/menu"
            element={
              <RouteProtector allowedRoles={[Role.admin]}>
                <div>Admin Content</div>
              </RouteProtector>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Verifying session...')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
