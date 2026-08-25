import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ActivitiesRedirect } from './ActivitiesRedirect';
import { useAuth } from '../../useAuth/useAuth';

jest.mock('../../useAuth/useAuth');

describe('ActivitiesRedirect Component', () => {
  it('redirects admin users to /admin/activities', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: {
        user: { roleName: 'admin' },
      },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ActivitiesRedirect />} />
          <Route path="/admin/activities" element={<div>Admin Dashboard</div>} />
          <Route path="/activities" element={<div>User Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects regular users to /activities', () => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: {
        user: { roleName: 'user' },
      },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ActivitiesRedirect />} />
          <Route path="/admin/activities" element={<div>Admin Dashboard</div>} />
          <Route path="/activities" element={<div>User Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });
});
