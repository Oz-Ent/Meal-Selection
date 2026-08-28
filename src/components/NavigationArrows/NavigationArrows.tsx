import  { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import Button from "../Button/Button";

interface INavigationArrowsProps{
    centerContent?: React.ReactNode
    prevDisabled?: boolean
    nextDisabled?: boolean
    ariaSectionName: string
    onPrevClick: ()=> void
    onNextClick: ()=> void
}
export default function NavigationArrows ({centerContent,ariaSectionName, prevDisabled = false,nextDisabled = false, onNextClick, onPrevClick}:INavigationArrowsProps){
    return(
        <section className="flex items-center gap-2 w-fit p-0">
            <Button variant="none" aria-label= {`Previous ${ariaSectionName}`} type="button" className="bg-transparent p-0 border-none text-primary disabled:opacity-25 disabled:cursor-not-allowed hover:cursor-pointer" disabled = {prevDisabled} onClick={onPrevClick}><ChevronLeft/></Button>
            {!!centerContent && centerContent}
            <Button variant="none" aria-label= {`Next ${ariaSectionName}`} type="button" className="bg-transparent p-0 border-none text-primary disabled:opacity-25 disabled:cursor-not-allowed hover:cursor-pointer" disabled ={nextDisabled} onClick={onNextClick}><ChevronRight/></Button>
        </section>
    )
}