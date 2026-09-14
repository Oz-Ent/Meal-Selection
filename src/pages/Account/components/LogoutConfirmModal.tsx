import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import { useAuth } from '../../Auth/useAuth/useAuth';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutConfirmModal = ({
  isOpen,
  onClose,
}: LogoutConfirmModalProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      onClose();
      navigate('/login');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center text-center p-2 font-sans">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-light text-danger mb-4 border border-danger/20">
          <LogOut className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-1">
          Sign Out of Account?
        </h3>
        <p className="text-xs text-text-secondary max-w-xs mb-6 leading-relaxed">
          You will be logged out of Edziban on this device. You will need to log back in with your credentials.
        </p>

        <div className="flex w-full gap-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isLoggingOut}
            label="Cancel"
            onClick={onClose}
          />
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-danger hover:bg-danger-hover py-2.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent shrink-0" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
