import type React from "react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

export type ButtonVariant = 'primary'|'secondary'|'danger'|'ghost'|'tertiary'|'outline' 

interface IButtonProps{
    label?: string
    icon?: React.ReactNode
    children?: React.ReactNode
    variant?: ButtonVariant
    type?: 'submit'|'reset'|'button'
    disabled?: boolean
    pending?: boolean
    onClick: ()=> void
    className?: string

}

const variantStyles : Record<ButtonVariant, string> = {
    primary: "bg-primary flex flex-1 rounded-sm w-full h-full items-center text-white",
    secondary: "bg-secondary flex flex-1 rounded-sm w-full h-full items-center text-white",
    danger: "bg-red-600 flex flex-1 rounded-sm items-center w-full h-full text-white",
    ghost: "bg-transparent flex flex-1 rounded-sm items-center text-gray-700 w-full h-full",
    tertiary: "bg-gray-200 flex flex-1 rounded-sm items-center text-gray-800 w-full h-full",
    outline: "bg-transparent border-2 border-primary flex flex-1 rounded-sm items-center text-primary w-full h-full"
}

export default function Button ({label, icon, children, variant = "primary",type ='button', disabled , pending, onClick, className}:IButtonProps){
    return(
        <button
        type={type}
        disabled={disabled || pending}
        onClick={onClick}
        className={`${className} ${variantStyles[variant]} disabled:cursor-not-allowed disabled:opacity-25 hover:cursor-pointer `}
        >
        {children ?
            (<>
            {children}</>
            ):
            (
            <div className="flex flex-1 justify-center cursor-inherit">{pending ? <LoadingSpinner/> : icon }<label>{label}</label>
            </div>
        )}
        </button>
    )
}