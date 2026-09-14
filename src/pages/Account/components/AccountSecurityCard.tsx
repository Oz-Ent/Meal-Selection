import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useChangePasswordMutation } from '../../../api/useApiQueries';
import { Card } from '../../../components/Card/Card';
import PasswordField from '../../../components/PasswordField/PasswordField';
import Button from '../../../components/Button/Button';
import PasswordValidationChecklist from '../../../components/PasswordField/PasswordValidationChecklist';

export const AccountSecurityCard = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const changePasswordMutation = useChangePasswordMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    try {
      const response = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      setSuccessMessage(response.message || 'Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      let msg = 'Failed to change password. Please verify your current password.';
      if (axios.isAxiosError<{ message?: string }>(err)) {
        msg = err.response?.data?.message || err.message || msg;
      } else if (err instanceof Error) {
        msg = err.message || msg;
      }
      setErrorMessage(msg);
    }
  };

  return (
    <Card
      header={{
        title: 'Security & Password',
        subtitle: 'Update your account credentials',
        icon: <Lock className="h-4 w-4" />,
      }}
    >
      <form onSubmit={handleSubmit} className="pt-2 space-y-3.5">
        {/* Error Feedback */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl bg-danger-light p-3 text-xs text-danger-dark border border-danger/20">
            <AlertCircle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Feedback */}
        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-xl bg-success-light p-3 text-xs text-success-dark border border-success/20">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Password */}
        <PasswordField
          id="current-password-input"
          label="Current Password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        {/* New Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <PasswordField
            id="new-password-input"
            label="New Password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <PasswordField
            id="confirm-password-input"
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <PasswordValidationChecklist password={newPassword} collapse={true} />

        <div className="pt-1 flex justify-end">
          <Button
            type="submit"
            disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
            variant="primary"
            pending={changePasswordMutation.isPending}
            icon={<KeyRound className="h-3.5 w-3.5" />}
            label="Change Password"
          />
        </div>
      </form>
    </Card>
  );
};
