import { useNavigate } from 'react-router-dom';
interface MenuCardProps{
    label?: string
    subtitle?: string
    icon: string
    path?: string
    onClick?: ()=>void
}

export default function MenuCard ({label, subtitle, icon, path, onClick}:MenuCardProps){
    const navigate = useNavigate()
    return(
            <button
              type="button"
              onClick={path ? ()=> navigate(path) : onClick}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-3 sm:p-4 text-left shadow-2xs transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
            >
              <div className="w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                <img
                  src={icon}
                  alt={label}
                  className="h-24 sm:h-28 w-full object-contain"
                />
              </div>
              <div className="mt-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{label}</h3>
                <p className="mt-1 text-[11px] sm:text-xs leading-tight text-slate-500">
                  {subtitle}
                </p>
              </div>
            </button>
    )
}