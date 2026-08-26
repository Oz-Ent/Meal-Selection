import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserActivities } from './Activities';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  LogOut: () => <span data-testid="icon-logout" />,
  Check: () => <span data-testid="icon-check" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Search: () => <span data-testid="icon-search" />,
  Pencil: () => <span data-testid="icon-pencil" />,
  Loader2: () => <span data-testid="icon-loader" />,
}));

// Mock Swiper
jest.mock('swiper/react', () => ({
  Swiper: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <div data-testid="swiper-carousel" className={className}>
      {children}
    </div>
  ),
  SwiperSlide: ({ children, className }: { children?: ReactNode; className?: string }) => (
    <div data-testid="swiper-slide" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('swiper/modules', () => ({
  Pagination: jest.fn(),
}));

// Mock bottom navbar
jest.mock('../../components/BottomNavbar/BottomNavbar', () => ({
  BottomNavbar: () => <nav data-testid="bottom-navbar">BottomNavbar</nav>,
}));

// Mock auth
const mockAuth = {
  profile: {
    user: {
      id: 10,
      name: 'John Doe',
      email: 'john@example.com',
      roleId: 1,
      roleName: 'employee',
    },
    availability: {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    },
  },
  token: 'mock-token',
  refreshToken: 'mock-refresh',
  login: jest.fn(),
  logout: jest.fn(),
};

jest.mock('../Auth/useAuth/useAuth', () => ({
  useAuth: () => mockAuth,
}));

// Mock API queries
let mockWeeklySelectionsData: unknown = null;
let mockWeeklySelectionsLoading = false;
const mockUsersData: { id: number; name: string; email: string }[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com' },
];

jest.mock('../../api/useApiQueries', () => ({
  useWeeklySelectionsQuery: () => ({
    data: mockWeeklySelectionsData,
    isLoading: mockWeeklySelectionsLoading,
    isError: false,
  }),
  useUsersQuery: () => ({
    data: mockUsersData,
    isLoading: false,
    isError: false,
  }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('UserActivities Banner and Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWeeklySelectionsData = null;
    mockWeeklySelectionsLoading = false;
  });

  it('renders carousel loading progress indicator when selections are loading', () => {
    mockWeeklySelectionsLoading = true;

    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    expect(screen.getByTestId('carousel-loading-indicator')).toBeInTheDocument();
    expect(screen.getByText('Loading your selections...')).toBeInTheDocument();
    expect(screen.queryByText('Time To Plan Your Week!!')).not.toBeInTheDocument();
    expect(screen.queryByTestId('swiper-carousel')).not.toBeInTheDocument();
  });

  it('renders "Time To Plan Your Week!!" banner when user has no meal selections', () => {
    mockWeeklySelectionsData = null;

    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    expect(screen.getByText('Time To Plan Your Week!!')).toBeInTheDocument();
    expect(
      screen.getByText('Choose your meals for the upcoming week before the window closes.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('swiper-carousel')).not.toBeInTheDocument();
  });

  it('renders "Time To Plan Your Week!!" banner when selections object is empty', () => {
    mockWeeklySelectionsData = { mealSelections: {} };

    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    expect(screen.getByText('Time To Plan Your Week!!')).toBeInTheDocument();
    expect(screen.queryByTestId('swiper-carousel')).not.toBeInTheDocument();
  });

  it('renders Dark Carousel Banner when user HAS meal selections (object format)', () => {
    mockWeeklySelectionsData = {
      mealSelections: {
        MONDAY: {
          id: 101,
          mealName: 'Jollof Rice with Grilled Chicken',
          mealImagePath: '/images/jollof.jpg',
          selectionType: 'MEAL',
        },
        TUESDAY: {
          id: 102,
          mealName: 'Waakye Deluxe',
          mealImagePath: '/images/waakye.jpg',
          selectionType: 'MEAL',
        },
        WEDNESDAY: {
          id: 103,
          mealName: 'Unavailable',
          selectionType: 'UNAVAILABLE',
        },
      },
    };

    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    // Should NOT render the planning banner
    expect(screen.queryByText('Time To Plan Your Week!!')).not.toBeInTheDocument();

    // Should render the carousel and carousel items
    expect(screen.getByTestId('swiper-carousel')).toBeInTheDocument();
    expect(screen.getByText('Jollof Rice with Grilled Chicken')).toBeInTheDocument();
    expect(screen.getByText('Waakye Deluxe')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('renders Dark Carousel Banner when user HAS meal selections (array format)', () => {
    mockWeeklySelectionsData = [
      {
        id: 201,
        menuDay: { day: 'MONDAY' },
        dayMeal: { meal: { name: 'Fried Rice & Fish', imagePath: '/images/fried-rice.jpg' } },
        selectionType: 'MEAL',
      },
      {
        id: 202,
        menuDay: { day: 'THURSDAY' },
        selectionType: 'HOLIDAY',
      },
    ];

    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    expect(screen.queryByText('Time To Plan Your Week!!')).not.toBeInTheDocument();
    expect(screen.getByTestId('swiper-carousel')).toBeInTheDocument();
    expect(screen.getByText('Fried Rice & Fish')).toBeInTheDocument();
    expect(screen.getByText('Holiday')).toBeInTheDocument();
  });

  it('opens meal selection choice modal when clicking the banner in empty state', () => {
    mockWeeklySelectionsData = null;

    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    const banner = screen.getByText('Time To Plan Your Week!!').closest('div');
    expect(banner).toBeInTheDocument();
    fireEvent.click(banner!);

    // Modal options should appear
    expect(screen.getByText('Select meals')).toBeInTheDocument();
    expect(screen.getByText('For yourself')).toBeInTheDocument();
    expect(screen.getByText('For another user')).toBeInTheDocument();
  });

  it('navigates to /select-meal when "For yourself" is clicked', () => {
    mockWeeklySelectionsData = null;

    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Time To Plan Your Week!!').closest('div')!);
    fireEvent.click(screen.getByText('For yourself'));

    expect(mockNavigate).toHaveBeenCalledWith('/select-meal');
  });

  it('navigates to /preset-meals when Preset Meals card is clicked', () => {
    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Preset Meals').closest('button')!);
    expect(mockNavigate).toHaveBeenCalledWith('/preset-meals');
  });

  it('opens logout confirmation modal when logout button is clicked', () => {
    render(
      <MemoryRouter>
        <UserActivities />
      </MemoryRouter>
    );

    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);

    expect(screen.getByText(/Sign Out of Account\?/i)).toBeInTheDocument();
  });
});
