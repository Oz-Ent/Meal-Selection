import { render, screen, fireEvent } from '@testing-library/react';
import UserPreferencesCard from './UserPreferencesCard';
import { useTheme } from '../../../hooks/useTheme';

jest.mock('../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('UserPreferencesCard Component', () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('renders theme selector and changes theme to system when selected', () => {
    render(<UserPreferencesCard />);

    expect(screen.getByText('Theme Appearance')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();

    const dropdownTrigger = screen.getByRole('button', { name: /Theme Appearance/i });
    fireEvent.click(dropdownTrigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();

    fireEvent.click(screen.getByText('System'));
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
