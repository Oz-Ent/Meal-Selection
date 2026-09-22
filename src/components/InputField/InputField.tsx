import { useState, useId, type ChangeEvent } from 'react';

export interface IInputFieldProps {
  id?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  error?: boolean;
  errorMessage?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  min?: number;
  max?: number;
  isBorderVisible?: boolean;
  className?: string;
  multiline?: boolean;
}

export default function InputField({
  id,
  disabled,
  autoFocus,
  label,
  placeholder,
  type = 'text',
  value,
  error,
  errorMessage,
  onChange,
  isBorderVisible = true,
  className = '',
  multiline,
}: IInputFieldProps) {
  const [focused, setFocused] = useState<boolean>(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const isFloating = focused || Boolean(value && value.length > 0) || Boolean(placeholder && placeholder.length > 0);

  const borderClass = !isBorderVisible
    ? 'border-none'
    : error
    ? 'border-danger border-red-500'
    : focused
    ? 'border-border-hover'
    : 'border-border';

  const bgClass = disabled ? 'bg-surface-muted cursor-not-allowed text-text-muted' : 'bg-surface text-text-primary';

  const inputClasses = `w-full h-full rounded-xl border ${borderClass} px-3.5 ${label ? 'pt-5 pb-1.5' : 'py-3'} text-base sm:text-sm outline-none focus:outline-none focus:ring-0 transition-colors placeholder:text-text-muted ${bgClass} ${className}`;

  return (
    <div className={`relative w-full ${disabled ? 'opacity-65' : ''}`}>
      {multiline ? (
        <textarea
          id={inputId}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={label ? (isFloating ? placeholder : undefined) : placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          id={inputId}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={label ? (isFloating ? placeholder : undefined) : placeholder}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={inputClasses}
        />
      )}
      {label && (
        <label
          htmlFor={inputId}
          className={`absolute left-3.5 transition-all pointer-events-none select-none ${disabled ? 'text-text-secondary' :''} ${
            isFloating
              ? `top-1.5 text-[10px] font-semibold `
              : 'top-4 text-xs text-text-muted'
          }`}
        >
          {label}
        </label>
      )}
      {error && (
        <p className="text-danger text-xs mt-1 text-left font-medium">
          {errorMessage ?? `Invalid ${label || 'input'}`}
        </p>
      )}
    </div>
  );
}