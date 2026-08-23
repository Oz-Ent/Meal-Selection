import { Link } from 'react-router';
import AppIcon from '../../assets/App Icon.svg';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-app-bg">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-6">
          <img src={AppIcon} alt="Edziban" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-slate-800 tracking-tight">Edziban</span>
        </div>

        <span className="text-6xl font-black text-slate-200 mb-2 font-mono">404</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">404 — Page Not Found</h1>
        <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all text-center"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
