import { fireEvent, render, screen } from '@testing-library/react';
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
    render(<TitleBar />);
    expect(screen.getByText(/Hi Eric,/i)).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button');
    expect(logoutBtn).toBeInTheDocument();
    expect(logoutBtn.querySelector('svg')).toBeInTheDocument();
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
