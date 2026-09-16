import {
  Contact,
  History,
  Home,
  UserRound,
} from 'lucide-react';
import type { ElementType } from 'react';
import { Role, type RoleInput } from '../utils/Enums/Roles';

export interface NavigationItemConfig {
  id: string;
  name: string;
  href: string;
  icon: ElementType;
  roles: readonly Role[];
}

export const bottomNavItems: readonly NavigationItemConfig[] = [
  {
    id: 'home',
    name: 'Home',
    href: '/activities',
    icon: Home,
    roles: [Role.admin, Role.hr, Role.manager, Role.worker, Role.user],
  },
  {
    id: 'admin',
    name: 'Admin',
    href: '/admin/activities',
    icon: Contact,
    roles: [Role.admin, Role.hr, Role.worker],
  },
  {
    id: 'history',
    name: 'History',
    href: '/history',
    icon: History,
    roles: [Role.admin, Role.hr, Role.manager, Role.worker, Role.user],
  },
  {
    id: 'account',
    name: 'Account',
    href: '/account',
    icon: UserRound,
    roles: [Role.admin, Role.hr, Role.manager, Role.worker, Role.user],
  },
];

/**
 * Resolves a role input to numeric Role enum value, defaulting to Role.user.
 */
function toRoleId(role?: RoleInput): Role {
  if (typeof role === 'number') return role as Role;
  if (typeof role === 'object' && role !== null) {
    if (typeof role.roleId === 'number') return role.roleId as Role;
    if (typeof role.roleName === 'string') {
      const parsed = (Role as unknown as Record<string, number>)[role.roleName.toLowerCase()];
      if (parsed !== undefined) return parsed as Role;
    }
  } else if (typeof role === 'string') {
    const parsed = (Role as unknown as Record<string, number>)[role.toLowerCase()];
    if (parsed !== undefined) return parsed as Role;
  }
  return Role.user;
}

/**
 * Returns filtered list of items accessible to the role.
 */
export function getItemsForRole<T extends { roles?: readonly Role[] }>(
  items: readonly T[],
  role?: RoleInput,
): T[] {
  const roleId = toRoleId(role);
  return items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(roleId);
  });
}

export function getBottomNavItemsForRole(
  role?: RoleInput,
): NavigationItemConfig[] {
  return getItemsForRole(bottomNavItems, role);
}
