interface CardHeader{
    title: string
    subtitle: string
    icon: React.ReactNode
}
interface CardProps{
    header?: CardHeader
    loading?: boolean
    children: React.ReactNode
}
export function Card ({header, loading, children}: CardProps){
    return (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs gap-2 p-4 flex flex-col">
            {header && 
                <div className="flex flex-row gap-4 px-2">
                    <div className='flex justify-center items-center h-full'>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-primary shadow-2xs">
                            {header.icon}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {header.title}
                        </h3>
                        <span
                            className="block truncate text-xs font-semibold text-slate-800 sm:text-sm"
                            title={header.subtitle}
                        >
                            {header.subtitle}
                        </span>
                    </div>
                </div>
            }
            {children}
    </div>
    )
}