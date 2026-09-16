import { Role, UserRole, Roles, isAdminRole } from './Roles';

describe('Role Enum', () => {
  it('has exact numeric values for roles', () => {
    expect(Role.admin).toBe(1);
    expect(Role.manager).toBe(2);
    expect(Role.hr).toBe(3);
    expect(Role.worker).toBe(4);
    expect(Role.user).toBe(5);

    expect(UserRole.admin).toBe(1);
    expect(Roles.admin).toBe(1);
  });

  describe('isAdminRole', () => {
    it('returns true for Admin and HR numeric values', () => {
      expect(isAdminRole(Role.admin)).toBe(true);
      expect(isAdminRole(Role.hr)).toBe(true);
      expect(isAdminRole(1)).toBe(true);
      expect(isAdminRole(3)).toBe(true);
    });

    it('returns true for user object with roleId Admin or HR', () => {
      expect(isAdminRole({ roleId: Role.admin })).toBe(true);
      expect(isAdminRole({ roleId: Role.hr })).toBe(true);
    });

    it('returns false for non-admin roles', () => {
      expect(isAdminRole(Role.manager)).toBe(false);
      expect(isAdminRole(Role.worker)).toBe(false);
      expect(isAdminRole(Role.user)).toBe(false);
      expect(isAdminRole({ roleId: Role.user })).toBe(false);
    });

    it('returns false for nullish input', () => {
      expect(isAdminRole(null)).toBe(false);
      expect(isAdminRole(undefined)).toBe(false);
    });
  });
});
