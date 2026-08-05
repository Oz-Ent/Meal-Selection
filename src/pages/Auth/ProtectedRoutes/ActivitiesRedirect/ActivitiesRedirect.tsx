import { Navigate } from 'react-router-dom';
import { useAuth } from '../../useAuth/useAuth';

export const ActivitiesRedirect = () => {
  const { profile } = useAuth();
  const roleName = profile?.user.roleName.toLowerCase();
  const destination = roleName === 'admin' || roleName === 'hr' ? '/admin/activities' : '/activities';

  return <Navigate to={destination} replace />;
};