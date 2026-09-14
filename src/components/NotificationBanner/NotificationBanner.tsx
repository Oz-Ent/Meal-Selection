import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Info,
  Users,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type BannerVariant = 'closed' | 'guest' | 'warning' | 'danger' | 'info' | 'success';

export interface NotificationBannerProps {
  variant?: BannerVariant;
  title?: string;
  description?: string;
  children?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  attached?: boolean;
  className?: string;
  icon?: ReactNode;
}

const variantStyles: Record<
  BannerVariant,
  {
    container: string;
    icon: string;
    DefaultIcon: typeof Info;
  }
> = {
  closed: {
    container: 'bg-banner-closed-bg border-banner-closed-border text-banner-closed-text',
    icon: 'text-banner-closed-text',
    DefaultIcon: Ban,
  },
  guest: {
    container: 'bg-banner-guest-bg border-banner-guest-border text-banner-guest-text',
    icon: 'text-banner-guest-text',
    DefaultIcon: Users,
  },
  warning: {
    container: 'bg-warning-light border-warning-dark/30 text-warning-dark',
    icon: 'text-warning-dark',
    DefaultIcon: AlertTriangle,
  },
  danger: {
    container: 'bg-danger-light border-danger/30 text-danger-dark',
    icon: 'text-danger-dark',
    DefaultIcon: AlertCircle,
  },
  info: {
    container: 'bg-info-light border-info-dark/30 text-info-dark',
    icon: 'text-info-dark',
    DefaultIcon: Info,
  },
  success: {
    container: 'bg-success-light border-success-dark/30 text-success-dark',
    icon: 'text-success-dark',
    DefaultIcon: CheckCircle2,
  },
};

export function NotificationBanner({
  variant = 'info',
  title,
  description,
  children,
  action,
  onClose,
  attached = false,
  className = '',
  icon,
}: NotificationBannerProps) {
  const currentVariant = variantStyles[variant];
  const IconComponent = currentVariant.DefaultIcon;

  return (
    <div
      role="status"
      className={[
        'w-full border-b py-2 px-4 flex items-center justify-between text-xs transition-colors duration-150',
        currentVariant.container,
        attached ? '' : 'rounded-2xl border shadow-2xs my-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="shrink-0">
          {icon || <IconComponent size={16} className={`${currentVariant.icon} shrink-0`} />}
        </span>

        <div className="min-w-0 flex-1">
          {title && <span className="font-semibold">{title}</span>}
          {title && (description || children) && <span className="mx-1 font-normal opacity-80">—</span>}
          {description && <span className="opacity-90">{description}</span>}
          {children}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {action}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss banner"
            className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationBanner;
