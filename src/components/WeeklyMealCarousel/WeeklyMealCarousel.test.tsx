import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WeeklyMealCarousel, type CarouselMealItem } from './WeeklyMealCarousel';

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

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const sampleItems: CarouselMealItem[] = [
  {
    day: 'Today',
    dayName: 'Monday',
    mealName: 'Indomie Noodles Fried Egg And Sausages- Chopped Kpakpo Shito',
    imageUrl: '/images/indomie.jpg',
    hasSelection: true,
    isUnavailable: false,
    isHoliday: false,
    isToday: true,
  },
  {
    day: 'Tuesday',
    dayName: 'Tuesday',
    mealName: 'Assorted Fried Rice With Chicken Wings',
    imageUrl: '/images/fried-rice.jpg',
    hasSelection: true,
    isUnavailable: false,
    isHoliday: false,
    isToday: false,
  },
  {
    day: 'Wednesday',
    dayName: 'Wednesday',
    mealName: 'Chicken Wrap With Fries And Chicken Wings',
    imageUrl: '',
    hasSelection: true,
    isUnavailable: false,
    isHoliday: false,
    isToday: false,
  },
  {
    day: 'Thursday',
    dayName: 'Thursday',
    mealName: 'Omotuo With Groundnut Soup',
    imageUrl: '/images/omotuo.jpg',
    hasSelection: true,
    isUnavailable: false,
    isHoliday: false,
    isToday: false,
  },
  {
    day: 'Friday',
    dayName: 'Friday',
    mealName: 'Kenkey With Grilled Tilapia',
    imageUrl: '',
    hasSelection: true,
    isUnavailable: false,
    isHoliday: false,
    isToday: false,
  },
];

describe('WeeklyMealCarousel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all meal slides with day badges and meal titles', () => {
    render(
      <MemoryRouter>
        <WeeklyMealCarousel items={sampleItems} defaultIndex={0} />
      </MemoryRouter>
    );

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
    expect(screen.getByText('Thursday')).toBeInTheDocument();
    expect(screen.getByText('Friday')).toBeInTheDocument();

    expect(
      screen.getByText('Indomie Noodles Fried Egg And Sausages- Chopped Kpakpo Shito')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Assorted Fried Rice With Chicken Wings')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Chicken Wrap With Fries And Chicken Wings')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Omotuo With Groundnut Soup')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Kenkey With Grilled Tilapia')
    ).toBeInTheDocument();
  });

  it('navigates to /select-meal when day badge edit button is clicked', () => {
    render(
      <MemoryRouter>
        <WeeklyMealCarousel items={sampleItems} defaultIndex={0} />
      </MemoryRouter>
    );

    const editBadge = screen.getByLabelText('Edit selection for Monday');
    fireEvent.click(editBadge);

    expect(mockNavigate).toHaveBeenCalledWith('/select-meal');
  });

  it('calls custom onEdit callback when provided and edit badge is clicked', () => {
    const handleEdit = jest.fn();

    render(
      <MemoryRouter>
        <WeeklyMealCarousel items={sampleItems} defaultIndex={0} onEdit={handleEdit} />
      </MemoryRouter>
    );

    const editBadge = screen.getByLabelText('Edit selection for Tuesday');
    fireEvent.click(editBadge);

    expect(handleEdit).toHaveBeenCalled();
  });

  it('renders 5 pagination dots for the 5 days', () => {
    render(
      <MemoryRouter>
        <WeeklyMealCarousel items={sampleItems} defaultIndex={0} />
      </MemoryRouter>
    );

    const dots = screen.getAllByRole('button', { name: /Go to slide/i });
    expect(dots).toHaveLength(5);
  });

  it('renders loading progress indicator when isLoading is true', () => {
    render(
      <MemoryRouter>
        <WeeklyMealCarousel isLoading={true} items={[]} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('carousel-loading-indicator')).toBeInTheDocument();
    expect(screen.getByText('Loading your selections')).toBeInTheDocument();
    expect(screen.getByText("Fetching this week's meal plan...")).toBeInTheDocument();
    expect(screen.queryByTestId('swiper-carousel')).not.toBeInTheDocument();
  });
});


