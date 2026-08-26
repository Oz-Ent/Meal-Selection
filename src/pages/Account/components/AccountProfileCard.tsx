import {
  User,
  Mail,
  Briefcase,
  Hash,
  Calendar,
  Pencil,
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
import { EMAIL_REGEX } from '../../../helpers/regex';

interface AccountProfileCardProps {
  profile: UserProfileResponse;
}

export const AccountProfileCard = ({
  profile,
}: AccountProfileCardProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [form, setForm] = useState<UpdateUserRequest>({
    email: profile.email ?? '',
    name: profile.name,
  });

  const userUpdateMutation = useUpdateUserProfileMutation();

  const isEmailValid = useMemo(() => {
    const email = form.email?.trim();

    return !!email && EMAIL_REGEX.test(email);
  }, [form.email]);

  const isFormValid = isEmailValid;

  const handleOpenEdit = () => {
    setForm({
      email: profile.email ?? '',
      name: profile.name,
    });

    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    if (userUpdateMutation.isPending) return;

    setEditModalOpen(false);
  };

  const handleProfileUpdate = async () => {
    if (!isFormValid || userUpdateMutation.isPending) return;

    try {
      await userUpdateMutation.mutateAsync({
        id: profile.id,
        data: {
          ...form,
          email: form.email?.trim() ?? '',
        },
      });

      setEditModalOpen(false);
    } catch (error) {
      // Mutation error can be handled by your mutation/toast layer
      console.error('Failed to update profile:', error);
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
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary via-primary-hover to-secondary p-5 text-white sm:p-6">

        {/* User Identity */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-white text-xl font-black text-primary shadow-md sm:h-18 sm:w-18 sm:text-2xl">
            {initials}
          </div>

          {/* Name & Role */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-bold tracking-tight text-white sm:text-2xl">
                {profile.name}
              </h2>

              <Button
                variant="none"
                icon={
                  <Pencil className="h-4 w-4 shrink-0 text-emerald-300 sm:h-5 sm:w-5" />
                }
                onClick={handleOpenEdit}
              />
            </div>

            <p className="truncate text-xs font-medium text-emerald-100/90 sm:text-sm">
              {profile.referenceEmail}
            </p>

            <div className="mt-1">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                <Briefcase className="h-3 w-3 text-emerald-200" />
                {profile.roleName || 'Employee'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="bg-white p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {/* Reference Email */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-primary shadow-2xs">
              <Mail className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Work / Reference Email
              </span>

              <span
                className="block truncate text-xs font-semibold text-slate-800 sm:text-sm"
                title={profile.referenceEmail}
              >
                {profile.referenceEmail}
              </span>
            </div>
          </div>

          {/* Account Email */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-primary shadow-2xs">
              <User className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Primary Account Email
              </span>

              <span
                className="block truncate text-xs font-semibold text-slate-800 sm:text-sm"
                title={profile.email || profile.referenceEmail}
              >
                {profile.email || profile.referenceEmail}
              </span>
            </div>
          </div>

          {/* Reference ID */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-primary shadow-2xs">
              <Hash className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Employee / Reference ID
              </span>

              <span className="block text-xs font-semibold text-slate-800 sm:text-sm">
                #{profile.referenceId}
              </span>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-primary shadow-2xs">
              <Calendar className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Member Since
              </span>

              <span className="block text-xs font-semibold text-slate-800 sm:text-sm">
                {memberSince || 'Active Member'}
              </span>
            </div>
          </div>
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
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Account Details
            </h2>

            <p className=" text-xs text-slate-500">
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

            <InputField
              label="Email"
              value={form.email ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />

            <Button
              label="Save Changes"
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