import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface IPasswordFieldProps {
  label: string;
  id: string;
  style?: React.CSSProperties;
  className?: string;
  fontFamily?: string; 
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}

function PasswordField({ label, id, style, className, fontFamily, value, onChange }: IPasswordFieldProps) {
  const [show, setShow] = useState(false);
  const inputStyle = { ...style, fontFamily };
  const labelStyle = { fontFamily };


  return (
    <div className="relative w-full">

      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder=" "
        className={`peer block w-full px-2.5 pb-2.5 pt-4 text-sm bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300 ${className || ""}`}
        style={inputStyle}
        value={value}
        onChange={onChange}  
      />

      <label
        htmlFor={id}
        className="absolute text-sm text-gray-500 duration-300 transform 
        -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-2
        peer-placeholder-shown:scale-100 
        peer-placeholder-shown:-translate-y-1/2 
        peer-placeholder-shown:top-1/2 
        peer-focus:top-2 
        peer-focus:scale-75 
        peer-focus:-translate-y-4 
        peer-focus:text-gray-500"
        style = {labelStyle}
      >
        {label}
      </label>

      {show ? (
        <EyeOff
          size={18}
          onClick={() => setShow(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
        />
      ) : (
        <Eye
          size={18}
          onClick={() => setShow(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
        />
      )}

    </div>
  );
}

export default PasswordField;