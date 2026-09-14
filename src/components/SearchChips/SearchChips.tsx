import type React from 'react';

export interface SearchChipsProps {
  children: React.ReactNode;
  className?: string;
}

export function SearchChips({ children, className = '' }: SearchChipsProps) {
  return (
    <div
      className={[
        'flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export default SearchChips;
