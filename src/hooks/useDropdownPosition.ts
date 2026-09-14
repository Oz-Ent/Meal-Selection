import { useEffect, useState, type CSSProperties, type RefObject } from 'react';

export type DropdownDirection = 'down' | 'up';
export type DropdownAlign = 'left' | 'right' | 'full';

export interface UseDropdownPositionOptions {
  dropdownRef?: RefObject<HTMLElement | null>;
  estimatedHeight?: number;
  offset?: number;
  align?: DropdownAlign;
  matchTriggerWidth?: boolean;
}

export function useDropdownPosition(
  triggerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: UseDropdownPositionOptions = {},
) {
  const { estimatedHeight = 220, offset = 6, align = 'full', matchTriggerWidth } = options;
  const [direction, setDirection] = useState<DropdownDirection>('down');
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const calculatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

      const spaceBelow = viewportHeight - triggerRect.bottom - offset;
      const spaceAbove = triggerRect.top - offset;

      const actualHeight = options.dropdownRef?.current?.offsetHeight || estimatedHeight;

      // If not enough space below, and there is more space above, open upwards
      const isUp = spaceBelow < actualHeight && spaceAbove > spaceBelow;
      setDirection(isUp ? 'up' : 'down');

      const positionStyle: CSSProperties = {
        position: 'fixed',
        zIndex: 9999,
      };

      if (align === 'right') {
        positionStyle.right = `${Math.max(8, viewportWidth - triggerRect.right)}px`;
      } else if (align === 'left') {
        positionStyle.left = `${Math.max(8, triggerRect.left)}px`;
      } else {
        positionStyle.left = `${triggerRect.left}px`;
        positionStyle.width = `${triggerRect.width}px`;
      }

      if (matchTriggerWidth) {
        positionStyle.width = `${triggerRect.width}px`;
      }

      if (isUp) {
        positionStyle.bottom = `${viewportHeight - triggerRect.top + offset}px`;
      } else {
        positionStyle.top = `${triggerRect.bottom + offset}px`;
      }

      const xOrigin = align === 'right' ? 'right' : align === 'left' ? 'left' : 'center';
      const yOrigin = isUp ? 'bottom' : 'top';
      positionStyle.transformOrigin = `${yOrigin} ${xOrigin}`;

      setStyle(positionStyle);
    };

    // Calculate position immediately when opened
    calculatePosition();

    // Recalculate on scroll or resize
    window.addEventListener('resize', calculatePosition, { passive: true });
    window.addEventListener('scroll', calculatePosition, { capture: true, passive: true });

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen, triggerRef, options.dropdownRef, estimatedHeight, offset, align, matchTriggerWidth]);

  return { direction, style };
}

export default useDropdownPosition;
