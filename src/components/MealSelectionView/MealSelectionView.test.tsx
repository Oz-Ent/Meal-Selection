import { render, screen, fireEvent } from '@testing-library/react';
import { MealSelectionView } from './MealSelectionView';
import type { MenuDay, MenuDayMeal } from '../../api/Services/MenuServices';
import type { HolidayItem } from '../../api/Services/HolidayServices';

jest.mock('../../api/useApiQueries', () => ({
  useMealDetailsQuery: () => ({ data: null, isPending: false, isError: false }),
}));

const mockMenuDays: MenuDay[] = [
  { id: 1, day: 'MONDAY' },
  { id: 2, day: 'TUESDAY' },
];

const mockMenuDayMeals: MenuDayMeal[] = [
  {
    id: 101,
    menuDayId: 1,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    meal: {
      id: 1,
      name: 'Banku & Tilapia',
      imagePath: 'banku.png',
      foodCode: 'BT1',
      calories: 550,
      description: 'Delicious Banku',
    },
  },
  {
    id: 102,
    menuDayId: 1,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    meal: {
      id: 2,
      name: 'Jollof Rice',
      imagePath: 'jollof.png',
      foodCode: 'JR1',
      calories: 600,
      description: 'Spicy Jollof',
    },
  },
  {
    id: 201,
    menuDayId: 2,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    meal: {
      id: 3,
      name: 'Fried Rice & Chicken',
      imagePath: 'friedrice.png',
      foodCode: 'FR1',
      calories: 650,
      description: 'Golden Fried Rice',
    },
  },
];

const mockHolidays: HolidayItem[] = [
  {
    id: 1,
    title: 'Independence Day',
    date: '2026-03-06',
    dayName: 'TUESDAY',
    source: 'PUBLIC',
    isCompany: false,
  },
];

describe('MealSelectionView Component', () => {
  it('renders dishes and other options (Unavailable, Holiday)', () => {
    const handleSelectionChange = jest.fn();

    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{}}
        onSelectionChange={handleSelectionChange}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Banku & Tilapia')).toBeInTheDocument();
    expect(screen.getByText('Jollof Rice')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Holiday')).toBeInTheDocument();
  });

  it('hides other options (Unavailable, Holiday) when showOtherOptions is false', () => {
    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{}}
        onSelectionChange={jest.fn()}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
        showOtherOptions={false}
      />,
    );

    expect(screen.getByText('Banku & Tilapia')).toBeInTheDocument();
    expect(screen.getByText('Jollof Rice')).toBeInTheDocument();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
    expect(screen.queryByText('Holiday')).not.toBeInTheDocument();
    expect(screen.queryByText('Other options')).not.toBeInTheDocument();
  });

  it('selects a dish when clicked and toggles off when clicked again', () => {
    const handleSelectionChange = jest.fn();

    const { rerender } = render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{}}
        onSelectionChange={handleSelectionChange}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
      />,
    );

    const bankuRadio = screen.getByRole('radio', { name: /Banku & Tilapia/i });
    fireEvent.click(bankuRadio);
    expect(handleSelectionChange).toHaveBeenCalledWith(1, 101);

    // Rerender with Banku selected
    rerender(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{ 1: 101 }}
        onSelectionChange={handleSelectionChange}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
      />,
    );

    // Clicking again deselects
    fireEvent.click(bankuRadio);
    expect(handleSelectionChange).toHaveBeenCalledWith(1, undefined);
  });

  it('selects Unavailable option and Holiday option', () => {
    const handleSelectionChange = jest.fn();

    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{}}
        onSelectionChange={handleSelectionChange}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
      />,
    );

    const unavailableRadio = screen.getByRole('radio', { name: /Unavailable/i });
    fireEvent.click(unavailableRadio);
    expect(handleSelectionChange).toHaveBeenCalledWith(1, 'UNAVAILABLE');

    const holidayRadio = screen.getByRole('radio', { name: /Holiday/i });
    fireEvent.click(holidayRadio);
    expect(handleSelectionChange).toHaveBeenCalledWith(1, 'HOLIDAY');
  });

  it('navigates to next and previous days', () => {
    const handleDayIndexChange = jest.fn();

    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{}}
        onSelectionChange={jest.fn()}
        currentDayIndex={0}
        onDayIndexChange={handleDayIndexChange}
      />,
    );

    const nextBtn = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextBtn);
    expect(handleDayIndexChange).toHaveBeenCalledWith(1);
  });

  it('calls onClearAllSelections and triggers toast when clear all button is clicked', () => {
    const handleClearAllSelections = jest.fn();
    const handleToast = jest.fn();

    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{ 1: 101, 2: 201 }}
        onSelectionChange={jest.fn()}
        onClearAllSelections={handleClearAllSelections}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
        onToast={handleToast}
      />,
    );

    const clearBtn = screen.getByRole('button', { name: 'Clear all selections' });
    fireEvent.click(clearBtn);

    expect(handleClearAllSelections).toHaveBeenCalledTimes(1);
    expect(handleToast).toHaveBeenCalledWith('success', 'All choices have been cleared.');
  });

  it('shows holiday banner and disables selection on auto-marked holiday days', () => {
    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{ 2: 'HOLIDAY' }}
        onSelectionChange={jest.fn()}
        currentDayIndex={1} // Tuesday has holiday
        onDayIndexChange={jest.fn()}
        weeklyHolidays={mockHolidays}
      />,
    );

    expect(screen.getAllByText('Independence Day').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Public Holiday')).toBeInTheDocument();

    const friedRiceRadio = screen.getByRole('radio', { name: /Fried Rice & Chicken/i });
    expect(friedRiceRadio).toBeDisabled();
  });

  it('shows past day locked banner and disables selection on past days', () => {
    const handleSelectionChange = jest.fn();

    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{ 1: 'UNAVAILABLE' }}
        onSelectionChange={handleSelectionChange}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
        pastDayIds={[1]}
      />,
    );

    expect(screen.getByText('Past Day')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText(/This day has passed. Selections for this day cannot be modified./i)).toBeInTheDocument();

    const bankuRadio = screen.getByRole('radio', { name: /Banku & Tilapia/i });
    expect(bankuRadio).toBeDisabled();

    const unavailableRadio = screen.getByRole('radio', { name: /Unavailable/i });
    expect(unavailableRadio).toBeDisabled();
  });

  it('shows Closed for Today banner and 10 AM message when current day is closed', () => {
    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{ 1: 'UNAVAILABLE' }}
        onSelectionChange={jest.fn()}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
        pastDayIds={[1]}
        todayDayId={1}
      />,
    );

    expect(screen.getByText('Closed for Today')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(
      screen.getByText(/Meal selection for today closed at 10:00 AM. Selections cannot be modified./i),
    ).toBeInTheDocument();
  });

  it('shows closed schedule banner and disables selection when isScheduleClosed is true', () => {

    render(
      <MealSelectionView
        menuDays={mockMenuDays}
        menuDayMeals={mockMenuDayMeals}
        selections={{}}
        onSelectionChange={jest.fn()}
        currentDayIndex={0}
        onDayIndexChange={jest.fn()}
        isScheduleClosed={true}
        closedMessage="Meal selection for this week is closed."
      />,
    );

    expect(screen.getByText('Meal Selection Closed')).toBeInTheDocument();
    expect(screen.getByText('Meal selection for this week is closed.')).toBeInTheDocument();

    const bankuRadio = screen.getByRole('radio', { name: /Banku & Tilapia/i });
    expect(bankuRadio).toBeDisabled();
  });
});

