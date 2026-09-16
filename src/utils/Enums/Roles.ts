export enum Role {
  admin = 1,
  manager = 2,
  hr = 3,
  worker = 4,
  user = 5,
}

// Aliases for compatibility
export const UserRole = Role;
export type UserRole = Role;
export const Roles = Role;
export type Roles = Role;

export type RoleInput =
  | number
  | { roleId?: number | null; roleName?: string | null }
  | string
  | null
  | undefined;

/**
 * Checks whether a user or role identifier is an Admin or HR role.
 */
export const isAdminRole = (role?: RoleInput): boolean => {
  if (!role) return false;
  const id = typeof role === 'object' ? (role.roleId ?? role.roleName) : role;
  if (id === Role.admin || id === Role.hr) return true;
  if (typeof id === 'string') {
    const s = id.toLowerCase();
    return s === 'admin' || s === 'hr' || s === '1' || s === '3';
  }
  return false;
};
