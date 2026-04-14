import { useEffect,} from "react";
import type { IModal } from "../../utils/interfaces";
import { createPortal } from "react-dom";
import CloseIcon from '@mui/icons-material/Close';

export default function Modal(
    {
        isOpen,
        onClose,
        children,
        variant = 'center',
        showCloseButton = false
    }: IModal
){
    useEffect(()=>{
        const handleEscape =(e: KeyboardEvent)=>{
            if(e.key === 'Escape') onClose();
        }
        if(isOpen){
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = "auto";
        }
    }, [isOpen, onClose])

    if (!isOpen)return null;

    const isCenter = variant === 'center';

    return createPortal(
        <div className={`fixed inset-0 z-1000 flex  ${isCenter ? 'items-start justify-center pt-50 p-4' : 'items-end justify-center bg-black/40'}`} onClick={onClose}>
            <div className={`relative flex flex-col bg-white overflow-hidden ${isCenter ? 'w-fit h-fit max-h-[40vh] max-w-[250px] min-h-[20vh] min-w-[200px] rounded-2xl shadow-xl' : 'max-h-[90vh] w-full rounded-t-3xl pb-[env(safe-area-inset-bottom)] pl-2 pt-0.5'}` }
            onClick={(e)=>e.stopPropagation()}
            >
            {showCloseButton && (
                <button className="absolute right-4 top-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800"
          onClick={onClose} 
          aria-label="Close modal"
        >
           <CloseIcon /> 
        </button>
            )}
               <div className="flex-1 overflow-y-auto p-1.5">
          {children}
           </div>
            </div>
        </div>,
        document.body
    )
}