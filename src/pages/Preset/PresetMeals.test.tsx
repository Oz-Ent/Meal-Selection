import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PresetMeals } from './PresetMeals';
import type { Preset } from '../../api/Services/PresetServices';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: {
      user: { id: 132, email: 'test@example.com', name: 'Test User', roleId: 1, roleName: 'user' },
    },
  }),
}));

const mockMenus = [
  { id: 1, title: 'Menu 1', isActive: true },
  { id: 2, title: 'Menu 2', isActive: true },
];

const mockPresets: Preset[] = [];

jest.mock('../../api/useApiQueries', () => ({
  useMenusQuery: () => ({ data: mockMenus, isLoading: false }),
  usePresetsByUserQuery: () => ({ data: mockPresets, isLoading: false }),
  useCreatePresetMutation: () => ({ mutateAsync: jest.fn() }),
  useUpdatePresetMutation: () => ({ mutateAsync: jest.fn() }),
  useDeletePresetMutation: () => ({ mutateAsync: jest.fn() }),
  useSetDefaultPresetMutation: () => ({ mutateAsync: jest.fn() }),
}));

describe('PresetMeals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no presets are available', () => {
    render(
      <MemoryRouter>
        <PresetMeals />
      </MemoryRouter>,
    );

    expect(screen.getByText('Preset Meals')).toBeInTheDocument();
    expect(
      screen.getByText(
        /There are no preset meals available, click on “add” to create a new preset menu/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add new preset menu' })).toBeInTheDocument();
  });

  it('opens select menu modal on clicking Add and navigates when menu is selected', () => {
    render(
      <MemoryRouter>
        <PresetMeals />
      </MemoryRouter>,
    );

    const addBtn = screen.getByRole('button', { name: 'Add new preset menu' });
    fireEvent.click(addBtn);

    expect(screen.getByText('Select menu')).toBeInTheDocument();
    expect(screen.getByText('Menu 1')).toBeInTheDocument();
    expect(screen.getByText('Menu 2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Menu 1'));
    expect(mockNavigate).toHaveBeenCalledWith('/preset-meals/create/1', {
      state: { menuTitle: 'Menu 1', menu: mockMenus[0] },
    });
  });
});
