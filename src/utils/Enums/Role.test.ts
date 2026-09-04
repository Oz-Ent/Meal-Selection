import { Roles, Role, ADMIN_ROLES, ADMIN_ROLE_NAMES, isAdminRole } from './Role';

describe('Role enum and helpers', () => {
  it('has correct numeric values for each role', () => {
    expect(Roles.admin).toBe(1);
    expect(Roles.manager).toBe(2);
    expect(Roles.hr).toBe(3);
    expect(Roles.worker).toBe(4);
    expect(Roles.user).toBe(5);

    expect(Role.admin).toBe(1);
    expect(Role.manager).toBe(2);
    expect(Role.hr).toBe(3);
    expect(Role.worker).toBe(4);
    expect(Role.user).toBe(5);
  });

  it('contains admin and hr in ADMIN_ROLES and ADMIN_ROLE_NAMES', () => {
    expect(ADMIN_ROLES).toEqual([Roles.admin, Roles.hr]);
    expect(ADMIN_ROLE_NAMES).toEqual(['admin', 'hr']);
  });

  describe('isAdminRole', () => {
    it('returns true for roleId 1 (admin) and 3 (hr)', () => {
      expect(isAdminRole(1)).toBe(true);
      expect(isAdminRole(3)).toBe(true);
      expect(isAdminRole(Roles.admin)).toBe(true);
      expect(isAdminRole(Roles.hr)).toBe(true);
    });

    it('returns false for other roleIds', () => {
      expect(isAdminRole(2)).toBe(false); // manager
      expect(isAdminRole(4)).toBe(false); // worker
      expect(isAdminRole(5)).toBe(false); // user
      expect(isAdminRole(99)).toBe(false);
    });

    it('returns true for roleName string "admin" or "hr" regardless of case', () => {
      expect(isAdminRole('admin')).toBe(true);
      expect(isAdminRole('ADMIN')).toBe(true);
      expect(isAdminRole('Admin')).toBe(true);
      expect(isAdminRole('hr')).toBe(true);
      expect(isAdminRole('HR')).toBe(true);
      expect(isAdminRole('Hr')).toBe(true);
    });

    it('returns false for other roleName strings', () => {
      expect(isAdminRole('user')).toBe(false);
      expect(isAdminRole('manager')).toBe(false);
      expect(isAdminRole('worker')).toBe(false);
      expect(isAdminRole('employee')).toBe(false);
    });

    it('returns true for user object with admin/hr roleName or roleId', () => {
      expect(isAdminRole({ roleName: 'admin' })).toBe(true);
      expect(isAdminRole({ roleName: 'HR' })).toBe(true);
      expect(isAdminRole({ roleId: Roles.admin })).toBe(true);
      expect(isAdminRole({ roleId: Roles.hr })).toBe(true);
      expect(isAdminRole({ roleId: Roles.admin, roleName: 'admin' })).toBe(true);
      expect(isAdminRole({ roleId: Roles.hr, roleName: 'hr' })).toBe(true);
    });

    it('returns false for user object with non-admin role', () => {
      expect(isAdminRole({ roleId: Roles.user, roleName: 'user' })).toBe(false);
      expect(isAdminRole({ roleId: Roles.worker, roleName: 'worker' })).toBe(false);
      expect(isAdminRole({ roleId: Roles.manager, roleName: 'manager' })).toBe(false);
    });

    it('returns false for null, undefined, or empty inputs', () => {
      expect(isAdminRole(null)).toBe(false);
      expect(isAdminRole(undefined)).toBe(false);
      expect(isAdminRole('')).toBe(false);
      expect(isAdminRole({})).toBe(false);
    });
  });
});
