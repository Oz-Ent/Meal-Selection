import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../pages/Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: { user: { roleName: 'Admin' } },
    token: 'fake-token',
    logout: jest.fn(),
  }),
}));

jest.mock('../pages/User/Activities', () => ({
  UserActivities: () => <div>User activities</div>,
}));

import { routes } from '../router';

describe('Router', () => {
  it("renders Welcome on '/welcome'", async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/welcome'],
    });

    render(<RouterProvider router={router} />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Edziban/i)).toBeVisible();
    });
  });

  it('renders NotFoundPage on unknown route', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/some/random/path'],
    });

    render(<RouterProvider router={router} />);
    expect(screen.getByText(/404 — Page Not Found/i)).toBeVisible();
  });
});
