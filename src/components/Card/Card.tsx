import type React from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

export interface CardHeader {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export interface CardProps {
  header?: CardHeader;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ header, loading = false, className = '', children }: CardProps) {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xs gap-2 p-4 sm:p-5 flex flex-col transition-colors ${className}`}
    >
      {header && (
        <div className="flex items-center justify-between gap-4 px-1 pb-4">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {header.icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-elevated text-text-secondary shadow-2xs">
                {header.icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              {header.title && (
                <h3 className="block text-lg font-bold text-text-primary">
                  {header.title}
                </h3>
              )}
              {header.subtitle && (
                <span
                  className="block truncate text-xs text-text-muted sm:text-sm"
                  title={header.subtitle}
                >
                  {header.subtitle}
                </span>
              )}
            </div>
          </div>
          {header.action && <div className="shrink-0">{header.action}</div>}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center p-6 text-text-secondary">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default Card;