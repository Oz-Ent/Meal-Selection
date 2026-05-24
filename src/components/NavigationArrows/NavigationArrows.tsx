import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";

interface INavigationArrowsProps{
    centerContent?: React.ReactNode
    prevDisabled: boolean
    nextDisabled: boolean
    ariaSectionName: string
    onPrevClick: ()=> void
    onNextClick: ()=> void
}
export default function NavigationArrows ({centerContent,ariaSectionName, prevDisabled,nextDisabled, onNextClick, onPrevClick}:INavigationArrowsProps){
    return(
        <section className="flex items-center gap-2 w-fit p-0">
            <button aria-label= {`Previous ${ariaSectionName}`} type="button" className="text-primary disabled:opacity-25 disabled:cursor-not-allowed hover:cursor-pointer" disabled = {prevDisabled} onClick={onPrevClick}><ChevronLeft/></button>
            {!!centerContent && centerContent}
            <button aria-label= {`Next ${ariaSectionName}`} type="button" className="text-primary disabled:opacity-25 disabled:cursor-not-allowed hover:cursor-pointer" disabled ={nextDisabled} onClick={onNextClick}><ChevronRight/></button>
        </section>
    )
}