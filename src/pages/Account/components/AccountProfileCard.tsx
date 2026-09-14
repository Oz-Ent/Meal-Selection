import {
  User,
  Mail,
  Calendar,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type {
  UpdateUserRequest,
  UserProfileResponse,
} from '../../../api/Services/UserServices';

import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/InputField/InputField';

import { useUpdateUserProfileMutation } from '../../../api/useApiQueries';
import { validateEmail } from '../../../helpers/emailValidation';
import { getErrorMessage } from '../../../helpers/errorMessageHelper';

interface AccountProfileCardProps {
  profile: UserProfileResponse;
}

interface DetailContainterProps{
  header: string
  value: string
  icon: React.ReactNode
}
function DetailContainer({header, value, icon}: DetailContainterProps){
  return(
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary shadow-2xs">
              {icon}
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                {header}
              </span>

              <span
                className="block truncate text-xs font-semibold text-text-primary sm:text-sm"
                title={value}
              >
                {value}
              </span>
            </div>
          </div>
  )
}
export const AccountProfileCard = ({
  profile,
}: AccountProfileCardProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [form, setForm] = useState<UpdateUserRequest>({
    email: profile.email ?? '',
    name: profile.name,
  });

  const userUpdateMutation = useUpdateUserProfileMutation();

  const emailValidation = useMemo(() => {
    return validateEmail(form.email);
  }, [form.email]);

  const isFormValid = emailValidation.isValid;

  const handleOpenEdit = () => {
    setForm({
      email: profile.email ?? '',
      name: profile.name,
    });
    setIsTouched(false);
    setApiError(null);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    if (userUpdateMutation.isPending) return;

    setEditModalOpen(false);
  };

  const handleProfileUpdate = async () => {
    setIsTouched(true);
    if (!isFormValid || userUpdateMutation.isPending) return;

    try {
      setApiError(null);
      await userUpdateMutation.mutateAsync({
        id: profile.id,
        data: {
          ...form,
          email: form.email?.trim() ?? '',
        },
      });

      setEditModalOpen(false);
    } catch (error: unknown) {
      setApiError(
        getErrorMessage(
          error,
          'Failed to update email address. Please try again.'
        )
      );
    }
  };

  const initials = profile.name
    ? profile.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-colors">
      {/* Contained Header Banner with Gradient */}
      <div className="h-28 sm:h-36 w-full bg-gradient-to-br from-primary via-primary-hover to-secondary" />

      {/* Profile Header (Avatar, Edit Button, Name & Email) */}
      <div className="px-4 sm:px-6 pt-0 pb-4">
        {/* Top Row: Avatar overlapping the banner + Edit Profile Button on the right */}
        <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
          {/* Circular Avatar with surface border and initials */}
          <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-xl border-4 border-surface bg-primary text-xl sm:text-2xl font-black text-white shadow-md select-none">
            {initials}
          </div>

          {/* Edit Profile Button on the right */}
          <Button
            aria-label="Edit Profile"
            label="Edit profile"
            variant="outline"
            size="sm"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={handleOpenEdit}
            className="rounded-xl font-semibold shadow-2xs hover:bg-surface-muted cursor-pointer"
          />
        </div>

        {/* User Identity: Name & Email */}
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
            {profile.name}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-text-muted">
            {profile.email || profile.referenceEmail}
          </p>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="bg-surface p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {/* Reference Email */}
          <DetailContainer
            header="Work / Reference Email"
            value={profile.referenceEmail || ''}
            icon={<Mail className="h-4 w-4" />}
          />
          <DetailContainer
            header="Primary Account Email"
            value={profile.email || ''}
            icon={<User className="h-4 w-4" />}
          />
          {/* Account Email */}
          <DetailContainer
            header="Role"
            value={profile.roleName.split('.')[0].charAt(0).toUpperCase() + profile.roleName.split('.')[0].slice(1)}
            icon={<User className="h-4 w-4" />}
          />
          <DetailContainer
          header="Member Since"
          value={memberSince || 'Active Member'}
          icon={<Calendar className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={handleCloseEdit}
      >
        <div className="flex flex-col gap-6 p-4">
          {/* Modal Header */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Edit Account Details
            </h2>

            <p className="text-xs text-text-secondary">
              Update your account email address.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <InputField
              label="Name"
              value={form.name ?? ''}
              disabled
              onChange={() => {}}
            />

            <div>
              <InputField
                label="Email"
                type="email"
                placeholder="e.g. name@domain.com"
                value={form.email ?? ''}
                error={isTouched && !emailValidation.isValid}
                errorMessage={emailValidation.error}
                onChange={(e) => {
                  setIsTouched(true);
                  setApiError(null);
                  setForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                }}
              />

              {emailValidation.suggestion && (
                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-warning/30 bg-warning-light px-2.5 py-1.5 text-xs text-warning-dark">
                  <span>
                    Did you mean <strong>{emailValidation.suggestion}</strong>?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        email: emailValidation.suggestion,
                      }));
                      setIsTouched(true);
                    }}
                    className="ml-2 font-semibold text-warning-dark underline hover:opacity-80 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}

              {isTouched && emailValidation.isValid && !emailValidation.suggestion && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Valid email address ready for notifications</span>
                </div>
              )}
            </div>

            {apiError && (
              <p className="rounded-lg border border-danger/30 bg-danger-light p-2.5 text-xs text-danger">
                {apiError}
              </p>
            )}

            <Button
              label={userUpdateMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
              pending={userUpdateMutation.isPending}
              disabled={!isFormValid || userUpdateMutation.isPending}
              onClick={handleProfileUpdate}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountProfileCard;