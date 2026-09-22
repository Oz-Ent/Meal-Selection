export interface ICheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  variant?: 'checkbox' | 'toggle' | 'radio';
  color?: 'primary' | 'warning' | 'neutral' | 'amber';
  disabled?: boolean;
  radioSize?: 'sm' | 'md' | 'lg';
}
export const radioColors = {
  primary: 'bg-primary border-primary',
  warning: 'bg-rose-500 border-rose-500',
  neutral: 'bg-surface-elevated border-border-subtle',
  amber: 'bg-amber-500 border-amber-500',
}

export const radioSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}
export default function Checkbox({
  label,
  checked,
  onChange,
  className = '',
  color='primary',
  variant = 'checkbox',
  disabled = false,
  radioSize = 'md',
}: ICheckboxProps) {
  if (variant === 'toggle') {
    return (
      <label
        className={`inline-flex items-center gap-3 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative inline-flex items-center shrink-0">
          <input
            type="checkbox"
            role="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <div
            className={`h-6 w-11 rounded-full transition-colors duration-200 ease-in-out border ${
              checked
                ? 'bg-primary border-primary'
                : 'bg-surface-muted border-border hover:border-border-hover'
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full hover:scale-105 bg-white shadow-xs transform transition-transform duration-200 ease-in-out mt-[1px] ${
                checked ? 'translate-x-[21px]' : 'translate-x-[2px]'
              }`}
            />
          </div>
        </div>
        {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
      </label>
    );
  }
  if (variant === 'radio'){
    return (
      <label
        className={`inline-flex items-center gap-0 text-sm text-text-primary leading-none cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className={`relative ${radioSizes[radioSize]} shrink-0`}>
          <input
            type="checkbox"
            role="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          />
          {/* Unchecked: surface bg + primary border */}
          <div className={`${radioSizes[radioSize]} bg-surface-elevated border-2 border-border-subtle rounded-full peer-checked:hidden transition-colors`} />
          {/* Checked: colored bg + colored border + white tick */}
          <div className={`hidden ${radioSizes[radioSize]} ${radioColors[color]} border-2 rounded-full items-center justify-center peer-checked:flex transition-colors`}>
            <svg
              className={`w-2 h-2 text-white`}
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1.5,6 4.5,9.5 10.5,2.5" />
            </svg>
          </div>
        </div>
        {label && <span>{label}</span>}
      </label>
    );
  }
  return (
    <label
      className={`inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative w-4 h-4 shrink-0">
        <input
          type="checkbox"
          role="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        {/* Unchecked: surface bg + primary border */}
        <div className="w-4 h-4 bg-surface border-2 border-primary rounded-xs peer-checked:hidden transition-colors" />
        {/* Checked: primary bg + primary border + white tick */}
        <div className="hidden w-4 h-4 bg-primary border-2 border-primary rounded-xs items-center justify-center peer-checked:flex transition-colors">
          <svg
            className="w-2.5 h-2.5 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1.5,6 4.5,9.5 10.5,2.5" />
          </svg>
        </div>
      </div>
      {label && <span>{label}</span>}
    </label>
  );
}