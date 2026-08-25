import { LogOut, RefreshCw } from 'lucide-react';
import AppIcon from '../../assets/App Icon.svg';
import { useAuth } from '../../pages/Auth/useAuth/useAuth';
import { LogoutConfirmModal } from '../../pages/Account/components/LogoutConfirmModal';
import { useState, type ReactNode } from 'react';

interface TitleBar{
    isLoading?: boolean;
    extraActions?: ReactNode
    refetchAction?: ()=>void
}
export function TitleBar({ isLoading, extraActions, refetchAction }:TitleBar){
    const { profile } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false)

    return (
        <>
        <LogoutConfirmModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
        />
        
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <img src={AppIcon} alt="App Icon" className="h-8 w-8 object-contain"/>
          <span className="text-base font-bold tracking-tight text-slate-800">
            Hi, {profile?.user.name.split(" ")[0]}
          </span>
        </div>

        <div className="flex flex-row gap-2">
            {extraActions && extraActions}
          { !!refetchAction && 
          <button
            type="button"
            onClick={refetchAction}
            aria-label="Refresh profile"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>}

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-xs font-bold text-rose-700 border border-rose-200/70 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
    </>
)
}