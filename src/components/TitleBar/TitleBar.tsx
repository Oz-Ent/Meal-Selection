import { ArrowDownToLine, LogOut, RefreshCw, Share, PlusSquare, X } from 'lucide-react';
import AppIcon from '../../assets/App Icon.svg';
import { LogoutConfirmModal } from '../../pages/Account/components/LogoutConfirmModal';
import { useState, type ReactNode } from 'react';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export interface TitleBarProps {
  isLoading?: boolean;
  extraActions?: ReactNode;
  refetchAction?: () => void;
  banner?: ReactNode;
}

export function TitleBar({ isLoading, extraActions, refetchAction, banner }: TitleBarProps) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [showManualInstallModal, setShowManualInstallModal] = useState<boolean>(false);
  const { isInstalled, promptInstall, browserInfo } = usePwaInstall();
  const isStandalone = isInstalled || browserInfo.isStandalone;
  const isIos = browserInfo.os === 'iOS';

  const handleInstallClick = async () => {
    const outcome = await promptInstall();
    if (outcome === 'guide') {
      setShowManualInstallModal(true);
    }
  };

  return (
    <>
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Manual install guide modal for iOS / non-prompt browsers */}
      <Modal
        isOpen={showManualInstallModal}
        onClose={() => setShowManualInstallModal(false)}
        variant="center"
        showCloseButton={false}
      >
        <div className="relative flex flex-col p-5 font-sans text-text-primary max-w-sm mx-auto h-full gap-4">
          <button
            type="button"
            onClick={() => setShowManualInstallModal(false)}
            aria-label="Close"
            className="absolute right-3 top-3 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <img src={AppIcon} alt="App Icon" className="h-10 w-10 object-contain" />
            <div>
              <h3 className="text-base font-bold text-text-primary">Install Edziban</h3>
              <p className="text-xs text-text-secondary">Install on your device for fast access</p>
            </div>
          </div>

          <div className="space-y-3 bg-surface-muted p-3.5 rounded-xl border border-border text-xs text-text-secondary leading-relaxed">
            {isIos ? (
              <>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">1</span>
                  <span>Tap the <strong className="text-text-primary inline-flex items-center gap-1">Share button <Share size={12} className="inline" /></strong> in Safari's toolbar.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">2</span>
                  <span>Scroll down and tap <strong className="text-text-primary inline-flex items-center gap-1">Add to Home Screen <PlusSquare size={12} className="inline" /></strong>.</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">1</span>
                  <span>Open your browser menu (the three dots in Chrome or Edge).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">2</span>
                  <span>Select <strong className="text-text-primary">Install App</strong> or <strong className="text-text-primary">Add to Home Screen</strong>.</span>
                </div>
              </>
            )}
          </div>

          <Button
          label="Got it"
          onClick={() => setShowManualInstallModal(false)}
          />
        </div>
      </Modal>

      <header className="sticky top-0 z-40 w-full flex flex-col bg-surface/95 backdrop-blur-md border-b border-border shadow-2xs font-sans">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img src={AppIcon} alt="App Icon" className="h-8 w-8 object-contain" />
            <span className="text-base font-bold tracking-tight text-text-primary">
              Edziban
            </span>
          </div>

          <div className="flex flex-row items-center gap-2">
            {/* Install PWA Button - Shown only when not running in standalone mode */}
            {!isStandalone && (
              <button
                type="button"
                onClick={handleInstallClick}
                title="Install Edziban App"
                aria-label="Install App"
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-surface border-b-3 hover:border-b-1 text-primary border border-primary/20 text-xs font-semibold active:scale-95 cursor-pointer "
              >
                <ArrowDownToLine className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {extraActions}
            {!!refetchAction && (
              <Button
              iconOnly
              icon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={refetchAction}
              aria-label="Refresh"
              variant='tertiary'
              size='sm'
              />
            )}

            <Button
              iconOnly
              icon={<LogOut className='w-5 h-5 hover:text-rose-400'/>}
              onClick={() => setIsLogoutModalOpen(true)}
              aria-label="Sign out"
              variant='tertiary'
              size='sm'
            />
          </div>
        </div>

        {banner && <div className="w-full">{banner}</div>}
      </header>
    </>
  );
}

export default TitleBar;
