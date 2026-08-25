import { useRef, useCallback, useEffect } from 'react';

export interface UseLongPressOptions {
  delay?: number;
  moveThreshold?: number;
}

export function useLongPress(
  callback: (event: React.SyntheticEvent | MouseEvent | TouchEvent) => void,
  delayOrOptions: number | UseLongPressOptions = 500,
) {
  const delay = typeof delayOrOptions === 'number' ? delayOrOptions : (delayOrOptions.delay ?? 500);
  const moveThreshold = typeof delayOrOptions === 'object' ? (delayOrOptions.moveThreshold ?? 10) : 10;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressActiveRef = useRef<boolean>(false);
  const startCoordinatesRef = useRef<{ x: number; y: number } | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStart = useCallback(
    (event: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
      // Only handle primary click for mouse events (button 0)
      if ('button' in event && typeof event.button === 'number' && event.button !== 0) {
        return;
      }

      clearTimer();
      isLongPressActiveRef.current = false;

      const clientX = 'touches' in event && event.touches.length > 0 ? event.touches[0].clientX : ('clientX' in event ? event.clientX : undefined);
      const clientY = 'touches' in event && event.touches.length > 0 ? event.touches[0].clientY : ('clientY' in event ? event.clientY : undefined);

      if (clientX !== undefined && clientY !== undefined) {
        startCoordinatesRef.current = { x: clientX, y: clientY };
      }

      timerRef.current = setTimeout(() => {
        isLongPressActiveRef.current = true;
        timerRef.current = null;
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(50);
          } catch {
            // ignore if vibration is restricted
          }
        }
        callbackRef.current(event);
      }, delay);
    },
    [clearTimer, delay],
  );

  const handleMove = useCallback(
    (event: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
      if (!timerRef.current || !startCoordinatesRef.current) return;

      const clientX = 'touches' in event && event.touches.length > 0 ? event.touches[0].clientX : ('clientX' in event ? event.clientX : undefined);
      const clientY = 'touches' in event && event.touches.length > 0 ? event.touches[0].clientY : ('clientY' in event ? event.clientY : undefined);

      if (clientX !== undefined && clientY !== undefined) {
        const deltaX = Math.abs(clientX - startCoordinatesRef.current.x);
        const deltaY = Math.abs(clientY - startCoordinatesRef.current.y);

        if (deltaX > moveThreshold || deltaY > moveThreshold) {
          clearTimer();
        }
      }
    },
    [clearTimer, moveThreshold],
  );

  const handleEnd = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handleContextMenu = useCallback((event: React.SyntheticEvent) => {
    if (isLongPressActiveRef.current) {
      event.preventDefault();
    }
  }, []);

  const isLongPress = useCallback(() => {
    const wasLongPress = isLongPressActiveRef.current;
    setTimeout(() => {
      isLongPressActiveRef.current = false;
    }, 100);
    return wasLongPress;
  }, []);

  return {
    onPointerDown: handleStart,
    onPointerUp: handleEnd,
    onPointerMove: handleMove,
    onPointerCancel: handleEnd,
    onPointerLeave: handleEnd,
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onTouchMove: handleMove,
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onContextMenu: handleContextMenu,
    isLongPress,
    start: handleStart,
    clear: handleEnd,
  };
}