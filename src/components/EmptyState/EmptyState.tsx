import type React from 'react';
import Button from '../Button/Button';

export interface IEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  active?: boolean;
  buttonLabel?: string;
  buttonAction?: () => void;
  buttonIcon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  active = true,
  buttonLabel,
  buttonAction,
  buttonIcon,
  className = '',
}: IEmptyStateProps) {
  if (!active) return null;

  return (
    <div
      className={[
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-elevated/80 py-8 px-4 text-center transition-colors',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-text-secondary border border-border">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-text-secondary max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {buttonLabel && buttonAction && (
        <div className="mt-4">
          <Button
            size="sm"
            variant='tertiary'
            label={buttonLabel}
            icon={buttonIcon}
            onClick={buttonAction}
          />
        </div>
      )}
    </div>
  );
}