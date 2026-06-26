import { NavBar } from "../../../components/NavBar/NavBar";
import { CalendarDays } from "lucide-react";

export function Report() {
    return (
        <>
        <div className="h-full w-full">
            <NavBar title="Report" backUrl="/admin/activities" onExportClick={() => {}} />
            <div className="w-[90%] h-[40px] border border-gray-300 rounded-lg bg-white m-auto flex items-center" onClick={() => {}}>
                <CalendarDays className=" px-2.5 border-r border-gray-300 h-full w-[40px] bg-gray-100 text-[#7E8299] rounded-l-lg" />
            </div>
        </div>
        </>

    )
}