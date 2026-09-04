export enum Roles {
  admin = 1,
  manager = 2,
  hr = 3,
  worker = 4,
  user = 5,
}

export const Role = Roles;
export type RoleType = keyof typeof Roles;

export const ADMIN_ROLES = [Roles.admin, Roles.hr] as const;
export const ADMIN_ROLE_NAMES = ['admin', 'hr'] as const;

/**
 * Checks whether a user or role identifier has administrative/elevated privileges (Admin or HR).
 * Accepts either:
 * - A user object ({ roleId?: number, roleName?: string })
 * - A roleId number (Roles.admin = 1, Roles.hr = 3)
 * - A roleName string ('admin' or 'hr', case-insensitive)
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

  if (userOrRole.roleName) {
    const normalized = userOrRole.roleName.trim().toLowerCase();
    return normalized === 'admin' || normalized === 'hr';
  }

  if (userOrRole.roleId != null) {
    return userOrRole.roleId === Roles.admin || userOrRole.roleId === Roles.hr;
  }

  return false;
}
