import { Navigate } from 'react-router-dom';
import { useAuth } from '../../useAuth/useAuth';
import { isAdminRole } from '../../../../utils/Enums/Role';

export const ActivitiesRedirect = () => {
  const { profile } = useAuth();
  const destination = isAdminRole(profile?.user) ? '/admin/activities' : '/activities';

  return <Navigate to={destination} replace />;
};