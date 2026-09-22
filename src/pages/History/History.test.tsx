import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { History } from './History';

const mockUserHistoryData = {
  pagination: {
    page: 1,
    limit: 20,
    totalWeeks: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  data: [
    {
      weekMenuScheduleId: 10,
      week: 34,
      year: 2026,
      menu: {
        id: 1,
        title: 'Summer Standard Menu',
      },
      status: 'ACTIVE',
      selection: {
        createdById: 1,
        createdBy: 'Test User',
        createdForId: 1,
        createdFor: 'Test User',
        selectionStatus: 'SUBMITTED',
        mealSelections: {
          MONDAY: {
            id: 101,
            mealName: 'Grilled Chicken Salad',
            foodCode: 'GCS01',
            calories: 450,
            selectionType: 'MEAL',
          },
        },
      },
    },
  ],
};

const mockAdminHistoryData = {
  pagination: {
    page: 1,
    limit: 20,
    totalWeeks: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  data: [
    {
      weekMenuScheduleId: 10,
      week: 34,
      year: 2026,
      menu: {
        id: 1,
        title: 'Summer Standard Menu',
      },
      status: 'ACTIVE',
      totalResponses: 15,
      selections: {
        MONDAY: {
          total: 10,
          response: [
            {
              id: 5,
              name: 'Grilled Chicken Salad',
              imagePath: null,
              calories: 450,
              foodCode: 'GCS01',
              count: 10,
              users: [{ id: 1, name: 'Alice', quantity: 1 }],
            },
          ],
        },
      },
    },
  ],
};

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockCreatePreset = jest.fn();

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: {
      user: { id: 1, name: 'Test Admin', roleName: 'admin' },
    },
  }),
}));

jest.mock('../../api/Services/MenuServices', () => ({
  menuService: {
    getDays: jest.fn().mockResolvedValue([{ id: 1, day: 'MONDAY' }]),
    getMeals: jest.fn().mockResolvedValue([
      { id: 101, menuDayId: 1, meal: { id: 5, name: 'Grilled Chicken Salad' } },
    ]),
  },
}));

jest.mock('../../api/useApiQueries', () => ({
  useUserWeeklyHistoryQuery: () => ({
    data: mockUserHistoryData,
    isLoading: false,
    isError: false,
  }),
  useWeeklyHistoryQuery: () => ({
    data: mockAdminHistoryData,
    isLoading: false,
    isError: false,
  }),
  useCreatePresetMutation: () => ({
    mutateAsync: mockCreatePreset,
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('History Page Component', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePreset.mockReset();
    mockCreatePreset.mockResolvedValue({ id: 99, name: 'Summer Standard Menu Preset' });
  });

  afterEach(() => {
    cleanup();
  });
  it('renders history header, title, user weekly cards with descriptive week date range collapsed by default and expands on click', () => {
    renderWithProviders(<History />);

    expect(screen.getByText(/Edziban/i)).toBeInTheDocument();
    expect(screen.getByText('Selection History')).toBeInTheDocument();
    expect(screen.getByText('Week 34 • Summer Standard Menu')).toBeInTheDocument();
    expect(screen.getByText('Aug 17 - 21, 2026')).toBeInTheDocument();

    // Collapsed by default: individual meal selections not shown
    expect(screen.queryByText('Grilled Chicken Salad')).not.toBeInTheDocument();
    expect(screen.queryByText('Aug 17')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByRole('button', { name: /expand week/i }));

    expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument();
    expect(screen.getByText('Aug 17')).toBeInTheDocument();
  });

  it('toggles filter panel and displays live date range preview for entered week numbers', () => {
    renderWithProviders(<History />);

    const filterButton = screen.getByRole('button', { name: /toggle filter panel/i });
    fireEvent.click(filterButton);

    expect(screen.getByText(/Week & Year Range Filters/i)).toBeInTheDocument();
    const fromWeekInput = screen.getByLabelText(/From Week/i);
    const fromYearInput = screen.getByLabelText(/From Year/i);

    fireEvent.change(fromYearInput, { target: { value: '2026' } });
    fireEvent.change(fromWeekInput, { target: { value: '35' } });

    expect(screen.getByText('Aug 24 - 28, 2026')).toBeInTheDocument();
  });

  it('switches between My Selection History and Admin Report History tabs with descriptive week date ranges', () => {
    renderWithProviders(<History />);

    const adminTab = screen.getByText('Report History');
    fireEvent.click(adminTab);

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Week 34 • Summer Standard Menu')).toBeInTheDocument();

    // Collapsed by default: detailed order breakdown not visible
    expect(screen.queryByText('10 total orders')).not.toBeInTheDocument();

    // Click header to expand
    fireEvent.click(screen.getByText('15'));

    expect(screen.getByText('10 total orders')).toBeInTheDocument();
    expect(screen.getByText('Aug 17')).toBeInTheDocument();
  });

  it('renders Save as preset button on history card and saves preset with default name', async () => {
    renderWithProviders(<History />);

    const savePresetBtn = screen.getByRole('button', { name: /Save as preset/i });
    expect(savePresetBtn).toBeInTheDocument();

    fireEvent.click(savePresetBtn);

    // Modal should open
    expect(screen.getByRole('heading', { name: 'Save as preset' })).toBeInTheDocument();

    // Input should be pre-filled with default name: "Menu title + Preset"
    const input = screen.getByPlaceholderText('Enter preset name') as HTMLInputElement;
    expect(input.value).toBe('Summer Standard Menu Preset');

    // Click Save Preset
    const submitBtn = screen.getByRole('button', { name: 'Save Preset' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreatePreset).toHaveBeenCalledWith({
        name: 'Summer Standard Menu Preset',
        menuId: 1,
        userId: 1,
        presetItems: [{ menuDayId: 1, dayMealId: 101 }],
      });
    });

    expect(
      await screen.findByText(/Preset "Summer Standard Menu Preset" saved successfully/i),
    ).toBeInTheDocument();
  });

  it('allows user to change preset name before saving', async () => {
    renderWithProviders(<History />);

    const savePresetBtn = screen.getByRole('button', { name: /Save as preset/i });
    fireEvent.click(savePresetBtn);

    const input = screen.getByPlaceholderText('Enter preset name');
    fireEvent.change(input, { target: { value: 'My Summer Favorites' } });

    const submitBtn = screen.getByRole('button', { name: 'Save Preset' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreatePreset).toHaveBeenCalledWith({
        name: 'My Summer Favorites',
        menuId: 1,
        userId: 1,
        presetItems: [{ menuDayId: 1, dayMealId: 101 }],
      });
    });

    expect(
      await screen.findByText(/Preset "My Summer Favorites" saved successfully/i),
    ).toBeInTheDocument();
  });
});
