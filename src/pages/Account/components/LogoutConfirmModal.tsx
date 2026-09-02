import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/Modal/Modal';
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
      <div className="flex flex-col items-center text-center p-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 border border-rose-100">
          <LogOut className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Sign Out of Account?
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
          You will be logged out of Edziban on this device. You will need to log back in with your credentials.
        </p>

        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Signing Out...
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
