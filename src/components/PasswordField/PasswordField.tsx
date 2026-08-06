import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface IPasswordFieldProps {
  label: string;
  id: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PasswordField({ label, id, className, value, onChange }: IPasswordFieldProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isFloating = focused || Boolean(value);

  return (
    <div className="relative h-full w-full">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={`h-full w-full rounded-md border border-gray-300 bg-white px-3 pb-2 pt-5 pr-10 outline-none ${className || ''}`}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-3 transition-all ${
          isFloating ? 'top-1 text-[10px] text-primary' : 'top-2 text-gray-400'
        }`}
      >
        {label}
      </label>
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow((isVisible) => !isVisible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default PasswordField;
