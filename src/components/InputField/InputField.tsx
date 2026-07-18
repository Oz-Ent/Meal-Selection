import  {  useState, useId, type ChangeEvent } from "react";

interface IInputFieldProps{
    disabled?: boolean
    label?: string
    placeholder?: string
    type?: string
    value: string
    error?: boolean
    errorMessage?: string
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    min?: number
    max?: number
    isBorderVisible?: boolean
    className?: string
    multiline?: boolean
}

export default function InputField({disabled,label,placeholder,type = 'text', value, error, errorMessage, onChange,isBorderVisible = true,className,multiline}:IInputFieldProps){
    const [focused, setFocused] = useState<boolean>(false)
    const uniqueId = useId();
    const isFloating = focused || value.length > 0 || (!!placeholder && placeholder?.length > 0)
    
    const inputClasses = `w-full h-full ${!isBorderVisible ? "border-none" : "border rounded-md"} px-3 ${label && "pt-5"} pb-2 outline-none ${className} ${error ? "border-red-500" : "border-gray-300"} ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`

    return(
        <div className="relative h-full">
            {multiline ? (
                <textarea
                    id={uniqueId}
                    disabled={disabled}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={()=>setFocused(true)} 
                    onBlur={()=>setFocused(false)}
                    className={`${inputClasses} resize-none`}
                />
            ) : (
                <input 
                    id={uniqueId}
                    disabled={disabled}
                    placeholder={placeholder} 
                    type={type} 
                    value={value}
                    onChange={onChange}
                    onFocus={()=>setFocused(true)} 
                    onBlur={()=>setFocused(false)}
                    className={inputClasses}
                />
            )}
           <label
            htmlFor={uniqueId}
            className={`absolute left-3 transition-all pointer-events-none
            ${
                isFloating
                ? "top-1 text-[10px] text-primary"
                : "top-2 text-gray-400"
            }
            `}
            
        >
        {label}</label>
        {error && <p className="text-text-alert w-full">{errorMessage}</p>}
        </div>
    )
}