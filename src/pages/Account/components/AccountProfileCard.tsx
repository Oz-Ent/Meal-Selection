import { User, Mail, Briefcase, Hash, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { UserProfileResponse } from '../../../api/Services/UserServices';

interface AccountProfileCardProps {
  profile: UserProfileResponse;
}

export const AccountProfileCard = ({ profile }: AccountProfileCardProps) => {
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
      {/* Header Banner with Profile Identity */}
      <div className="bg-gradient-to-br from-primary via-primary-hover to-secondary p-5 sm:p-6 text-white">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-xs border border-white/10">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
            Verified Profile
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100 border border-emerald-300/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {profile.status}
          </span>
        </div>

        {/* User Identity Info */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-2xl bg-white text-xl sm:text-2xl font-black text-primary shadow-md border-2 border-white/30">
            {initials}
          </div>

          {/* Name & Role */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg sm:text-2xl font-bold text-white tracking-tight">
                {profile.name}
              </h2>
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-300 shrink-0" />
            </div>
            <p className="truncate text-xs sm:text-sm text-emerald-100/90 font-medium">
              {profile.referenceEmail}
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs border border-white/15">
                <Briefcase className="h-3 w-3 text-emerald-200" />
                {profile.roleName || 'Employee'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Info Grid */}
      <div className="p-4 sm:p-6 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-2xs border border-slate-200/70">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Work / Reference Email
              </span>
              <span className="block truncate text-xs sm:text-sm font-semibold text-slate-800" title={profile.referenceEmail}>
                {profile.referenceEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-2xs border border-slate-200/70">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Primary Account Email
              </span>
              <span className="block truncate text-xs sm:text-sm font-semibold text-slate-800" title={profile.email || profile.referenceEmail}>
                {profile.email || profile.referenceEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-2xs border border-slate-200/70">
              <Hash className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Employee / Reference ID
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-slate-800">
                #{profile.referenceId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-2xs border border-slate-200/70">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Member Since
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-slate-800">
                {memberSince || 'Active Member'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
