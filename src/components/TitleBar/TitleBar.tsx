import LogoutIcon from '@mui/icons-material/Logout';

export function TitleBar (){
    return (
    <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-medium">Hi Eric,</h2>
        <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md transition hover:bg-white/30 translate-y-0.5">
            <LogoutIcon className="text-white w-5 h-5"/>
        </button>
    </div>)
}