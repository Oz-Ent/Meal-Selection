import type React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rowCount?: number;
  rows?: number;
  className?: string;
  itemClassName?: string;
}

export function Skeleton({
  rowCount,
  rows = 3,
  className = '',
  itemClassName = '',
  ...restProps
}: SkeletonProps) {
  const count = rowCount ?? rows;
  const items = Array.from({ length: Math.max(1, count) });

  return (
    <div
      {...restProps}
      className={`flex flex-col gap-3 w-full animate-pulse ${className}`}
      data-testid="skeleton-container"
    >
      {items.map((_, idx) => (
        <div
          key={idx}
          data-testid="skeleton-row"
          className={`flex flex-col gap-2 p-3 rounded-xl border border-border/60 bg-surface/60 ${itemClassName}`}
        >
          {/* Top Rectangle */}
          <div className="h-4 w-3/4 rounded-md bg-slate-200/90 dark:bg-slate-700/90" />
          {/* Bottom Rectangle */}
          <div className="h-3 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-700/60" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
