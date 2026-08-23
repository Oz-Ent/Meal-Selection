import { useState } from 'react';
import { LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import AppIcon from '../../assets/App Icon.svg';
import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar';
import { useUserProfileQuery } from '../../api/useApiQueries';
import { useAuth } from '../Auth/useAuth/useAuth';
import { AccountProfileCard } from './components/AccountProfileCard';
import { AccountLeaveCard } from './components/AccountLeaveCard';
import { AccountPreferencesCard } from './components/AccountPreferencesCard';
import { AccountSecurityCard } from './components/AccountSecurityCard';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import type { UserProfileResponse } from '../../api/Services/UserServices';

export function Account() {
  const { profile: authContextProfile } = useAuth();
  const { data: userProfile, isLoading, error, refetch } = useUserProfileQuery();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Fallback profile from authContext if query is loading or offline
  const fallbackProfile: UserProfileResponse = {
    id: authContextProfile?.user?.id ?? 0,
    name: authContextProfile?.user?.name ?? 'User',
    email: authContextProfile?.user?.email ?? null,
    referenceEmail: authContextProfile?.user?.email ?? '',
    referenceId: authContextProfile?.user?.id ?? 0,
    status: 'ACTIVE',
    roleId: authContextProfile?.user?.roleId ?? 1,
    roleName: authContextProfile?.user?.roleName ?? 'Employee',
    createdAt: new Date().toISOString(),
    isActivated: true,
    leaves: [],
    upcomingOrActiveLeaves: [],
    totalLeaveDays: 0,
  };

  const currentProfile = userProfile ?? fallbackProfile;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-32 text-slate-800 font-sans">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <img src={AppIcon} alt="App Icon" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold tracking-tight text-slate-800">
            Edziban
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh profile"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            aria-label="Sign out"
            className="flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 text-xs font-bold text-rose-700 border border-rose-200/70 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Title & Welcome Section */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Account & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal profile, leave schedule, dietary preferences, and security settings.
          </p>
        </div>

        {/* Error Alert if query fails */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 border border-amber-200 shadow-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Unable to sync latest account details</span>
              <span>Showing cached session profile. Please check your network connection.</span>
            </div>
          </div>
        )}

        {/* Profile Details Hero Card */}
        <AccountProfileCard profile={currentProfile} />

        {/* Grid for Leave & Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccountLeaveCard
            leaves={currentProfile.leaves ?? []}
            upcomingOrActiveLeaves={currentProfile.upcomingOrActiveLeaves ?? []}
            totalLeaveDays={currentProfile.totalLeaveDays ?? 0}
          />

          <AccountPreferencesCard
            preferences={currentProfile.preferences}
            stats={currentProfile.stats}
          />
        </div>

        {/* Security & Password Card */}
        <AccountSecurityCard />

        {/* Sign Out Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sign Out of All Sessions</h3>
              <p className="text-xs text-slate-500">
                End your active session securely on this device.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        {/* App Version & Footer */}
        <div className="text-center pt-2 pb-4 text-xs text-slate-400">
          Edziban Meal Planning System • Version 1.0.0
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Bottom Navigation Bar */}
      <BottomNavbar activeTab="account" />
    </div>
  );
}

export default Account;
