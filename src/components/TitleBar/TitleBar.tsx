import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../pages/Auth/useAuth/useAuth';

export function TitleBar({ iconColor = "msTextPrimary" }: { iconColor?: string }){
    const { profile, logout } = useAuth();
    const userName = profile?.user?.name ?? "User";

    return (
    <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-medium">Hi {userName},</h2>
        <button 
            onClick={logout}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md transition hover:bg-white/30 translate-y-0.5"
        >
            <LogoutIcon className={`text-${iconColor} w-5 h-5`}/>
        </button>
    </div>)
}