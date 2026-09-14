import type React from 'react';
import { LoaderCircle } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'tertiary'
  | 'outline'
  | 'none';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label'?: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  pending?: boolean;
  fullWidth?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-2xs font-semibold',
  secondary: 'bg-secondary hover:bg-secondary-hover text-white shadow-2xs font-semibold',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs font-semibold',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-muted font-medium',
  tertiary: 'bg-surface-muted text-text-primary hover:bg-surface font-medium border border-border',
  outline:
    'bg-transparent border border-border text-text-primary hover:bg-surface-muted font-semibold shadow-2xs',
  none: '',
};

const iconOnlyVariantStyles: Record<ButtonVariant, string> = {
  primary: 'text-primary hover:text-primary-hover',
  secondary: 'text-secondary hover:text-secondary-hover',
  danger: 'text-rose-600 hover:text-rose-700',
  ghost: 'text-text-secondary hover:text-text-primary',
  tertiary: 'text-text-muted hover:text-text-primary',
  outline: 'text-text-primary hover:text-primary',
  none: '',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'py-1 px-2.5 text-xs rounded-lg gap-1.5',
  sm: 'py-1.5 px-3 text-xs rounded-xl gap-1.5',
  md: 'py-3 px-4.5 text-sm rounded-xl gap-2',
  lg: 'py-3.5 px-5 text-base rounded-2xl gap-2.5',
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: 'p-1 rounded-lg',
  sm: 'p-1.5 rounded-xl',
  md: 'p-2 rounded-xl',
  lg: 'p-2.5 rounded-2xl',
};

export default function Button({
  'aria-label': ariaLabel,
  label,
  icon,
  iconOnly = false,
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth,
  disabled,
  pending,
  onClick,
  className = '',
  ...restProps
}: IButtonProps) {
  const baseClasses =
    variant === 'none'
      ? ''
      : iconOnly
        ? 'inline-flex items-center justify-center transition-all cursor-pointer select-none hover:scale-105 active:scale-95'
        : 'inline-flex items-center justify-center transition-all cursor-pointer select-none active:scale-[0.98]';

  const sizeClass =
    variant === 'none'
      ? ''
      : iconOnly
        ? iconOnlySizeStyles[size] || iconOnlySizeStyles.md
        : sizeStyles[size] || sizeStyles.md;

  const variantClass =
    iconOnly
      ? iconOnlyVariantStyles[variant] || iconOnlyVariantStyles.primary
      : variantStyles[variant] || variantStyles.primary;

  return (
    <button
      {...restProps}
      aria-label={ariaLabel || (iconOnly && typeof label === 'string' ? label : undefined)}
      title={restProps.title || (iconOnly && typeof label === 'string' ? label : undefined)}
      type={type}
      disabled={disabled || pending}
      onClick={onClick}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${fullWidth ? 'w-full' : ''} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children ? (
        <>{children}</>
      ) : iconOnly ? (
        pending ? (
          <div className="animate-spin rounded-full">
            <LoaderCircle className="h-4 w-4 text-current" />
          </div>
        ) : (
          (icon ?? null)
        )
      ) : (
        <div className="flex items-center justify-center gap-2 cursor-inherit">
          {pending ? (
            <>
              <div className="animate-spin rounded-full">
                <LoaderCircle className="h-4 w-4 text-current" />
              </div>
              {label && <span>{label}</span>}
            </>
          ) : (
            <>
              {icon}
              {label && <span>{label}</span>}
            </>
          )}
        </div>
      )}
    </button>
  );
}
