import { Check, X } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export interface PasswordValidationChecklistProps extends HTMLAttributes<HTMLDivElement> {
  password?: string;
  collapse?: boolean;
}

export function PasswordValidationChecklist({
  password = '',
  className = '',
  collapse = false,
  ...props
}: PasswordValidationChecklistProps) {
  // Pure derived validation status without any useEffect or internal useState
  const lengthOk = password.length >= 6;
  const numberOk = /\d/.test(password);
  const specialCharOk = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const uppercaseOk = /[A-Z]/.test(password);

  const allPassed = lengthOk && numberOk && specialCharOk && uppercaseOk;

  if (collapse && allPassed) {
    return null;
  }

  const criteria = [
    { label: 'At least 6 characters', valid: lengthOk },
    { label: 'At least one number', valid: numberOk },
    { label: 'At least one uppercase letter', valid: uppercaseOk },
    { label: 'At least one special character', valid: specialCharOk },
  ];

  return (
    <div
      className={['py-2 px-1 text-xs transition-all space-y-1.5', className].filter(Boolean).join(' ')}
      {...props}
    >
      <p className="text-text-muted font-medium text-[11px] mb-1">Password requirements:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className={[
              'flex items-center gap-1.5 text-[11px] font-medium transition-colors',
              item.valid ? 'text-success-dark' : 'text-text-muted',
            ].join(' ')}
          >
            <span
              className={[
                'h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px]',
                item.valid ? 'bg-success-light text-success-dark' : 'bg-surface-muted text-text-muted border border-border',
              ].join(' ')}
            >
              {item.valid ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={2.5} />}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordValidationChecklist;
