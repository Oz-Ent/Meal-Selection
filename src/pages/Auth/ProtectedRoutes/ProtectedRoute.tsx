import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../useAuth/useAuth';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { token, isInitializing } = useAuth();

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

  return children;
};
