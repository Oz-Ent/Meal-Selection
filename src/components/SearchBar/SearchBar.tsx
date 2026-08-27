import type { ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
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
  className = 'mb-4 w-full',
  inputClassName = '',
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs transition-colors ${inputClassName}`}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
