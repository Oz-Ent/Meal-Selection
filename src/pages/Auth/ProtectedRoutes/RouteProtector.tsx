import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../useAuth/useAuth';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { Role } from '../../../utils/Enums/Roles';

export interface RouteProtectorProps {
  children: JSX.Element;
  allowedRoles?: readonly Role[];
  redirectTo?: string;
}

export const RouteProtector = ({
  children,
  allowedRoles,
  redirectTo = '/activities',
}: RouteProtectorProps) => {
  const { profile, token, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <LoadingSpinner subtext="Verifying session..." />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const userRoleId =
    profile?.user?.roleId ??
    (typeof profile?.user?.roleName === 'string'
      ? (Role as unknown as Record<string, number>)[profile.user.roleName.toLowerCase()]
      : undefined);

  // Admin always has full access
  if (userRoleId === Role.admin) {
    return children;
  }

  // If specific roles are configured, check user's role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRoleId || !allowedRoles.includes(userRoleId as Role)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};
