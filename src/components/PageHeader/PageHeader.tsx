import type React from 'react';

export interface IPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  action,
  className = '',
}: IPageHeaderProps) {
  return (
    <div
      className={[
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}