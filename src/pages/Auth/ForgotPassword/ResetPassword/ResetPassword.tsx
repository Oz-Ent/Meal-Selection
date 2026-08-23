import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResetPasswordImage from '../../../../assets/Reset Password.svg';
import { NavBar } from '../../../../components/NavBar/NavBar';
import PasswordField from '../../../../components/PasswordField/PasswordField';
import Button from '../../../../components/Button/Button';
import { useResetPasswordMutation } from '../../../../api/useApiQueries';

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; token?: string } | undefined;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const resetPasswordMutation = useResetPasswordMutation();

  const isDisabled = password.trim() === '' || confirmPassword.trim() === '' || isLoading;

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!state?.email || !state?.token) {
      setError('Missing reset token or email. Please restart the process.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await resetPasswordMutation.mutateAsync({ email: state.email, password, token: state.token });
      navigate('/forgot-password/success');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-app-bg flex flex-col">
      <NavBar backUrl="/forgot-password/otp" />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <section className="flex flex-col items-center w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center">
          <img className="w-48 h-auto max-h-44 object-contain" src={ResetPasswordImage} alt="Reset Password" />
          <h3 className="text-2xl font-bold text-slate-800 mt-2">Reset Password</h3>
          <p className="text-center text-slate-500 text-sm max-w-xs mt-1 leading-relaxed">
            Set a new password to regain access to your account.
          </p>

          <div className="w-full mt-6 flex flex-col gap-4 text-left">
            <PasswordField
              label="Password"
              id="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
            />
            <PasswordField
              label="Confirm Password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <p className="text-red-500 text-right text-xs">{error}</p>}
          </div>

          <div className="w-full h-12 mt-6">
            <Button
              label={isLoading ? 'Resetting...' : 'Reset Password'}
              variant="primary"
              disabled={isDisabled}
              onClick={handleReset}
              className="rounded-xl text-base font-medium font-['Roboto'] w-full shadow-sm hover:shadow transition-all"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

