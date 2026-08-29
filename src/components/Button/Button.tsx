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

interface IButtonProps {
  'aria-label'?: string;
  label?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  pending?: boolean;
  onClick: () => void;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary flex flex-1 rounded-sm p-2 w-full h-full items-center text-white',
  secondary: 'bg-secondary flex flex-1 rounded-sm w-full h-full items-center text-white',
  danger: 'bg-red-600 flex flex-1 rounded-sm items-center w-full h-full text-white',
  ghost: 'bg-transparent flex flex-1 rounded-sm items-center text-gray-700 w-full h-full',
  tertiary: 'bg-gray-200 flex flex-1 rounded-sm items-center text-gray-800 w-full h-full',
  outline:
    'bg-transparent border-2 border-primary flex flex-1 rounded-sm items-center text-primary w-full h-full',
  none: '',
};

export default function Button({
  'aria-label': ariaLabel,
  label,
  icon,
  children,
  variant = 'primary',
  type = 'button',
  disabled,
  pending,
  onClick,
  className,
}: IButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      type={type}
      disabled={disabled || pending}
      onClick={onClick}
      className={` ${variantStyles[variant]} disabled:cursor-not-allowed disabled:opacity-65 hover:cursor-pointer ${className} `}
    >
      {children ? (
        <>{children}</>
      ) : (
        <div className="flex h-full flex-1 items-center justify-center cursor-inherit">
          {pending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full">
                <LoaderCircle className="h-4 w-4 text-current" />
              </div>
              <span>{label ?? ''}</span>
            </div>
          ) : (
            <>
              {icon}
              <span>{label ?? ''}</span>
            </>
          )}
        </div>
      )}
    </button>
  );
}
