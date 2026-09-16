import type React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'outline';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IBadgeProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-light text-primary border border-primary/20',
  secondary: 'bg-secondary-light text-secondary border border-secondary/20',
  success: 'bg-success-light text-success-dark border border-success/20',
  warning: 'bg-warning-light text-warning-dark border border-warning/20',
  danger: 'bg-danger-light text-danger-dark border border-danger/20',
  info: 'bg-info-light text-info-dark border border-info/20',
  neutral: 'bg-surface-muted text-text-secondary border border-border',
  outline: 'bg-transparent text-text-primary border border-border',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-text-muted',
  outline: 'bg-text-secondary',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[10px] gap-1',
  sm: 'px-2.5 py-0.5 text-xs gap-1.5',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-3.5 py-1.5 text-sm gap-2',
};

export default function Badge({
  label,
  children,
  icon,
  variant = 'info',
  size = 'sm',
  dot = false,
  className = '',
}: IBadgeProps) {
  const content = children ?? label;

  return (
    <span
      className={[
        'inline-flex items-center justify-center font-semibold rounded-full select-none shrink-0 transition-colors',
        variantStyles[variant] || variantStyles.info,
        sizeStyles[size] || sizeStyles.sm,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
            dotColors[variant] || dotColors.info
          }`}
        />
      )}
      {icon && <span className="-ml-1.5">{icon}</span>}
      {content && <span className="truncate">{content}</span>}
    </span>
  );
}