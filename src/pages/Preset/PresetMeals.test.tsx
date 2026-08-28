import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PresetMeals } from './PresetMeals';
import type { Preset } from '../../api/Services/PresetServices';
import { presetService } from '../../api/Services/PresetServices';
import { menuService } from '../../api/Services/MenuServices';

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

jest.mock('../../api/Services/PresetServices', () => ({
  presetService: {
    getWithDetails: jest.fn(),
  },
}));

jest.mock('../../api/Services/MenuServices', () => ({
  menuService: {
    getDays: jest.fn(),
  },
}));

const mockMenus = [
  { id: 1, title: 'Menu 1', isActive: true },
  { id: 2, title: 'Menu 2', isActive: true },
];

let mockPresets: Preset[] = [];
const mockSetDefaultMutate = jest.fn();

jest.mock('../../api/useApiQueries', () => ({
  useMenusQuery: () => ({ data: mockMenus, isLoading: false }),
  usePresetsByUserQuery: () => ({ data: mockPresets, isLoading: false }),
  useCreatePresetMutation: () => ({ mutateAsync: jest.fn() }),
  useUpdatePresetMutation: () => ({ mutateAsync: jest.fn() }),
  useDeletePresetMutation: () => ({ mutateAsync: jest.fn() }),
  useSetDefaultPresetMutation: () => ({ mutateAsync: mockSetDefaultMutate }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('PresetMeals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPresets = [];
  });

  it('renders empty state when no presets are available', () => {
    renderWithProviders(
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
    renderWithProviders(
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

  it('sets preset as default directly when all menu days are chosen', async () => {
    mockPresets = [
      {
        id: 10,
        name: 'Complete Preset',
        description: null,
        isDefault: false,
        userId: 132,
        menuId: 1,
        createdAt: '',
        updatedAt: '',
      },
    ];

    (menuService.getDays as jest.Mock).mockResolvedValue([
      { id: 1, day: 'MONDAY' },
      { id: 2, day: 'TUESDAY' },
    ]);

    (presetService.getWithDetails as jest.Mock).mockResolvedValue({
      id: 10,
      presetItems: [
        { menuDayId: 1, dayMealId: 101 },
        { menuDayId: 2, dayMealId: 102 },
      ],
    });

    renderWithProviders(
      <MemoryRouter>
        <PresetMeals />
      </MemoryRouter>,
    );

    expect(screen.getByText('Complete Preset')).toBeInTheDocument();

    const optionsBtn = screen.getByRole('button', { name: 'Preset options' });
    fireEvent.click(optionsBtn);

    const setDefaultBtn = screen.getByText('Set as default');
    fireEvent.click(setDefaultBtn);

    await waitFor(() => {
      expect(mockSetDefaultMutate).toHaveBeenCalledWith(10);
    });

    expect(screen.queryByText('Set Incomplete Preset as Default?')).not.toBeInTheDocument();
  });

  it('shows warning modal when setting incomplete preset as default and sets default on confirm', async () => {
    mockPresets = [
      {
        id: 11,
        name: 'Partial Preset',
        description: null,
        isDefault: false,
        userId: 132,
        menuId: 1,
        createdAt: '',
        updatedAt: '',
      },
    ];

    (menuService.getDays as jest.Mock).mockResolvedValue([
      { id: 1, day: 'MONDAY' },
      { id: 2, day: 'TUESDAY' },
      { id: 3, day: 'WEDNESDAY' },
    ]);

    (presetService.getWithDetails as jest.Mock).mockResolvedValue({
      id: 11,
      presetItems: [{ menuDayId: 1, dayMealId: 101 }],
    });

    renderWithProviders(
      <MemoryRouter>
        <PresetMeals />
      </MemoryRouter>,
    );

    const optionsBtn = screen.getByRole('button', { name: 'Preset options' });
    fireEvent.click(optionsBtn);

    const setDefaultBtn = screen.getByText('Set as default');
    fireEvent.click(setDefaultBtn);

    await waitFor(() => {
      expect(screen.getByText('Set Incomplete Preset as Default?')).toBeInTheDocument();
    });

    expect(screen.getByText(/TUESDAY and WEDNESDAY/i)).toBeInTheDocument();
    expect(screen.getByText(/any unselected days will automatically be prefilled as/i)).toBeInTheDocument();

    // Confirm button in the modal
    const confirmBtn = screen.getByRole('button', { name: 'Set as Default' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockSetDefaultMutate).toHaveBeenCalledWith(11);
    });
  });

  it('closes warning modal without setting default when cancel is clicked', async () => {
    mockPresets = [
      {
        id: 12,
        name: 'Partial Preset 2',
        description: null,
        isDefault: false,
        userId: 132,
        menuId: 1,
        createdAt: '',
        updatedAt: '',
      },
    ];

    (menuService.getDays as jest.Mock).mockResolvedValue([
      { id: 1, day: 'MONDAY' },
      { id: 2, day: 'TUESDAY' },
    ]);

    (presetService.getWithDetails as jest.Mock).mockResolvedValue({
      id: 12,
      presetItems: [{ menuDayId: 1, dayMealId: 101 }],
    });

    renderWithProviders(
      <MemoryRouter>
        <PresetMeals />
      </MemoryRouter>,
    );

    const optionsBtn = screen.getByRole('button', { name: 'Preset options' });
    fireEvent.click(optionsBtn);

    const setDefaultBtn = screen.getByText('Set as default');
    fireEvent.click(setDefaultBtn);

    await waitFor(() => {
      expect(screen.getByText('Set Incomplete Preset as Default?')).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText('Set Incomplete Preset as Default?')).not.toBeInTheDocument();
    expect(mockSetDefaultMutate).not.toHaveBeenCalled();
  });

  it('correctly detects only missing days when preset details uses items map format', async () => {
    mockPresets = [
      {
        id: 10,
        name: 'just preset',
        description: null,
        isDefault: false,
        userId: 153,
        menuId: 6,
        createdAt: '',
        updatedAt: '',
      },
    ];

    (menuService.getDays as jest.Mock).mockResolvedValue([
      { id: 1, day: 'MONDAY' },
      { id: 2, day: 'TUESDAY' },
      { id: 3, day: 'WEDNESDAY' },
      { id: 4, day: 'THURSDAY' },
      { id: 5, day: 'FRIDAY' },
    ]);

    (presetService.getWithDetails as jest.Mock).mockResolvedValue({
      id: 10,
      name: 'just preset',
      items: {
        MONDAY: { dayMealId: 95, meal: 'Jollof with Turkey', isActive: true },
        TUESDAY: { dayMealId: 97, meal: 'Fried Rice with Chicken', isActive: true },
        WEDNESDAY: { dayMealId: 102, meal: 'Jollof Check-Check with Chicken', isActive: true },
        THURSDAY: { dayMealId: 108, meal: 'Jollof with Peppered Gizzard', isActive: true },
      },
    });

    renderWithProviders(
      <MemoryRouter>
        <PresetMeals />
      </MemoryRouter>,
    );

    const optionsBtn = screen.getByRole('button', { name: 'Preset options' });
    fireEvent.click(optionsBtn);

    const setDefaultBtn = screen.getByText('Set as default');
    fireEvent.click(setDefaultBtn);

    await waitFor(() => {
      expect(screen.getByText('Set Incomplete Preset as Default?')).toBeInTheDocument();
    });

    // Only Friday should be reported as missing
    expect(screen.getByText(/Friday/i)).toBeInTheDocument();
    expect(screen.queryByText(/Monday/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tuesday/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Wednesday/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Thursday/i)).not.toBeInTheDocument();
  });
});

