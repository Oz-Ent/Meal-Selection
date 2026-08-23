import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BottomNavbar } from './BottomNavbar';

const mockUseAuth = jest.fn();

jest.mock('../../pages/Auth/useAuth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('BottomNavbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 3 tabs for regular users', () => {
    mockUseAuth.mockReturnValue({
      profile: { user: { roleName: 'USER' } },
    });

    render(
      <MemoryRouter>
        <BottomNavbar activeTab="home" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders 4 tabs for ADMIN users', () => {
    mockUseAuth.mockReturnValue({
      profile: { user: { roleName: 'ADMIN' } },
    });

    render(
      <MemoryRouter>
        <BottomNavbar activeTab="admin" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('highlights active tab correctly', () => {
    mockUseAuth.mockReturnValue({
      profile: { user: { roleName: 'ADMIN' } },
    });

    render(
      <MemoryRouter>
        <BottomNavbar activeTab="admin" />
      </MemoryRouter>,
    );

    const adminButton = screen.getByText('Admin').closest('button');
    expect(adminButton).toHaveAttribute('aria-current', 'page');
    expect(adminButton).toHaveClass('font-bold', 'text-primary');
  });

  it('navigates when an inactive tab is clicked', () => {
    mockUseAuth.mockReturnValue({
      profile: { user: { roleName: 'ADMIN' } },
    });

    render(
      <MemoryRouter initialEntries={['/admin/activities']}>
        <Routes>
          <Route path="/admin/activities" element={<BottomNavbar activeTab="admin" />} />
          <Route path="/history" element={<div data-testid="history-page">History Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('History'));
    expect(screen.getByTestId('history-page')).toBeInTheDocument();
  });
});
