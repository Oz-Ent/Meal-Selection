import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TitleBar } from './TitleBar';

const mockLogout = jest.fn();

jest.mock('../../pages/Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: { user: { name: 'Eric' } },
    logout: mockLogout,
  }),
}));

describe('TitleBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the greeting and logout button', () => {
    render(
      <MemoryRouter>
        <TitleBar />
      </MemoryRouter>,
    );
    //Changed the greeting text check to match the updated TitleBar component which now displays "Edziban" instead of "Hi, Eric"
    expect(screen.getByText(/Edziban/i)).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button', { name: /sign out/i });
    expect(logoutBtn).toBeInTheDocument();
    expect(logoutBtn.querySelector('svg')).toBeInTheDocument();
    fireEvent.click(logoutBtn);
    expect(screen.getByText(/Sign Out of Account\?/i)).toBeInTheDocument();
  });
});

