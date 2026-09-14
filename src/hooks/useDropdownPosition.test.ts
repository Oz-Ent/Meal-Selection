import { renderHook, act } from '@testing-library/react';
import { useDropdownPosition } from './useDropdownPosition';

describe('useDropdownPosition', () => {
  let triggerElement: HTMLDivElement;

  beforeEach(() => {
    triggerElement = document.createElement('div');
    document.body.appendChild(triggerElement);
  });

  afterEach(() => {
    document.body.removeChild(triggerElement);
    jest.restoreAllMocks();
  });

  it('defaults to down when there is plenty of space below', () => {
    // Mock viewport height
    window.innerHeight = 1000;

    // Mock getBoundingClientRect near the top
    jest.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 0,
      right: 100,
      width: 100,
      height: 40,
      x: 0,
      y: 100,
      toJSON: () => {},
    });

    const triggerRef = { current: triggerElement };
    const { result } = renderHook(() => useDropdownPosition(triggerRef, true));

    expect(result.current.direction).toBe('down');
    expect(result.current.style.transformOrigin).toBe('top center');
  });

  it('switches to up when at the bottom of the viewport with insufficient space below', () => {
    // Viewport height of 600px
    window.innerHeight = 600;

    // Trigger is located near the bottom: top 520, bottom 560 (only 40px remaining below)
    jest.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue({
      top: 520,
      bottom: 560,
      left: 0,
      right: 100,
      width: 100,
      height: 40,
      x: 0,
      y: 520,
      toJSON: () => {},
    });

    const triggerRef = { current: triggerElement };
    const { result } = renderHook(() =>
      useDropdownPosition(triggerRef, true, { estimatedHeight: 200 })
    );

    expect(result.current.direction).toBe('up');
    expect(result.current.style.transformOrigin).toBe('bottom center');
  });

  it('sets correct horizontal transform origin when align is left or right', () => {
    window.innerHeight = 1000;
    jest.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 100,
      right: 200,
      width: 100,
      height: 40,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    const triggerRef = { current: triggerElement };
    const { result: rightAlign } = renderHook(() =>
      useDropdownPosition(triggerRef, true, { align: 'right' })
    );
    expect(rightAlign.current.style.transformOrigin).toBe('top right');

    const { result: leftAlign } = renderHook(() =>
      useDropdownPosition(triggerRef, true, { align: 'left' })
    );
    expect(leftAlign.current.style.transformOrigin).toBe('top left');
  });

  it('recalculates position on window resize and scroll events', () => {
    window.innerHeight = 1000;
    const getBoundingClientRectMock = jest
      .spyOn(triggerElement, 'getBoundingClientRect')
      .mockReturnValue({
        top: 100,
        bottom: 140,
        left: 0,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: 100,
        toJSON: () => {},
      });

    const triggerRef = { current: triggerElement };
    const { result } = renderHook(() => useDropdownPosition(triggerRef, true));

    expect(result.current.direction).toBe('down');

    // Simulate scrolling / moving element near the bottom
    getBoundingClientRectMock.mockReturnValue({
      top: 900,
      bottom: 940,
      left: 0,
      right: 100,
      width: 100,
      height: 40,
      x: 0,
      y: 900,
      toJSON: () => {},
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.direction).toBe('up');
  });
});
