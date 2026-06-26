import { NavLink } from "react-router-dom"
import { ArrowLeft, Plus, Download } from "lucide-react"

interface INavBar {
    backUrl?: string;
    title: string;
    onAddButtonClick?: () => void;
    onExportClick?: ()  => void;
}
export function NavBar({ backUrl, title, onAddButtonClick, onExportClick }: INavBar) {
    return (
        <nav className="sticky top-0 z-50 bg-white flex mx-4 my-3 py-1 border-b border-msListBorder items-center justify-center min-h-10">
            <NavLink to={backUrl ?? "/"} className="absolute left-0">
                <ArrowLeft className="text-msDeepBlue"/>
            </NavLink>
            
            <h3 className="text-lg font-medium text-msTextPrimary px-12 text-center truncate max-w-full">
                {title}
            </h3>
            
            {onAddButtonClick && (
                <button onClick={onAddButtonClick} className="absolute right-0 p-1 text-msDeepBlue flex items-center gap-1" type="button">
                    <Plus className="stroke-current h-4 w-4" /> <span className="text-sm font-medium">Add</span>
                </button>
            )}
            {
                onExportClick && (
                    <button onClick={onExportClick} className="absolute right-0 p-1 text-msDeepBlue flex items-center gap-1" type="button">
                        <Download className="stroke-current h-4 w-4" /> <span className="text-sm">Export</span>
                    </button>
                )
            }
        </nav>
    );
}