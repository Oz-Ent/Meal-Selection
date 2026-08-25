import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MarkHolidays } from './MarkHolidays';

const mockCreateHoliday = jest.fn();
const mockOverrideHoliday = jest.fn();

const mockPublicHolidays = [
  {
    id: 1,
    title: "New Year's Day",
    date: '2026-01-01',
    dayName: 'Thursday',
    source: 'PUBLIC',
    isIgnored: false,
    adjustedDate: null,
  },
];

const mockCompanyHolidays = [
  {
    id: 2,
    title: 'Company Founders Day',
    date: '2026-08-15',
    endDate: '2026-08-16',
    dayName: 'Saturday',
    source: 'COMPANY',
    description: 'Annual retreat day',
    isCompany: true,
  },
];

const mockWeeklyEffectiveHolidays = [
  {
    title: "New Year's Day",
    date: '2026-01-01',
    dayName: 'Thursday',
    source: 'PUBLIC',
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

  it('renders holiday sections and tab controls', () => {
    render(
      <MemoryRouter>
        <MarkHolidays />
      </MemoryRouter>
    );

    expect(screen.getByText('Mark & Override Holidays')).toBeInTheDocument();
    expect(screen.getByText("New Year's Day")).toBeInTheDocument();
    expect(screen.getByText('Company Founders Day')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Company Holiday' })).toBeInTheDocument();
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
    expect(screen.getByText('Company Founders Day')).toBeInTheDocument();
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

    expect(screen.getByText('Schedule a special company closure or team day off. Meal selections automatically lock for this date.')).toBeInTheDocument();

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

    const overrideBtn = screen.getByRole('button', { name: /Mark as Working Day/i });
    fireEvent.click(overrideBtn);

    await waitFor(() => {
      expect(mockOverrideHoliday).toHaveBeenCalledWith(
        expect.objectContaining({
          originalDate: '2026-01-01',
          isIgnored: true,
        })
      );
    });
  });
});
