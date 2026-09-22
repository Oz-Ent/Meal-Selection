import { useState } from 'react';
import { LogOut, AlertCircle } from 'lucide-react';
import { BottomNavbar } from '../../components/BottomNavbar/BottomNavbar';
import { useUserProfileQuery } from '../../api/useApiQueries';
import { useAuth } from '../Auth/useAuth/useAuth';
import { AccountProfileCard } from './components/AccountProfileCard';
import { AccountLeaveCard } from './components/AccountLeaveCard';
import { AccountPreferencesCard } from './components/AccountPreferencesCard';
import { AccountSecurityCard } from './components/AccountSecurityCard';
import UserPreferencesCard from './components/UserPreferencesCard';
import type { UserProfileResponse } from '../../api/Services/UserServices';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { Roles } from '../../utils/Enums/Roles';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import PageHeader from '../../components/PageHeader/PageHeader';

export function Account() {
  const { profile: authContextProfile } = useAuth();
  const { data: userProfile, isLoading, isFetching, error, refetch } = useUserProfileQuery();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Fallback profile from authContext if query is loading or offline
  const fallbackProfile: UserProfileResponse = {
    id: authContextProfile?.user?.id ?? 0,
    name: authContextProfile?.user?.name ?? 'User',
    email: authContextProfile?.user?.email ?? null,
    referenceEmail: authContextProfile?.user?.email ?? '',
    referenceId: authContextProfile?.user?.id ?? 0,
    status: 'ACTIVE',
    roleId: authContextProfile?.user?.roleId ?? Roles.user,
    roleName: authContextProfile?.user?.roleName ?? 'Employee',
    createdAt: new Date().toISOString(),
    isActivated: true,
    leaves: [],
    upcomingOrActiveLeaves: [],
    totalLeaveDays: 0,
  };

  const currentProfile = userProfile ?? fallbackProfile;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-app-bg pb-32 text-text-primary font-sans">
      {/* Top Bar Header */}
      <TitleBar isLoading={isLoading || isFetching} refetchAction={() => refetch()} />

      {/* Main Container */}
      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Title & Welcome Section */}
        <PageHeader
        title="Account & Settings"
        description="Manage your personal profile, leave schedule, dietary preferences, and security settings."
        />

        {/* Error Alert if query fails */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl bg-warning-light p-4 text-xs text-warning-dark border border-warning/30 shadow-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-warning mt-0.5" />
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

          <UserPreferencesCard />

          <AccountSecurityCard />
        </div>

        {/* Sign Out Card */}
        <Card
          header={{
            title: 'Sign Out',
            subtitle: 'End your active session securely on this device',
            icon: <LogOut className="h-4 w-4 text-danger" />,
            action: (
              <Button
                variant="danger"
                icon={<LogOut className="h-3.5 w-3.5" />}
                label="Sign Out"
                onClick={() => setIsLogoutModalOpen(true)}
              />
            ),
          }}
        >
        </Card>

        {/* App Version & Footer */}
        <div className="text-center pt-2 pb-4 text-xs text-text-muted">
          Edziban Meal Planning System • Version 1.0.0
        </div>
      </div>

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
