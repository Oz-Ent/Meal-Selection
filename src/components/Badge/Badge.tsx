import type React from 'react';

export type BadgeType = 'solid' | 'outline' | 'hollow';

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
  type?: BadgeType;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const outlineStyles: Record<Exclude<BadgeVariant, 'outline'>, string> = {
  primary:
    'bg-[var(--color-badge-primary-outline-bg)] text-[var(--color-badge-primary-outline-text)] border border-[var(--color-badge-primary-outline-border)]',
  secondary:
    'bg-[var(--color-badge-secondary-outline-bg)] text-[var(--color-badge-secondary-outline-text)] border border-[var(--color-badge-secondary-outline-border)]',
  success:
    'bg-[var(--color-badge-success-outline-bg)] text-[var(--color-badge-success-outline-text)] border border-[var(--color-badge-success-outline-border)]',
  warning:
    'bg-[var(--color-badge-warning-outline-bg)] text-[var(--color-badge-warning-outline-text)] border border-[var(--color-badge-warning-outline-border)]',
  danger:
    'bg-[var(--color-badge-danger-outline-bg)] text-[var(--color-badge-danger-outline-text)] border border-[var(--color-badge-danger-outline-border)]',
  info:
    'bg-[var(--color-badge-info-outline-bg)] text-[var(--color-badge-info-outline-text)] border border-[var(--color-badge-info-outline-border)]',
  neutral:
    'bg-[var(--color-badge-neutral-outline-bg)] text-[var(--color-badge-neutral-outline-text)] border border-[var(--color-badge-neutral-outline-border)]',
};

const solidStyles: Record<Exclude<BadgeVariant, 'outline'>, string> = {
  primary:
    'bg-[var(--color-badge-primary-solid-bg)] text-[var(--color-badge-primary-solid-text)] border border-transparent shadow-2xs',
  secondary:
    'bg-[var(--color-badge-secondary-solid-bg)] text-[var(--color-badge-secondary-solid-text)] border border-transparent shadow-2xs',
  success:
    'bg-[var(--color-badge-success-solid-bg)] text-[var(--color-badge-success-solid-text)] border border-transparent shadow-2xs',
  warning:
    'bg-[var(--color-badge-warning-solid-bg)] text-[var(--color-badge-warning-solid-text)] border border-transparent shadow-2xs',
  danger:
    'bg-[var(--color-badge-danger-solid-bg)] text-[var(--color-badge-danger-solid-text)] border border-transparent shadow-2xs',
  info:
    'bg-[var(--color-badge-info-solid-bg)] text-[var(--color-badge-info-solid-text)] border border-transparent shadow-2xs',
  neutral:
    'bg-[var(--color-badge-neutral-solid-bg)] text-[var(--color-badge-neutral-solid-text)] border border-transparent shadow-2xs',
};

const outlineDotColors: Record<Exclude<BadgeVariant, 'outline'>, string> = {
  primary: 'bg-[var(--color-badge-primary-outline-text)]',
  secondary: 'bg-[var(--color-badge-secondary-outline-text)]',
  success: 'bg-[var(--color-badge-success-outline-text)]',
  warning: 'bg-[var(--color-badge-warning-outline-text)]',
  danger: 'bg-[var(--color-badge-danger-outline-text)]',
  info: 'bg-[var(--color-badge-info-outline-text)]',
  neutral: 'bg-[var(--color-badge-neutral-outline-text)]',
};

const solidDotColors: Record<Exclude<BadgeVariant, 'outline'>, string> = {
  primary: 'bg-white/80',
  secondary: 'bg-white/80',
  success: 'bg-white/80',
  warning: 'bg-white/80',
  danger: 'bg-white/80',
  info: 'bg-white/80',
  neutral: 'bg-white/80',
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
  type = 'outline',
  size = 'sm',
  dot = false,
  className = '',
}: IBadgeProps) {
  const content = children ?? label;

  // Handle legacy variant='outline'
  const isLegacyOutline = variant === 'outline';
  const effectiveVariant: Exclude<BadgeVariant, 'outline'> = isLegacyOutline ? 'neutral' : variant;
  const isSolid = !isLegacyOutline && type === 'solid';

  const styleMap = isSolid ? solidStyles : outlineStyles;
  const dotColorMap = isSolid ? solidDotColors : outlineDotColors;

  return (
    <span
      className={[
        'inline-flex items-center justify-center font-semibold rounded-full select-none shrink-0 transition-colors',
        styleMap[effectiveVariant] || styleMap.info,
        sizeStyles[size] || sizeStyles.sm,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
            dotColorMap[effectiveVariant] || dotColorMap.info
          }`}
        />
      )}
      {icon && <span className="-ml-0.5">{icon}</span>}
      {content && <span className="truncate">{content}</span>}
    </span>
  );
}