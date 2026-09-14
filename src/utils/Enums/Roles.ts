import { Roles, isAdminRole } from './Role';

export * from './Role';

export const isAdminOrHr = isAdminRole;

export type RoleInput =
  | number
  | { roleId?: number | null; roleName?: string | null }
  | string
  | null
  | undefined;

export function parseRole(role?: RoleInput): Roles {
  if (role == null) return Roles.user;
  if (typeof role === 'number') return role as Roles;
  if (typeof role === 'object' && role.roleId != null) return role.roleId as Roles;
  const num = Number(role);
  if (!Number.isNaN(num) && num >= 1 && num <= 5) {
    return num as Roles;
  }
  const str = String(role).trim().toLowerCase();
  if (str === 'admin') return Roles.admin;
  if (str === 'manager') return Roles.manager;
  if (str === 'hr') return Roles.hr;
  if (str === 'worker' || str === 'employee') return Roles.worker;
  return Roles.user;
}

export const normalizeRole = parseRole;

export function hasRole(
  role: RoleInput,
  allowedRoles: readonly (number | Roles)[] | (number | Roles)[]
): boolean {
  const r = parseRole(role);
  return (allowedRoles as readonly number[]).includes(r);
}

export function isManagement(role?: RoleInput): boolean {
  const r = parseRole(role);
  return r === Roles.admin || r === Roles.manager || r === Roles.hr;
}

export function isManagerRole(role?: RoleInput): boolean {
  return parseRole(role) === Roles.manager;
}

export function isHrRole(role?: RoleInput): boolean {
  return parseRole(role) === Roles.hr;
}

export function isWorkerRole(role?: RoleInput): boolean {
  return parseRole(role) === Roles.worker;
}

export function isUserRole(role?: RoleInput): boolean {
  return parseRole(role) === Roles.user;
}

export function getRoleName(role?: RoleInput): string {
  const r = parseRole(role);
  switch (r) {
    case Roles.admin:
      return 'admin';
    case Roles.manager:
      return 'manager';
    case Roles.hr:
      return 'hr';
    case Roles.worker:
      return 'worker';
    default:
      return 'user';
  }
}

export function getRoleLabel(role?: RoleInput): string {
  const r = parseRole(role);
  switch (r) {
    case Roles.admin:
      return 'Admin';
    case Roles.manager:
      return 'Manager';
    case Roles.hr:
      return 'HR';
    case Roles.worker:
      return 'Worker';
    default:
      return 'User';
  }
}
