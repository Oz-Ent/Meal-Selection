import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface IPasswordFieldProps {
  label: string;
  id: string;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
  autoComplete?: string;
  disabled?: boolean;
  toggleAriaLabel?: string;
}

export function PasswordField({
  label,
  id,
  placeholder,
  className = '',
  value = '',
  onChange,
  error,
  errorMessage,
  autoComplete,
  disabled,
  toggleAriaLabel,
}: IPasswordFieldProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isFloating = focused || Boolean(value && value.length > 0) || Boolean(placeholder && placeholder.length > 0);

  const borderClass = error
    ? 'border-danger'
    : focused
    ? 'border-border-hover'
    : 'border-border';

  const defaultToggleLabel = show
    ? `Hide ${label ? label.toLowerCase() : 'password'}`
    : `Show ${label ? label.toLowerCase() : 'password'}`;

  return (
    <div className="w-full">
      <div className="relative h-full w-full">
        <input
          id={id}
          disabled={disabled}
          type={show ? 'text' : 'password'}
          placeholder={isFloating ? placeholder : undefined}
          autoComplete={autoComplete}
          className={`h-full w-full rounded-xl border ${borderClass} bg-surface px-3.5 pb-2 pt-5 pr-10 outline-none focus:outline-none focus:ring-0 text-text-primary text-sm transition-colors placeholder:text-text-muted ${className}`}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-3.5 transition-all select-none ${
            isFloating
              ? `top-1.5 text-[10px] font-semibold `
              : 'top-4 text-xs text-text-muted'
          }`}
        >
          {label}
        </label>
        <button
          type="button"
          aria-label={toggleAriaLabel || defaultToggleLabel}
          onClick={() => setShow((isVisible) => !isVisible)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="text-danger text-xs mt-1 text-left font-medium">
          {errorMessage ?? 'Invalid Password'}
        </p>
      )}
    </div>
  );
}

export default PasswordField;
