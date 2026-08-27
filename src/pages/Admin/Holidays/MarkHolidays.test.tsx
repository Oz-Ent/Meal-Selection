import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MarkHolidays } from './MarkHolidays';

const mockCreateHoliday = jest.fn();
const mockOverrideHoliday = jest.fn();

const mockPublicHolidays = [
  {
    id: 1,
    title: "New Year's Day",
    date: '2020-01-01',
    dayName: 'Wednesday',
    source: 'PUBLIC' as const,
    isIgnored: false,
    adjustedDate: null,
  },
  {
    id: 2,
    title: 'Christmas Day',
    date: '2099-12-25',
    dayName: 'Friday',
    source: 'PUBLIC' as const,
    isIgnored: false,
    adjustedDate: null,
  },
  // Test duplicates & co-occurring holidays
  {
    id: 3,
    title: 'Kwame Nkrumah Memorial Day',
    date: '2099-09-21',
    dayName: 'Monday',
    source: 'PUBLIC' as const,
    isIgnored: false,
    adjustedDate: null,
  },
  {
    id: 4,
    title: "Founders' Day",
    date: '2099-09-21',
    dayName: 'Monday',
    source: 'PUBLIC' as const,
    isIgnored: false,
    adjustedDate: null,
  },
  {
    id: 5,
    title: 'Founders Day',
    date: '2099-09-21',
    dayName: 'Monday',
    source: 'PUBLIC' as const,
    isIgnored: false,
    adjustedDate: null,
  },
  {
    id: 6,
    title: "National Farmers' Day",
    date: '2099-12-04',
    dayName: 'Friday',
    source: 'PUBLIC' as const,
    isIgnored: false,
    adjustedDate: null,
  },
  {
    id: 7,
    title: "Farmer's Day",
    date: '2099-12-04',
    dayName: 'Friday',
    source: 'PUBLIC' as const,
    isIgnored: false,
    adjustedDate: null,
  },
  {
    id: 8,
    title: "Farmers' Day",
    date: '2099-12-04',
    dayName: 'Friday',
    source: 'PUBLIC' as const,
    isIgnored: false,
    adjustedDate: null,
  },
];

const mockCompanyHolidays = [
  {
    id: 9,
    title: 'Past Founders Day',
    date: '2020-08-15',
    endDate: '2020-08-16',
    dayName: 'Saturday',
    source: 'COMPANY' as const,
    description: 'Annual retreat day',
    isCompany: true,
  },
  {
    id: 10,
    title: 'Future End of Year Break',
    date: '2099-12-20',
    endDate: '2099-12-31',
    dayName: 'Sunday',
    source: 'COMPANY' as const,
    description: 'Upcoming annual break',
    isCompany: true,
  },
];

const mockWeeklyEffectiveHolidays = [
  {
    title: 'Christmas Day',
    date: '2099-12-25',
    dayName: 'Friday',
    source: 'PUBLIC' as const,
  },
];

jest.mock('../../../api/useApiQueries', () => ({
  useHolidaysQuery: () => ({
    data: {
      publicHolidays: mockPublicHolidays,
      companyHolidays: mockCompanyHolidays,
    },
    isLoading: false,
  }),
  useWeeklyHolidaysQuery: () => ({
    data: mockWeeklyEffectiveHolidays,
    isLoading: false,
  }),
  useCreateHolidayMutation: () => ({
    mutateAsync: mockCreateHoliday,
    isPending: false,
  }),
  useUpdateHolidayMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useDeleteHolidayMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useCreateHolidayOverrideMutation: () => ({
    mutateAsync: mockOverrideHoliday,
    isPending: false,
  }),
  useDeleteHolidayOverrideMutation: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

describe('MarkHolidays Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders holiday sections and defaults to Upcoming filter scope', () => {
    render(
      <MemoryRouter>
        <MarkHolidays />
      </MemoryRouter>
    );

    expect(screen.getByText('Mark & Override Holidays')).toBeInTheDocument();
    // In upcoming mode, future holidays are shown
    expect(screen.getByText('Christmas Day')).toBeInTheDocument();
    expect(screen.getByText('Future End of Year Break')).toBeInTheDocument();

    // Past holidays should be hidden in upcoming mode
    expect(screen.queryByText("New Year's Day")).not.toBeInTheDocument();
    expect(screen.queryByText('Past Founders Day')).not.toBeInTheDocument();

    // Toggle buttons exist
    expect(screen.getByRole('button', { name: /Upcoming/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All 2026/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Company Holiday' })).toBeInTheDocument();
  });

  it('deduplicates holidays with same name and date while keeping different holidays on same date', () => {
    render(
      <MemoryRouter>
        <MarkHolidays />
      </MemoryRouter>
    );

    // Kwame Nkrumah Memorial Day and Founders' Day are on 2099-09-21 (different names) -> both kept
    expect(screen.getByText('Kwame Nkrumah Memorial Day')).toBeInTheDocument();
    expect(screen.getByText("Founders' Day")).toBeInTheDocument();
    // Duplicate "Founders Day" (same name, same date as "Founders' Day") is deduplicated so only original appears
    expect(screen.queryByText('Founders Day')).not.toBeInTheDocument();

    // National Farmers' Day and Farmer's Day on 2099-12-04 (different names) -> both kept
    expect(screen.getByText("National Farmers' Day")).toBeInTheDocument();
    expect(screen.getByText("Farmer's Day")).toBeInTheDocument();
    // Duplicate "Farmers' Day" is deduplicated against "Farmer's Day"
    expect(screen.queryByText("Farmers' Day")).not.toBeInTheDocument();
  });

  it('toggles between Upcoming and All Year scope to display all holidays of the year', () => {
    render(
      <MemoryRouter>
        <MarkHolidays />
      </MemoryRouter>
    );

    // Click "All 2026" toggle
    const allYearToggle = screen.getByRole('button', { name: /All 2026/i });
    fireEvent.click(allYearToggle);

    // Past holidays are now visible
    expect(screen.getByText("New Year's Day")).toBeInTheDocument();
    expect(screen.getByText('Past Founders Day')).toBeInTheDocument();
    expect(screen.getByText('Christmas Day')).toBeInTheDocument();
    expect(screen.getByText('Future End of Year Break')).toBeInTheDocument();

    // Switch back to Upcoming
    const upcomingToggle = screen.getByRole('button', { name: /Upcoming/i });
    fireEvent.click(upcomingToggle);

    expect(screen.queryByText("New Year's Day")).not.toBeInTheDocument();
    expect(screen.getByText('Christmas Day')).toBeInTheDocument();
  });

  it('filters by tabs (Selection Week, Public, Company)', () => {
    render(
      <MemoryRouter>
        <MarkHolidays />
      </MemoryRouter>
    );

    const weekTab = screen.getByRole('button', { name: /Selection Week/i });
    fireEvent.click(weekTab);
    expect(screen.getAllByText(/Meal Selection Week/i).length).toBeGreaterThan(0);

    const companyTab = screen.getByRole('button', { name: /^Company \(/i });
    fireEvent.click(companyTab);
    expect(screen.getByText('Future End of Year Break')).toBeInTheDocument();
  });

  it('opens modal to create a new company holiday', async () => {
    mockCreateHoliday.mockResolvedValue({});

    render(
      <MemoryRouter>
        <MarkHolidays />
      </MemoryRouter>
    );

    const markBtn = screen.getByRole('button', { name: 'Mark Company Holiday' });
    fireEvent.click(markBtn);

    expect(
      screen.getByText(
        'Schedule a special company closure or team day off. Meal selections automatically lock for this date.'
      )
    ).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Company Retreat/i);
    fireEvent.change(titleInput, { target: { value: 'Independence Picnic' } });

    const confirmBtn = screen.getByRole('button', { name: 'Confirm Holiday' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockCreateHoliday).toHaveBeenCalled();
    });
  });

  it('allows overriding a public holiday to a working day', async () => {
    mockOverrideHoliday.mockResolvedValue({});

    render(
      <MemoryRouter>
        <MarkHolidays />
      </MemoryRouter>
    );

    const overrideBtns = screen.getAllByRole('button', { name: /Mark as Working Day/i });
    fireEvent.click(overrideBtns[0]!);

    await waitFor(() => {
      expect(mockOverrideHoliday).toHaveBeenCalledWith(
        expect.objectContaining({
          originalDate: '2099-12-25',
          isIgnored: true,
        })
      );
    });
  });
});
