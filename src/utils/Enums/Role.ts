export enum Roles {
  admin = 1,
  manager = 2,
  hr = 3,
  worker = 4,
  user = 5,
  ADMIN = 1,
  MANAGER = 2,
  HR = 3,
  WORKER = 4,
  USER = 5,
}

export const Role = Roles;
export type RoleType = keyof typeof Roles;

export const UserRole = Roles;
export type UserRole = Roles;

export const ADMIN_ROLES = [Roles.admin, Roles.hr] as const;
export const ADMIN_ROLE_NAMES = ['admin', 'hr'] as const;
export const MANAGEMENT_ROLES = [Roles.admin, Roles.manager, Roles.hr] as const;
export const ALL_ROLES = [
  Roles.admin,
  Roles.manager,
  Roles.hr,
  Roles.worker,
  Roles.user,
] as const;

export const ROLE_NAMES: Readonly<Record<number, string>> = Object.freeze({
  1: 'admin',
  2: 'manager',
  3: 'hr',
  4: 'worker',
  5: 'user',
});

export const ROLE_LABELS: Readonly<Record<number, string>> = Object.freeze({
  1: 'Admin',
  2: 'Manager',
  3: 'HR',
  4: 'Worker',
  5: 'User',
});

/**
 * Checks whether a user or role identifier has administrative/elevated privileges (Admin or HR).
 */
export function isAdminRole(
  userOrRole?: { roleId?: number; roleName?: string } | number | string | null
): boolean {
  if (userOrRole == null) return false;

  if (typeof userOrRole === 'number') {
    return userOrRole === Roles.admin || userOrRole === Roles.hr;
  }

  if (typeof userOrRole === 'string') {
    const normalized = userOrRole.trim().toLowerCase();
    return normalized === 'admin' || normalized === 'hr';
  }

  if (typeof userOrRole === 'object') {
    if (userOrRole.roleName) {
      const normalized = userOrRole.roleName.trim().toLowerCase();
      if (normalized === 'admin' || normalized === 'hr') return true;
    }

    if (userOrRole.roleId != null) {
      return userOrRole.roleId === Roles.admin || userOrRole.roleId === Roles.hr;
    }
  }

  return false;
}
