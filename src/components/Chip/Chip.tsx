import type React from 'react';
import { X } from 'lucide-react';

export type ChipVariant = 'default' | 'filter' | 'search' | 'status' | 'outline';
export type ChipSize = 'sm' | 'md';

export interface IChipProps {
  label: React.ReactNode;
  selected?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
  count?: number | string;
  badge?: number | string;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export default function Chip({
  label,
  selected = false,
  active,
  icon,
  count,
  badge,
  removable = false,
  onRemove,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}: IChipProps) {
  const isSelected = active !== undefined ? active : selected;
  const badgeValue = badge !== undefined ? badge : count;
  const isInteractive = Boolean(onClick);

  const sizeClasses: Record<ChipSize, string> = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 min-h-7',
    md: 'px-3 py-1.5 text-xs sm:text-sm gap-2 min-h-8',
  };

  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-xl border transition-all select-none shrink-0',
    sizeClasses[size],
    isInteractive && !disabled && 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
    disabled && 'opacity-50 cursor-not-allowed',
  ];

  let variantClass = '';
  if (isSelected) {
    variantClass =
      variant === 'outline'
        ? 'border-primary bg-primary-light text-primary font-semibold'
        : 'bg-primary border-primary text-white font-semibold shadow-2xs';
  } else {
    variantClass =
      variant === 'outline'
        ? 'border-border bg-transparent text-text-secondary hover:border-border-hover hover:text-text-primary'
        : 'bg-surface-elevated border-border text-text-secondary hover:bg-surface-muted hover:text-text-primary';
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      aria-label={ariaLabel}
      aria-pressed={isInteractive ? isSelected : undefined}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={[...baseClasses, variantClass, className].filter(Boolean).join(' ')}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="truncate">{label}</span>

      {badgeValue !== undefined && (
        <span
          className={[
            'rounded-full px-1.5 py-0.2 text-[10px] font-bold shrink-0',
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-surface-muted text-text-secondary border border-border',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {badgeValue}
        </span>
      )}

      {(removable || onRemove) && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={[
            'p-0.5 rounded-full hover:bg-black/10 transition-colors shrink-0 cursor-pointer',
            isSelected ? 'text-white hover:bg-white/20' : 'text-text-muted hover:text-text-primary',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
