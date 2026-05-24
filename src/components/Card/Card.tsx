import type { ICard } from "../../utils/interfaces/ICard";
import { EllipsisVertical } from 'lucide-react';

export function Card (
{   type = 'activity',
    title,
    description,
    imageUrl,
    onButtonClick,
    vertEllipsisIconAction,
} :ICard
){
    return <div className={`h-18 mx-3 flex items-center rounded-lg ${type === 'menu' ? 'shadow-sm' : 'shadow-md '}`} onClick={onButtonClick}>
        <img src={imageUrl} alt="" className={`h-13 w-13 object-center ml-4 mr-2 my-2 ${type === 'activity' ? 'rounded-full' : 'rounded-sm'}`}/>
        <div className="flex-1">
         <p className={`  text-msCardPrimaryText ${type === 'activity' ? 'text-[16px]  font-semibold' : 'text-[14px] font-medium'}`}>{title}</p>   
         <p className={`font-normal ${type === 'activity' ? 'text-[12px] text-msTextPrimary ' : 'text-[10px] text-msCardSecondaryText'}`}>{description}</p>
        </div>
        {vertEllipsisIconAction && type === 'menu' && (
    <button
        type="button"
        aria-label="More options"
        className="p-2 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none"
        onClick={(e) => {
            e.stopPropagation();
            vertEllipsisIconAction();
        }}
    >
        <EllipsisVertical className="w-5 h-5 text-msDeepBlue cursor-pointer" />
    </button>
)}
    </div>
    
}