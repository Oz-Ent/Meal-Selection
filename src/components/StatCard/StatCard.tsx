import type React from 'react';

export type StatCardIconVariant =
  | 'primary'
  | 'warning'
  | 'danger'
  | 'success'
  | 'info'
  | 'secondary'
  | 'neutral';

export interface IStatCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  value?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconVariant?: StatCardIconVariant;
  iconClassName?: string;
  headerRight?: React.ReactNode;
  progress?: number;
  progressBar?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<StatCardIconVariant, string> = {
  primary: 'bg-primary-light text-primary border-primary/20',
  warning: 'bg-warning-light text-warning border-warning/20',
  danger: 'bg-danger-light text-danger border-danger/20',
  success: 'bg-success-light text-success border-success/20',
  info: 'bg-info-light text-info border-info/20',
  secondary: 'bg-surface-muted text-text-secondary border-border',
  neutral: 'bg-surface-muted text-text-muted border-border/50',
};

export default function StatCard({
  title,
  description,
  value,
  subtitle,
  icon,
  iconVariant = 'primary',
  iconClassName = '',
  headerRight,
  progress,
  progressBar,
  footer,
  children,
  className = '',
  onClick,
}: IStatCardProps) {
  const displayValue = value !== undefined ? value : description;
  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={[
        'flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-2xs transition-all',
        isInteractive ? 'cursor-pointer hover:border-border-hover hover:shadow-xs' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {title && (
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary block truncate">
              {title}
            </span>
          )}
          {displayValue !== undefined && (
            <span className="text-2xl font-bold text-text-primary mt-1 block truncate">
              {displayValue}
            </span>
          )}
        </div>

        {headerRight && <div className="shrink-0">{headerRight}</div>}

        {icon && !headerRight && (
          <div
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ml-2',
              variantStyles[iconVariant] || variantStyles.primary,
              iconClassName,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progressBar
        ? progressBar
        : progress !== undefined && (
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted border border-border/50">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}

      {/* Custom Body / Children */}
      {children}

      {/* Subtitle / Footer */}
      {subtitle && (
        <span className="text-[11px] text-text-muted mt-1 block truncate">
          {subtitle}
        </span>
      )}

      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}