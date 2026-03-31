interface ICheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function Checkbox({ label, checked, onChange, className }: ICheckboxProps) {
  return (
    <label className={`flex items-center gap-2 text-sm text-gray-800 cursor-pointer select-none ${className ?? ""}`}>
      <div className="relative w-4 h-4 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)} 
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Unchecked: white bg + blue border */}
        <div className="w-4 h-4 bg-white border-2 border-cyan-700 rounded-sm peer-checked:hidden" />
        {/* Checked: white bg + blue border + blue tick */}
        <div className="hidden w-4 h-4 bg-white border-2 border-cyan-700 rounded-sm items-center justify-center peer-checked:flex">
          <svg
            className="w-2.5 h-2.5 text-sky-900"
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