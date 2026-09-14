import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  variant?: 'segmented' | 'pills' | 'underline';
}

export interface TabsOptionsProps {
  children: ReactNode;
  className?: string;
}

export interface TabsOptionProps {
  value: string;
  icon?: ReactNode;
  badge?: number | string;
  count?: number | string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  variant?: 'segmented' | 'pills' | 'underline';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('Tabs.Option must be used inside a Tabs component.');
  }

  return context;
}

function TabsRoot({
  value,
  onChange,
  children,
  className = '',
  variant = 'segmented',
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange, variant }}>
      <div
        className={[
          'flex flex-row w-full p-1 rounded-2xl bg-surface-muted border border-border transition-colors',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function Options({
  children,
  className = '',
}: TabsOptionsProps) {
  return (
    <div
      className={[
        'flex items-center gap-1 overflow-x-auto w-full scrollbar-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

function Option({
  value,
  children,
  icon,
  badge,
  count,
  disabled = false,
  className = '',
}: TabsOptionProps) {
  const { value: selectedValue, onChange } = useTabsContext();
  const isSelected = selectedValue === value;
  const badgeValue = badge !== undefined ? badge : count;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      disabled={disabled}
      aria-selected={isSelected}
      className={[
        'flex-1 rounded-xl px-3 py-2 flex items-center justify-center gap-2',
        'text-xs sm:text-sm font-semibold whitespace-nowrap transition-all select-none',
        'cursor-pointer',
        isSelected
          ? 'bg-surface text-text-primary shadow-xs font-bold'
          : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface/50',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
      {badgeValue !== undefined && (
        <span
          className={[
            'rounded-full px-1.5 py-0.2 text-[10px] font-bold shrink-0',
            isSelected
              ? 'bg-primary-light text-primary'
              : 'bg-surface-muted text-text-muted border border-border',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {badgeValue}
        </span>
      )}
    </button>
  );
}

export const Tabs = Object.assign(TabsRoot, {
  Options,
  Option,
  List: Options,
  Tab: Option,
});

export default Tabs;