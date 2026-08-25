import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { authService } from '../../../api/Services/AuthServices';

const mockNavigate = jest.fn();
const mockLogout = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
    refreshToken: 'mock-refresh-token',
  }),
}));

jest.mock('../../../api/Services/AuthServices', () => ({
  authService: {
    logout: jest.fn().mockResolvedValue({}),
  },
}));

describe('LogoutConfirmModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign out confirmation modal', () => {
    render(
      <MemoryRouter>
        <LogoutConfirmModal isOpen={true} onClose={jest.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Sign Out of Account?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
  });

  it('calls auth logout and navigates to /login on confirm', async () => {
    const handleClose = jest.fn();

    render(
      <MemoryRouter>
        <LogoutConfirmModal isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    const signoutBtn = screen.getByRole('button', { name: 'Sign Out' });
    fireEvent.click(signoutBtn);

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalledWith({ refreshToken: 'mock-refresh-token' });
      expect(mockLogout).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
