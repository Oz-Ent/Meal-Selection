import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  Children,
  isValidElement,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';
import useDropdownPosition, { type DropdownAlign } from '../../hooks/useDropdownPosition';

interface ActionMenuContextType {
  isOpen: boolean;
  close: () => void;
  open: () => void;
  toggle: () => void;
}

const ActionMenuContext = createContext<ActionMenuContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useActionMenu = () => {
  const context = useContext(ActionMenuContext);
  if (!context) {
    throw new Error('ActionMenu subcomponents must be used within an ActionMenu.');
  }
  return context;
};

/* -------------------------------------------------------------------------- */
/*                               ActionMenu.Item                              */
/* -------------------------------------------------------------------------- */

export interface ActionMenuItemProps {
  children?: ReactNode;
  label?: string;
  icon?: ReactNode;
  onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  divider?: boolean;
  className?: string;
  closeOnClick?: boolean;
}

export function ActionMenuItem({
  children,
  label,
  icon,
  onClick,
  variant = 'default',
  disabled = false,
  divider = false,
  className = '',
  closeOnClick = true,
}: ActionMenuItemProps) {
  const { close } = useActionMenu();

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled) return;
    if (closeOnClick) {
      close();
    }
    onClick?.(e);
  };

  const isDanger = variant === 'danger';

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer rounded-xl ${
        divider ? 'border-t border-border/60 rounded-t-none' : ''
      } ${
        isDanger
          ? 'text-danger hover:bg-danger/10 active:bg-danger/15'
          : 'text-text-primary hover:bg-surface-muted active:bg-surface-muted/80'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    >
      {icon && (
        <span
          className={`shrink-0 flex items-center justify-center ${
            isDanger ? 'text-danger' : 'text-text-secondary'
          }`}
        >
          {icon}
        </span>
      )}
      <span className="truncate">{children || label}</span>
    </button>
  );
}

ActionMenuItem.displayName = 'ActionMenuItem';

/* -------------------------------------------------------------------------- */
/*                              ActionMenu.Divider                            */
/* -------------------------------------------------------------------------- */

export function ActionMenuDivider({ className = '' }: { className?: string }) {
  return <div className={`my-1 border-t border-border/60 ${className}`} role="separator" />;
}

ActionMenuDivider.displayName = 'ActionMenuDivider';

/* -------------------------------------------------------------------------- */
/*                              ActionMenu.Trigger                            */
/* -------------------------------------------------------------------------- */

export interface ActionMenuTriggerProps {
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function ActionMenuTrigger({
  children,
  className = '',
  ariaLabel = 'Open options menu',
}: ActionMenuTriggerProps) {
  const { toggle, isOpen } = useActionMenu();

  if (children) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }
        }}
        className={`inline-flex items-center cursor-pointer ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={`p-1.5 rounded-xl text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer ${className}`}
    >
      <MoreVertical size={18} />
    </button>
  );
}

ActionMenuTrigger.displayName = 'ActionMenuTrigger';

/* -------------------------------------------------------------------------- */
/*                               ActionMenuRoot                               */
/* -------------------------------------------------------------------------- */

export interface ActionMenuDataOption {
  key?: string | number;
  label: string;
  icon?: ReactNode;
  onClick?: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  divider?: boolean;
  className?: string;
}

export interface ActionMenuProps {
  children?: ReactNode;
  items?: ActionMenuDataOption[];
  trigger?: ReactNode;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  align?: DropdownAlign;
  menuWidth?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

function ActionMenuRoot({
  children,
  items,
  trigger,
  triggerAriaLabel,
  triggerClassName,
  align = 'right',
  menuWidth = 'w-52',
  className = '',
  onOpenChange,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { direction, style: positionStyle } = useDropdownPosition(containerRef, isOpen, {
    dropdownRef,
    estimatedHeight: 200,
    align,
  });

  const open = useCallback(() => {
    setIsOpen(true);
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = useCallback(() => {
    setIsOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  const isUp = direction === 'up';

  // Separate custom trigger from children if provided as <ActionMenu.Trigger>
  let customTriggerChild: ReactNode = null;
  const menuContentChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type === ActionMenuTrigger ||
        (child.type as { displayName?: string })?.displayName === 'ActionMenuTrigger')
    ) {
      customTriggerChild = child;
    } else {
      menuContentChildren.push(child);
    }
  });

  return (
    <ActionMenuContext.Provider value={{ isOpen, close, open, toggle }}>
      <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
        {/* Render Trigger */}
        {trigger ? (
          <div
            role="button"
            tabIndex={0}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label={triggerAriaLabel || 'Open options menu'}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            className="cursor-pointer inline-flex"
          >
            {trigger}
          </div>
        ) : customTriggerChild ? (
          customTriggerChild
        ) : (
          <ActionMenuTrigger ariaLabel={triggerAriaLabel} className={triggerClassName} />
        )}

        {/* Portaled Dropdown Popover */}
        {isOpen &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={dropdownRef}
              role="menu"
              data-direction={direction}
              style={positionStyle}
              onClick={(e) => e.stopPropagation()}
              className={`${menuWidth} rounded-2xl border border-border bg-surface p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 ease-out ${
                isUp ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
              }`}
            >
              {items
                ? items.map((item, idx) => (
                    <ActionMenuItem
                      key={item.key ?? idx}
                      label={item.label}
                      icon={item.icon}
                      onClick={item.onClick}
                      variant={item.variant}
                      disabled={item.disabled}
                      divider={item.divider}
                      className={item.className}
                    />
                  ))
                : menuContentChildren}
            </div>,
            document.body,
          )}
      </div>
    </ActionMenuContext.Provider>
  );
}

export const ActionMenu = Object.assign(ActionMenuRoot, {
  Item: ActionMenuItem,
  Trigger: ActionMenuTrigger,
  Divider: ActionMenuDivider,
});

export default ActionMenu;
