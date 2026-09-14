import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search meal or user...',
  className = 'w-full',
  inputClassName = '',
  ...rest
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-border bg-surface py-2.5 pl-10 pr-10 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition-colors ${inputClassName}`}
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded-full cursor-pointer transition-colors"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
