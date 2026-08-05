import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../useAuth/useAuth';

export const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { profile, token } = useAuth();
  const roleName = profile?.user.roleName.toLowerCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roleName !== 'admin' && roleName !== 'hr') {
    return <Navigate to="/activities" replace />;
  }

  return children;
};
