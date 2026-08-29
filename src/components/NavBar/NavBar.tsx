import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { navigateBack } from '../../utils/navigation';

export interface INavBarActionButton {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'none';
  disabled?: boolean;
  pending?: boolean;
  className?: string;
}

export interface INavBar {
  backUrl?: string;
  onBackClick?: () => void;
  title?: string;
  onAddButtonClick?: () => void;
  onExportClick?: () => void;
  actionButton?: INavBarActionButton;
  rightElement?: ReactNode;
}

export function NavBar({
  backUrl,
  onBackClick,
  title,
  onAddButtonClick,
  onExportClick,
  actionButton,
  rightElement,
}: INavBar) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    navigateBack(navigate, backUrl ?? '/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full shrink-0 border-b border-msListBorder bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 font-sans shadow-2xs">
      <div className="relative flex min-h-7 w-full items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="p-1 text-secondary hover:text-text-primary transition-colors z-10 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 stroke-current" />
        </button>

        {title && (
          <h3 className="absolute inset-x-0 text-center text-base sm:text-lg font-bold text-text-primary px-16 truncate pointer-events-none">
            {title}
          </h3>
        )}

        <div className="flex items-center gap-2 z-10 ml-auto">
          {actionButton && (
            <button
              type="button"
              onClick={actionButton.onClick}
              disabled={actionButton.disabled || actionButton.pending}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                actionButton.className ??
                (actionButton.variant === 'outline'
                  ? 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 shadow-2xs'
                  : 'bg-primary text-white hover:bg-primary-hover disabled:opacity-40 shadow-2xs')
              }`}
            >
              {actionButton.pending ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
              ) : (
                actionButton.icon
              )}
              <span>{actionButton.label}</span>
            </button>
          )}

          {!actionButton && rightElement && (
            <div className="flex items-center">{rightElement}</div>
          )}

          {!actionButton && !rightElement && onAddButtonClick && (
            <button
              onClick={onAddButtonClick}
              className="p-1 text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
              type="button"
            >
              <Plus className="stroke-current h-4 w-4" />{' '}
              <span className="text-sm font-medium">Add</span>
            </button>
          )}

          {!actionButton && !rightElement && !onAddButtonClick && onExportClick && (
            <button
              onClick={onExportClick}
              className="p-1 text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
              type="button"
            >
              <Download className="stroke-current h-4 w-4" /> <span className="text-sm">Export</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

