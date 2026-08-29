import { render, fireEvent, act } from '@testing-library/react';
import { useLongPress } from './useLongPress';

function TestComponent({ onLongPress, delay = 500 }: { onLongPress: () => void; delay?: number }) {
  const { isLongPress, ...longPressHandlers } = useLongPress(onLongPress, delay);
  return (
    <button
      data-testid="long-press-button"
      {...longPressHandlers}
      onClick={() => {
        if (isLongPress()) return;
      }}
    >
      Press Me
    </button>
  );
}

describe('useLongPress hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('triggers onLongPress callback when held for the specified delay with mouse down', () => {
    const handleLongPress = jest.fn();
    const { getByTestId } = render(<TestComponent onLongPress={handleLongPress} delay={500} />);
    const button = getByTestId('long-press-button');

    fireEvent.pointerDown(button, { button: 0, clientX: 100, clientY: 100 });

    expect(handleLongPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(handleLongPress).toHaveBeenCalledTimes(1);
  });

  it('triggers onLongPress callback when held with touch start', () => {
    const handleLongPress = jest.fn();
    const { getByTestId } = render(<TestComponent onLongPress={handleLongPress} delay={400} />);
    const button = getByTestId('long-press-button');

    fireEvent.touchStart(button, { touches: [{ clientX: 50, clientY: 50 }] });

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(handleLongPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(handleLongPress).toHaveBeenCalledTimes(1);
  });

  it('cancels timer if mouse/touch is released before delay', () => {
    const handleLongPress = jest.fn();
    const { getByTestId } = render(<TestComponent onLongPress={handleLongPress} delay={500} />);
    const button = getByTestId('long-press-button');

    fireEvent.pointerDown(button, { button: 0, clientX: 100, clientY: 100 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    fireEvent.pointerUp(button);

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(handleLongPress).not.toHaveBeenCalled();
  });

  it('cancels timer if finger/mouse moves beyond movement threshold', () => {
    const handleLongPress = jest.fn();
    const { getByTestId } = render(<TestComponent onLongPress={handleLongPress} delay={500} />);
    const button = getByTestId('long-press-button');

    fireEvent.touchStart(button, { touches: [{ clientX: 100, clientY: 100 }] });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Move finger 25px away (beyond default 10px threshold)
    fireEvent.touchMove(button, { touches: [{ clientX: 125, clientY: 100 }] });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(handleLongPress).not.toHaveBeenCalled();
  });

  it('ignores non-primary mouse clicks (e.g. right click button !== 0)', () => {
    const handleLongPress = jest.fn();
    const { getByTestId } = render(<TestComponent onLongPress={handleLongPress} delay={500} />);
    const button = getByTestId('long-press-button');

    fireEvent.mouseDown(button, { button: 2, clientX: 100, clientY: 100 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(handleLongPress).not.toHaveBeenCalled();
  });

  it('prevents default context menu when long press is triggered', () => {
    const handleLongPress = jest.fn();
    const { getByTestId } = render(<TestComponent onLongPress={handleLongPress} delay={500} />);
    const button = getByTestId('long-press-button');

    fireEvent.pointerDown(button, { button: 0, clientX: 100, clientY: 100 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(handleLongPress).toHaveBeenCalledTimes(1);

    const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    button.dispatchEvent(contextMenuEvent);

    expect(contextMenuEvent.defaultPrevented).toBe(true);
  });
});
