import { render, screen, fireEvent, act } from '@testing-library/react';
import MealButton from './MealButton';
import type { MenuDayMeal } from '../../api/Services/MenuServices';

describe('MealButton Component', () => {
  const mockMeal: MenuDayMeal = {
    id: 10,
    menuDayId: 1,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    meal: {
      id: 100,
      name: 'Grilled Salmon',
      imagePath: 'http://example.com/salmon.jpg',
      foodCode: 'FOOD_100',
      calories: 450,
      description: 'Fresh grilled salmon',
    },
  };

  const defaultProps = {
    meal: mockMeal,
    isSelected: false,
    isDisabled: false,
    isDimmed: true,
    onSelect: jest.fn(),
    onLongPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders meal information correctly', () => {
    render(<MealButton {...defaultProps} />);

    expect(screen.getByText('Grilled Salmon')).toBeInTheDocument();
    expect(screen.getByText('450 kcal')).toBeInTheDocument();
    const img = screen.getByRole('img', { name: 'Grilled Salmon' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/salmon.jpg');
  });

  it('triggers onSelect when clicked in standard mode', () => {
    render(<MealButton {...defaultProps} />);

    const button = screen.getByRole('radio');
    fireEvent.click(button);

    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
    expect(defaultProps.onLongPress).not.toHaveBeenCalled();
  });

  it('triggers onLongPress and suppresses onSelect when long-pressed in standard mode', () => {
    render(<MealButton {...defaultProps} />);

    const button = screen.getByRole('radio');

    // Pointer down starts the timer
    fireEvent.pointerDown(button, { button: 0, clientX: 100, clientY: 100 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(defaultProps.onLongPress).toHaveBeenCalledWith('FOOD_100');

    // Release mouse/touch triggers click event
    fireEvent.pointerUp(button);
    fireEvent.click(button);

    // onSelect should NOT be called because it was a long press
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('does not trigger onSelect or onLongPress when isDisabled is true', () => {
    render(<MealButton {...defaultProps} isDisabled={true} />);

    const button = screen.getByRole('radio');
    expect(button).toBeDisabled();

    fireEvent.pointerDown(button, { button: 0, clientX: 100, clientY: 100 });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    fireEvent.click(button);

    expect(defaultProps.onSelect).not.toHaveBeenCalled();
    expect(defaultProps.onLongPress).not.toHaveBeenCalled();
  });

  it('handles guest mode with add and quantity counter', () => {
    const onQuantityChange = jest.fn();
    const { rerender } = render(
      <MealButton
        {...defaultProps}
        isGuestMode={true}
        quantity={0}
        onQuantityChange={onQuantityChange}
      />,
    );

    // Initial state: Add button
    const addButton = screen.getByRole('button', { name: 'Add Grilled Salmon' });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(onQuantityChange).toHaveBeenCalledWith(1);

    // Re-render with quantity = 2
    rerender(
      <MealButton
        {...defaultProps}
        isGuestMode={true}
        quantity={2}
        onQuantityChange={onQuantityChange}
      />,
    );

    const increaseBtn = screen.getByRole('button', { name: 'Increase quantity of Grilled Salmon' });
    const decreaseBtn = screen.getByRole('button', { name: 'Decrease quantity of Grilled Salmon' });

    fireEvent.click(increaseBtn);
    expect(onQuantityChange).toHaveBeenCalledWith(3);

    fireEvent.click(decreaseBtn);
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });
});
