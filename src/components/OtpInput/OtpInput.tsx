import { useRef } from "react";

interface IOtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  errorMessage?: string;
  handleRequestOTP?: () => void;
  isPending?: boolean;
  requestLabel?: string;
  requestCooldown?: number;
}

export function OtpInput({ length = 5, value, onChange, hasError = false, errorMessage, handleRequestOTP, isPending, requestCooldown = 0, requestLabel}: IOtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, raw: string) => {
    const char = raw.slice(-1);
    const chars = value.split("");
    chars[index] = char;
    const next = chars.join("").slice(0, length);
    onChange(next);
    if (char && index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (value[index]) {
        const chars = value.split("");
        chars[index] = "";
        onChange(chars.join(""));
      } else if (index > 0) {
        focusInput(index - 1);
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (event.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <>
    <div className={`gap-3 grid grid-cols-${length} w-full`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          maxLength={1}
          value={value[index] ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`max-w-10 h-10 text-center text-lg font-medium rounded-md border focus:outline-none focus:border-msDeepBlue ${
            hasError ? "border-msWarningRed text-msWarningRed" : "border-gray-300 text-msTextPrimary"
          }`}
        />
      ))}
    </div>
    <div className="flex flex-col items-start">
      {!!requestLabel && <button
        type="button"
        onClick={handleRequestOTP}
        disabled={ requestCooldown > 0 || isPending
        }
        className="whitespace-nowrap text-sm font-medium text-primary hover:text-primary-hover hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
      >
        {isPending
          ? 'Sending...'
          : requestCooldown > 0
            ? `Request OTP (${requestCooldown}s)`
            : 'Request OTP'}
      </button>}
    {hasError && <p>{errorMessage ?? "Invalid OTP"}</p>}
    </div>
    </>
  );
}
