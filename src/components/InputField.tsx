interface IInputFieldProps {
  label: string;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
  id: string;
  fontFamily?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function InputField({ label, style, className,placeholder, id, fontFamily, value, onChange }: IInputFieldProps) {
  const inputStyle = {...style, fontFamily };
  const labelStyle = { fontFamily };
  
    return (
    <div className="relative">
      <input
        type="text"
        id={id}
        placeholder={placeholder}
        className={className || "peer block w-full px-2.5 pb-2.5 pt-4 text-sm bg-transparent rounded-md border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300"}
        style = {inputStyle}
        value={value}
        onChange={onChange}
      /> 

      <label 
        htmlFor={id}
        className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2
        peer-focus:text-gray-500
        peer-placeholder-shown:scale-100
        peer-placeholder-shown:-translate-y-1/2
        peer-placeholder-shown:top-1/2
        peer-focus:top-2
        peer-focus:scale-75
        peer-focus:-translate-y-4
        left-2"
        style = {labelStyle}
      >
        {label}
      </label>
    </div>
  );
}

export default InputField;