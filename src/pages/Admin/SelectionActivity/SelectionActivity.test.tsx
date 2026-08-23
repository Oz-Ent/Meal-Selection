import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SelectionActivity } from './SelectionActivity';
import {
  useMealsQuery,
  useMenuDaysQuery,
  useMenuMealsQuery,
  useReplaceWeeklyMealMutation,
  useWeekScheduleQuery,
  useWeeklyMealReportQuery,
} from '../../../api/useApiQueries';
import * as exportPdfModule from '../../../utils/exportMealReportPdf';

jest.mock('../../../api/useApiQueries', () => ({
  useWeekScheduleQuery: jest.fn(),
  useMenuDaysQuery: jest.fn(),
  useMenuMealsQuery: jest.fn(),
  useMealsQuery: jest.fn(),
  useWeeklyMealReportQuery: jest.fn(),
  useReplaceWeeklyMealMutation: jest.fn(),
}));

const mockedUseWeekScheduleQuery = useWeekScheduleQuery as jest.Mock;
const mockedUseMenuDaysQuery = useMenuDaysQuery as jest.Mock;
const mockedUseMenuMealsQuery = useMenuMealsQuery as jest.Mock;
const mockedUseMealsQuery = useMealsQuery as jest.Mock;
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

  it('triggers PDF export when Export button next to day navigation is clicked', () => {
    const exportSpy = jest.spyOn(exportPdfModule, 'exportWeeklyReportToPdf').mockImplementation(() => {});
    renderComponent();

    const exportButton = screen.getByRole('button', { name: /export report/i });
    fireEvent.click(exportButton);

    expect(exportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        report: sampleWeeklyReport,
        selectedDay: 'MONDAY',
        titlePrefix: 'Food Assignment Report',
      }),
    );
    exportSpy.mockRestore();
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
});
