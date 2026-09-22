import type React from 'react';
import { CircleAlert, ShieldAlert, CheckCircle2, Info, X } from 'lucide-react';

export type BannerVariant = 'none' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

export interface IBannerProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: BannerVariant;
  children?: React.ReactNode;
  className?: string;
  hasCloseButton?: boolean;
  onClose?: () => void;
  active?: boolean;
}

const bannerConfig: Record<
  string,
  {
    icon: React.ReactNode;
    className: string;
  }
> = {
  info: {
    icon: <Info className="h-5 w-5 shrink-0" />,
    className: 'bg-info-light text-info-dark border-info/20',
  },
  danger: {
    icon: <CircleAlert className="h-5 w-5 shrink-0" />,
    className: 'bg-danger-light text-danger-dark border-danger/20',
  },
  warning: {
    icon: <ShieldAlert className="h-5 w-5 shrink-0" />,
    className: 'bg-warning-light text-warning-dark border-warning/20',
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
    className: 'bg-success-light text-success-dark border-success/20',
  },
  primary: {
    icon: <Info className="h-5 w-5 shrink-0" />,
    className: 'bg-primary-light text-primary border-primary/20',
  },
};

export default function InfoBanner({
  children,
  title,
  description,
  icon,
  variant = 'info',
  active = true,
  hasCloseButton = false,
  onClose,
  className = '',
}: IBannerProps) {
  if (!active) return null;

  const currentConfig = variant && bannerConfig[variant] ? bannerConfig[variant] : bannerConfig.info;

  return (
    <div className={`w-full ${className}`}>
      {children ?? (
        <div
          className={[
            'flex items-start gap-3 rounded-2xl p-4 text-xs sm:text-sm border shadow-2xs transition-colors',
            currentConfig.className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="shrink-0 mt-0.5">{icon ?? currentConfig.icon}</span>

          <div className="flex flex-col flex-1 min-w-0">
            {title && <span className="font-bold text-sm leading-snug">{title}</span>}
            {description && (
              <span className="leading-relaxed mt-0.5 text-xs opacity-90">{description}</span>
            )}
          </div>

          {hasCloseButton && (
            <button
              type="button"
              aria-label="Dismiss alert"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}