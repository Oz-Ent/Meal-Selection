import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download, RefreshCw } from 'lucide-react';
import { navigateBack } from '../../utils/navigation';
import Button, { type ButtonVariant, type ButtonSize } from '../Button/Button';

export interface INavBarActionButton {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  onRefreshClick?: () => void | Promise<unknown>;
  isRefreshing?: boolean;
  actionButton?: INavBarActionButton;
  rightElement?: ReactNode;
  banner?: ReactNode;
}

export function NavBar({
  backUrl,
  onBackClick,
  title,
  onAddButtonClick,
  onExportClick,
  onRefreshClick,
  isRefreshing,
  actionButton,
  rightElement,
  banner,
}: INavBar) {
  const navigate = useNavigate();
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefreshClick || internalRefreshing) return;
    setInternalRefreshing(true);
    try {
      await Promise.resolve(onRefreshClick());
    } finally {
      setTimeout(() => {
        setInternalRefreshing(false);
      }, 600);
    }
  };

  const isSpinning = Boolean(isRefreshing || internalRefreshing);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    navigateBack(navigate, backUrl ?? '/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full shrink-0 border-b border-border bg-surface/95 backdrop-blur-md font-sans shadow-2xs">
      <div className="relative flex min-h-14 w-full items-center justify-between px-4 sm:px-6 py-2.5">
        <div className="flex items-center z-10">
          <Button
            iconOnly
            icon={<ArrowLeft className="h-5 w-5 stroke-current" />}
            onClick={handleBack}
            aria-label="Back"
            variant="tertiary"
            size="sm"
            className="rounded-xl hover:bg-surface-muted transition-colors"
          />
        </div>

        {title && (
          <div className="absolute inset-x-0 flex items-center justify-center px-14 sm:px-20 pointer-events-none">
            <h1 className="text-base sm:text-lg font-bold text-text-primary truncate text-center tracking-tight">
              {title}
            </h1>
          </div>
        )}

        <div className="flex items-center gap-2 z-10 ml-auto">
          {actionButton && (
            <Button
              label={actionButton.label}
              icon={actionButton.icon}
              onClick={actionButton.onClick}
              variant={actionButton.variant ?? 'primary'}
              size={actionButton.size ?? 'sm'}
              disabled={actionButton.disabled}
              pending={actionButton.pending}
              className={actionButton.className}
            />
          )}

          {onRefreshClick && (
            <Button
              iconOnly
              icon={<RefreshCw className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={isSpinning}
              aria-label="Refresh"
              title="Refresh"
              variant="tertiary"
              size="sm"
            />
          )}

          {!actionButton && rightElement && (
            <div className="flex items-center gap-2">{rightElement}</div>
          )}

          {!actionButton && !rightElement && onAddButtonClick && (
            <Button
              label="Add"
              icon={<Plus className="h-4 w-4 stroke-current" />}
              onClick={onAddButtonClick}
              variant="tertiary"
              size="sm"
            />
          )}

          {!actionButton && !rightElement && !onAddButtonClick && onExportClick && (
            <Button
              label="Export"
              icon={<Download className="h-4 w-4 stroke-current" />}
              onClick={onExportClick}
              variant="tertiary"
              size="sm"
            />
          )}
        </div>
      </div>

      {banner && <div className="w-full">{banner}</div>}
    </nav>
  );
}

export default NavBar;

