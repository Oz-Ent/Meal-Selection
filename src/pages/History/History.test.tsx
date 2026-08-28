import { render, screen, fireEvent } from '@testing-library/react';
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

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => ({
    profile: {
      user: { id: 1, name: 'Test Admin', roleName: 'admin' },
    },
  }),
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
}));

describe('History Page Component', () => {
  it('renders history header, title, user weekly cards with descriptive week date range and day dates', () => {
    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Edziban/i)).toBeInTheDocument();
    expect(screen.getByText('Selection History')).toBeInTheDocument();
    expect(screen.getByText('Week 34 • Summer Standard Menu')).toBeInTheDocument();
    expect(screen.getByText('Aug 17 - 21, 2026')).toBeInTheDocument();
    expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument();
    expect(screen.getByText('Aug 17')).toBeInTheDocument();
  });

  it('toggles filter panel and displays live date range preview for entered week numbers', () => {
    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

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
    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    const adminTab = screen.getByText('Admin Report History');
    fireEvent.click(adminTab);

    expect(screen.getByText('15 Total Orders')).toBeInTheDocument();
    expect(screen.getByText('10 total orders')).toBeInTheDocument();
    expect(screen.getByText('Aug 17 - 21, 2026')).toBeInTheDocument();
    expect(screen.getByText('Aug 17')).toBeInTheDocument();
  });
});
