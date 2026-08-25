import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SelectionActivity } from './SelectionActivity';
import {
  useMealsQuery,
  useMenuDaysQuery,
  useMenuMealsQuery,
  useReplaceWeeklyMealMutation,
  useWeeklyHolidaysQuery,
  useWeekScheduleQuery,
  useWeeklyMealReportQuery,
} from '../../../api/useApiQueries';
import * as exportPdfModule from '../../../utils/exportMealReportPdf';

jest.mock('../../../api/useApiQueries', () => ({
  useWeekScheduleQuery: jest.fn(),
  useMenuDaysQuery: jest.fn(),
  useMenuMealsQuery: jest.fn(),
  useMealsQuery: jest.fn(),
  useWeeklyHolidaysQuery: jest.fn(),
  useWeeklyMealReportQuery: jest.fn(),
  useReplaceWeeklyMealMutation: jest.fn(),
}));

const mockedUseWeekScheduleQuery = useWeekScheduleQuery as jest.Mock;
const mockedUseMenuDaysQuery = useMenuDaysQuery as jest.Mock;
const mockedUseMenuMealsQuery = useMenuMealsQuery as jest.Mock;
const mockedUseMealsQuery = useMealsQuery as jest.Mock;
const mockedUseWeeklyHolidaysQuery = useWeeklyHolidaysQuery as jest.Mock;
const mockedUseWeeklyMealReportQuery = useWeeklyMealReportQuery as jest.Mock;
const mockedUseReplaceWeeklyMealMutation = useReplaceWeeklyMealMutation as jest.Mock;

const sampleSchedule = {
  id: 1,
  week: 34,
  year: 2026,
  status: 'ACTIVE',
  menu: { id: 10, title: 'Weekly Menu' },
};

const sampleDays = [
  { id: 1, day: 'MONDAY' },
  { id: 2, day: 'TUESDAY' },
];

const sampleMenuMeals = [
  {
    id: 101,
    menuDayId: 1,
    isActive: true,
    meal: {
      id: 1,
      name: 'Jollof Rice with Chicken',
      foodCode: 'JL-01',
      calories: 650,
      imagePath: null,
      isActive: true,
    },
  },
  {
    id: 102,
    menuDayId: 1,
    isActive: true,
    meal: {
      id: 2,
      name: 'Fried Rice with Fish',
      foodCode: 'FR-02',
      calories: 700,
      imagePath: null,
      isActive: true,
    },
  },
  {
    id: 103,
    menuDayId: 2,
    isActive: true,
    meal: {
      id: 3,
      name: 'Waakye with Beef',
      foodCode: 'WK-01',
      calories: 600,
      imagePath: null,
      isActive: true,
    },
  },
];

const sampleWeeklyReport = {
  MONDAY: {
    total: 5,
    response: [
      {
        id: 1,
        name: 'Jollof Rice with Chicken',
        imagePath: null,
        calories: 650,
        foodCode: 'JL-01',
        count: 4,
        users: [
          { id: 1, name: 'Alice Smith', quantity: 1 },
          { id: 2, name: 'Bob Jones', quantity: 3 },
        ],
      },
      {
        id: 2,
        name: 'Fried Rice with Fish',
        imagePath: null,
        calories: 700,
        foodCode: 'FR-02',
        count: 1,
        users: [{ id: 3, name: 'Charlie Brown', quantity: 1 }],
      },
    ],
  },
  TUESDAY: {
    total: 2,
    response: [
      {
        id: 3,
        name: 'Waakye with Beef',
        imagePath: null,
        calories: 600,
        foodCode: 'WK-01',
        count: 2,
        users: [{ id: 4, name: 'David Lee', quantity: 2 }],
      },
    ],
  },
};

const renderComponent = () =>
  render(
    <MemoryRouter>
      <SelectionActivity />
    </MemoryRouter>,
  );

describe('SelectionActivity (Food Assignment)', () => {
  const mutateAsyncMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseWeekScheduleQuery.mockReturnValue({
      data: sampleSchedule,
      isLoading: false,
      isError: false,
    });
    mockedUseMenuDaysQuery.mockReturnValue({
      data: sampleDays,
      isLoading: false,
      isError: false,
    });
    mockedUseMenuMealsQuery.mockReturnValue({
      data: sampleMenuMeals,
      isLoading: false,
      isError: false,
    });
    mockedUseMealsQuery.mockReturnValue({
      data: { meals: sampleMenuMeals.map((m) => m.meal) },
      isLoading: false,
      isError: false,
    });
    mockedUseWeeklyHolidaysQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockedUseWeeklyMealReportQuery.mockReturnValue({
      data: sampleWeeklyReport,
      isLoading: false,
      isError: false,
    });
    mockedUseReplaceWeeklyMealMutation.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  it('renders Food Assignment page with current day meals and counts', () => {
    renderComponent();

    expect(screen.getByText('Food Assignment')).toBeInTheDocument();
    expect(screen.getByText('Monday Menu')).toBeInTheDocument();
    expect(screen.getByText('Jollof Rice with Chicken')).toBeInTheDocument();
    expect(screen.getByText('Fried Rice with Fish')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search meal or user...')).toBeInTheDocument();
  });

  it('switches days via bottom day navigation buttons', () => {
    renderComponent();

    expect(screen.getByText('Monday Menu')).toBeInTheDocument();

    const nextDayButton = screen.getByRole('button', { name: /next day navigation/i });
    fireEvent.click(nextDayButton);

    expect(screen.getByText('Tuesday Menu')).toBeInTheDocument();
    expect(screen.getByText('Waakye with Beef')).toBeInTheDocument();
  });

  it('expands meal to show assigned recipients list', () => {
    renderComponent();

    expect(screen.queryByText(/1\. Alice Smith/)).not.toBeInTheDocument();

    const mealCard = screen.getByText('Jollof Rice with Chicken');
    fireEvent.click(mealCard);

    expect(screen.getByText(/1\. Alice Smith/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Bob Jones/)).toBeInTheDocument();
    expect(screen.getByText('qty: 3')).toBeInTheDocument();
  });

  it('opens kebab menu and triggers Change Meal bottom modal', async () => {
    mutateAsyncMock.mockResolvedValueOnce({ affectedSelections: 4, affectedHeadcount: 2 });
    renderComponent();

    const moreButtons = screen.getAllByRole('button', { name: /more options/i });
    fireEvent.click(moreButtons[0]);

    const changeMealOption = screen.getByRole('button', { name: /change meal/i });
    expect(changeMealOption).toBeInTheDocument();
    fireEvent.click(changeMealOption);

    expect(screen.getByRole('heading', { name: 'Change meal' })).toBeInTheDocument();

    // Select replacement dish
    const replacementOptions = screen.getAllByText('Fried Rice with Fish');
    fireEvent.click(replacementOptions[replacementOptions.length - 1]);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({
          unavailableDayMealId: 101,
          replacementDayMealId: 102,
        }),
      );
    });

    expect(await screen.findByText(/Meal changed successfully/)).toBeInTheDocument();
  });

  it('opens export modal and triggers PDF export for current day', () => {
    const exportSpy = jest.spyOn(exportPdfModule, 'exportWeeklyReportToPdf').mockImplementation(() => {});
    renderComponent();

    const exportButton = screen.getByRole('button', { name: /export report/i });
    fireEvent.click(exportButton);

    expect(screen.getByRole('heading', { name: 'Export food assignment' })).toBeInTheDocument();

    const forDayButton = screen.getByRole('button', { name: /for monday/i });
    fireEvent.click(forDayButton);

    expect(exportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        report: sampleWeeklyReport,
        selectedDay: 'MONDAY',
        titlePrefix: 'Food Assignment Report',
      }),
    );
    expect(screen.getByText('Menu exported successfully.')).toBeInTheDocument();
    exportSpy.mockRestore();
  });

  it('opens export modal and triggers PDF export for the week', () => {
    const exportSpy = jest.spyOn(exportPdfModule, 'exportWeeklyReportToPdf').mockImplementation(() => {});
    renderComponent();

    const exportButton = screen.getByRole('button', { name: /export report/i });
    fireEvent.click(exportButton);

    expect(screen.getByRole('heading', { name: 'Export food assignment' })).toBeInTheDocument();

    const forWeekButton = screen.getByRole('button', { name: /for the week/i });
    fireEvent.click(forWeekButton);

    expect(exportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        report: sampleWeeklyReport,
        selectedDay: 'ALL',
        titlePrefix: 'Food Assignment Report',
      }),
    );
    expect(screen.getByText('Menu exported successfully.')).toBeInTheDocument();
    exportSpy.mockRestore();
  });

  it('filters meals by meal name in top search bar', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search meal or user...');
    fireEvent.change(searchInput, { target: { value: 'Jollof' } });

    expect(screen.getByText('Jollof Rice with Chicken')).toBeInTheDocument();
    expect(screen.queryByText('Fried Rice with Fish')).not.toBeInTheDocument();
  });

  it('searches for a user and displays the chosen meal and the user under that selection', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search meal or user...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // Shows Jollof (the meal Alice chose)
    expect(screen.getByText('Jollof Rice with Chicken')).toBeInTheDocument();
    // Fried Rice with Fish was chosen by Charlie, so it's not shown
    expect(screen.queryByText('Fried Rice with Fish')).not.toBeInTheDocument();

    // Alice is automatically visible under the Jollof selection
    expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument();
  });

  it('filters strictly by createdFor / recipient and ignores createdBy creator name', () => {
    mockedUseWeeklyMealReportQuery.mockReturnValue({
      data: {
        MONDAY: {
          total: 2,
          response: [
            {
              id: 1,
              name: 'Jollof Rice with Chicken',
              foodCode: 'JL-01',
              calories: 650,
              imagePath: null,
              count: 1,
              users: [
                {
                  id: 2,
                  name: 'Caleb Kwabena',
                  createdForName: 'Caleb Kwabena',
                  createdByName: 'Hubert Kingsley',
                  isGuest: false,
                  quantity: 1,
                },
              ],
            },
            {
              id: 2,
              name: 'Fried Rice with Fish',
              foodCode: 'FR-02',
              calories: 700,
              imagePath: null,
              count: 1,
              users: [
                {
                  id: 1,
                  name: 'Hubert Kingsley',
                  createdForName: 'Hubert Kingsley',
                  createdByName: 'Hubert Kingsley',
                  isGuest: false,
                  quantity: 1,
                },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });

    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search meal or user...');
    // Searching Hubert should only return Fried Rice (created for Hubert), NOT Jollof (created for Caleb by Hubert)
    fireEvent.change(searchInput, { target: { value: 'Hubert' } });

    expect(screen.getByText('Fried Rice with Fish')).toBeInTheDocument();
    expect(screen.queryByText('Jollof Rice with Chicken')).not.toBeInTheDocument();
    expect(screen.getByText(/Hubert Kingsley/i)).toBeInTheDocument();
    expect(screen.queryByText(/Caleb Kwabena/i)).not.toBeInTheDocument();
  });

  it('displays guest selections as "Guest" and matches search by keyword "guest" only', () => {
    mockedUseWeeklyMealReportQuery.mockReturnValue({
      data: {
        MONDAY: {
          total: 6,
          response: [
            {
              id: 1,
              name: 'Jollof Rice with Chicken',
              foodCode: 'JL-01',
              calories: 650,
              imagePath: null,
              count: 5,
              users: [
                {
                  id: null,
                  name: 'Hubert Kingsley Ocran (Guest)',
                  createdForName: null,
                  createdByName: 'Hubert Kingsley Ocran',
                  isGuest: true,
                  quantity: 5,
                },
              ],
            },
            {
              id: 2,
              name: 'Fried Rice with Fish',
              foodCode: 'FR-02',
              calories: 700,
              imagePath: null,
              count: 1,
              users: [
                {
                  id: 1,
                  name: 'Hubert Kingsley Ocran',
                  createdForName: 'Hubert Kingsley Ocran',
                  createdByName: 'Hubert Kingsley Ocran',
                  isGuest: false,
                  quantity: 1,
                },
              ],
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });

    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search meal or user...');

    // When searching for Hubert, only Hubert's own meal (Fried Rice with Fish) shows, NOT the guest meal (Jollof Rice with Chicken)
    fireEvent.change(searchInput, { target: { value: 'hubert' } });
    expect(screen.getByText('Fried Rice with Fish')).toBeInTheDocument();
    expect(screen.queryByText('Jollof Rice with Chicken')).not.toBeInTheDocument();
    expect(screen.getByText(/1\. Hubert Kingsley Ocran/i)).toBeInTheDocument();

    // When searching for "guest", the guest meal shows with "Guest" as the recipient name (not creator name)
    fireEvent.change(searchInput, { target: { value: 'guest' } });
    expect(screen.getByText('Jollof Rice with Chicken')).toBeInTheDocument();
    expect(screen.queryByText('Fried Rice with Fish')).not.toBeInTheDocument();
    expect(screen.getByText(/1\. Guest/i)).toBeInTheDocument();
    expect(screen.getByText('qty: 5')).toBeInTheDocument();
    expect(screen.queryByText(/Hubert Kingsley Ocran \(Guest\)/i)).not.toBeInTheDocument();
  });

  it('displays empty state when search finds no results and can be cleared', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search meal or user...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentDishOrUser' } });

    expect(screen.getByText(/No results found for "NonExistentDishOrUser"/i)).toBeInTheDocument();

    const clearButtons = screen.getAllByRole('button', { name: /clear search/i });
    expect(clearButtons.length).toBeGreaterThan(0);
    fireEvent.click(clearButtons[0]);

    expect(screen.getByText('Jollof Rice with Chicken')).toBeInTheDocument();
    expect(screen.getByText('Fried Rice with Fish')).toBeInTheDocument();
  });

  it('renders empty state when there are no menu days', () => {
    mockedUseMenuDaysQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    renderComponent();

    expect(screen.getByText(/There are no food assignments available for this week/i)).toBeInTheDocument();
  });

  it('renders Unavailable selections card with count and expands recipients', () => {
    const reportWithUnavailable = {
      MONDAY: {
        total: 6,
        response: [
          ...sampleWeeklyReport.MONDAY.response,
          {
            id: -1,
            name: 'Unavailable',
            imagePath: '',
            calories: 0,
            foodCode: 'UNAVAILABLE',
            count: 1,
            users: [{ id: 10, name: 'Grace Hopper', quantity: 1 }],
          },
        ],
      },
      TUESDAY: sampleWeeklyReport.TUESDAY,
    };

    mockedUseWeeklyMealReportQuery.mockReturnValue({
      data: reportWithUnavailable,
      isLoading: false,
      isError: false,
    });

    renderComponent();

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Opted out of lunch delivery')).toBeInTheDocument();

    const unavailableCard = screen.getByText('Unavailable');
    fireEvent.click(unavailableCard);

    expect(screen.getByText(/Unavailable Recipients/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Grace Hopper/i)).toBeInTheDocument();
  });

  it('renders holiday banner and indicator when day is marked as a holiday', () => {
    const reportWithHoliday = {
      MONDAY: {
        total: 0,
        isHoliday: true,
        holidayTitle: 'Independence Day',
        holiday: {
          id: 5,
          title: 'Independence Day',
          description: 'Official Ghana Public Holiday',
          isCompany: false,
          source: 'PUBLIC',
        },
        response: [],
      },
      TUESDAY: sampleWeeklyReport.TUESDAY,
    };

    mockedUseWeeklyMealReportQuery.mockReturnValue({
      data: reportWithHoliday,
      isLoading: false,
      isError: false,
    });

    renderComponent();

    expect(screen.getByText('Independence Day')).toBeInTheDocument();
    expect(screen.getByText('Official Ghana Public Holiday')).toBeInTheDocument();
    expect(screen.getAllByText('Holiday').length).toBeGreaterThan(0);
  });
});
