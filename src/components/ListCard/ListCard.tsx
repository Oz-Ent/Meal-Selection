import type { IListCard } from "../../utils/interfaces";
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function ListCard({
    id,
    title,
    imageUrl,
    selectedValue,
    inputType = "radio",
    onChange,
    isCustomInput,
    customInputValue,
    onCustomInputChange,
    customInputPlaceholder
}: IListCard) {
    const isSelected = selectedValue !== undefined && (Array.isArray(selectedValue) ? (selectedValue as (string | number)[]).includes(id) : selectedValue === id);
    return (<label className={`relative flex items-center gap-3 px-2 py-3 cursor-pointer transition-colors duration-150 border-b border-msListBorder ${isSelected ? 'bg-gray-50':'bg-white hover:bg-gray-50'} `}>
        {inputType === "radio" && <input type="radio" name="list-card" value={id} checked={isSelected} onChange={(e) => onChange?.(e.target.value)} className="w-5 h-5 shrink-0 accent-msDeepBlue cursor-pointer"/> }
        
        {!isCustomInput && imageUrl && <img className="w-14 h-14 shrink-0 rounded-xl object-cover bg-gray-100" src={imageUrl} alt={title}/>}
        {!isCustomInput && <span className={` flex-1 pr-8 text-base text-msTextPrimary leading-snug ${isSelected ? 'font-semibold' : ''}`}>{title}</span>}
        
        {isCustomInput && (
            <div className="flex-1 pr-1">
                <input
                    type="text"
                    placeholder={customInputPlaceholder}
                    value={customInputValue}
                    onChange={(e) => onCustomInputChange?.(e.target.value)}
                    onClick={() => onChange?.(id.toString())}
                    className="w-full bg-transparent outline-none text-sm text-msTextPrimary placeholder-gray-400 border border-gray-300 rounded-md p-3 focus:border-msDeepBlue transition-colors shadow-sm"
                />
            </div>
        )}

        {inputType === "checkbox" && <input type="checkbox" name="list-card" value={id} checked={isSelected} onChange={(e) => onChange?.(e.target.value)} className="w-4.5 h-4.5 absolute right-6 shrink-0 accent-msDeepBlue cursor-pointer"/> }
        {inputType === "delete" && <button onClick={(e) => { e.preventDefault(); onChange?.(id.toString()); }} className="w-4.5 h-4.5 absolute right-6 shrink-0 accent-msDeepBlue cursor-pointer text-red-600"><DeleteIcon/></button> }
        {inputType === "expand" && <button type="button" onClick={(e) => { e.preventDefault(); onChange?.(id.toString()); }} className="w-5 h-5 absolute right-6 shrink-0 accent-msDeepBlue cursor-pointer text-gray-400">
            <KeyboardArrowDownIcon className={`transition-transform duration-300 ${isSelected ? '-rotate-180' : 'rotate-0'}`}/>
        </button> }
    </label>);
}
