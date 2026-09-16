import type { JSX } from 'react';
import { RouteProtector } from '../RouteProtector';
import { Role } from '../../../../utils/Enums/Roles';

export const AdminProtectedRoute = ({
  children,
  allowedRoles = [Role.admin, Role.hr, Role.manager, Role.worker],
}: {
  children: JSX.Element;
  allowedRoles?: readonly Role[];
}) => {
  return <RouteProtector allowedRoles={allowedRoles}>{children}</RouteProtector>;
};
