import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { useAuth } from '../../useAuth/useAuth';

jest.mock('../../useAuth/useAuth');

describe('AdminProtectedRoute Component', () => {
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
              <AdminProtectedRoute>
                <div>Admin Content</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to /activities if user is not admin or hr', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: {
        user: { roleName: 'user' },
      },
      token: 'valid-token',
    });

    render(
      <MemoryRouter initialEntries={['/admin/menu']}>
        <Routes>
          <Route
            path="/admin/menu"
            element={
              <AdminProtectedRoute>
                <div>Admin Content</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/activities" element={<div>User Activities</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('User Activities')).toBeInTheDocument();
  });

  it('renders children if user is admin', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: {
        user: { roleName: 'admin' },
      },
      token: 'valid-token',
    });

    render(
      <MemoryRouter initialEntries={['/admin/menu']}>
        <Routes>
          <Route
            path="/admin/menu"
            element={
              <AdminProtectedRoute>
                <div>Admin Content</div>
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
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
              <AdminProtectedRoute>
                <div>Admin Content</div>
              </AdminProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Verifying session...')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});

