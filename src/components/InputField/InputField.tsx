import { useState } from "react";


interface IInputFieldProps{
    disabled?: boolean
    label?: string
    placeholder?: string
    type?: string
    error?: boolean
    errorMessage?: string
    onChange : () => void
    value: any
    min?: number
    max?: number
}

export default function InputField({disabled,label,placeholder,type = 'text', value, error, errorMessage, onChange}:IInputFieldProps){
    const [focused, setFocused] = useState<boolean>(false)
    const isFloating = focused || value.length > 0 || (!!placeholder && placeholder?.length > 0)
    return(
        <div className="relative h-10">
            <input 
            disabled={disabled}
            placeholder={placeholder} 
            type={type} 
            value={value}
            onChange={onChange}
            onFocus={()=>setFocused(true)} 
            onBlur={()=>setFocused(false)}
            className={`w-full h-full border rounded-md px-3 pt-5 pb-2 outline-none 
            ${error ? "border-red-500" : "border-border-grey"}
            `}/>
            <label
            className={`absolute left-3 transition-all pointer-events-none
            ${
                isFloating
                ? "top-1 text-[10px] text-primary"
                : "top-2 text-gray-400"
            }
            `}
        >
        {label}</label>
        <label className="text-text-alert w-full">{errorMessage}</label>
        </div>
    )
}