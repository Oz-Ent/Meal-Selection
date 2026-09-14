import type React from 'react';
import { useNavigate } from 'react-router-dom';

interface MenuCardProps {
  label?: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  path?: string;
  onClick?: () => void;
}

export default function MenuCard({ label, subtitle, icon, path, onClick }: MenuCardProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={path ? () => navigate(path) : onClick}
      className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-3 sm:p-4 text-left shadow-2xs transition-all hover:shadow-md hover:border-border-hover/40 focus:outline-none cursor-pointer group"
    >
      <div className="w-full overflow-hidden rounded-xl bg-surface-muted border border-border/50 flex items-center justify-center p-2">
        {typeof icon === 'string' ? (
          <img
            src={icon}
            alt={label}
            className="h-24 sm:h-28 w-full object-contain"
          />
        ) : (
          <div className="h-24 sm:h-28 w-full flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-sm sm:text-base font-bold text-text-primary">
          {label}
        </h3>
        <p className="mt-1 text-[11px] sm:text-xs leading-tight text-text-secondary">
          {subtitle}
        </p>
      </div>
    </button>
  );
}
