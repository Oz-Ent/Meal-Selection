import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import useDropdownPosition from '../../hooks/useDropdownPosition';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function SelectDropdown<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  disabled = false,
  className = '',
  id,
  'aria-label': ariaLabel,
}: SelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { direction, style: positionStyle } = useDropdownPosition(containerRef, isOpen, {
    dropdownRef,
    estimatedHeight: 200,
  });

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
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
  }, [isOpen]);

  const handleSelect = (optValue: T) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const isUp = direction === 'up';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel || placeholder}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-semibold text-text-primary shadow-2xs transition-all hover:border-border-hover focus:border-border-hover focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
          isOpen ? 'border-border-hover ring-1 ring-primary/20' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && (
            <span className="flex shrink-0 items-center justify-center text-text-secondary">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            data-direction={direction}
            style={positionStyle}
            className={`min-w-[45px] rounded-xl border border-border bg-surface p-1 shadow-lg max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ease-out ${
              isUp ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
            }`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'text-primary font-bold'
                      : 'text-text-primary hover:bg-surface-muted'
                  } ${option.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span
                        className={`flex shrink-0 items-center justify-center ${
                          isSelected ? 'text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check size={14} className="shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default SelectDropdown;
