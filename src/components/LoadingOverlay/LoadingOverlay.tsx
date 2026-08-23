import { Loader2 } from 'lucide-react';

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = 'Processing...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs transition-opacity"
    >
      <div className="bg-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 font-sans">
        <Loader2 size={22} className="animate-spin text-primary shrink-0" />
        <span className="text-sm font-semibold text-slate-800">{message}</span>
      </div>
    </div>
  );
}
