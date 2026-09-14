import {
  UserRole,
  parseRole,
  normalizeRole,
  isAdminRole,
  isManagerRole,
  isHrRole,
  isWorkerRole,
  isUserRole,
  isAdminOrHr,
  isManagement,
  hasRole,
  getRoleName,
  getRoleLabel,
  ROLE_NAMES,
  ROLE_LABELS,
  ADMIN_ROLES,
  MANAGEMENT_ROLES,
  ALL_ROLES,
} from './Roles';

describe('UserRole Enum & Helper Utilities', () => {
  describe('Enum values and definitions', () => {
    it('has exact numeric values for all 5 roles', () => {
      expect(UserRole.ADMIN).toBe(1);
      expect(UserRole.MANAGER).toBe(2);
      expect(UserRole.HR).toBe(3);
      expect(UserRole.WORKER).toBe(4);
      expect(UserRole.USER).toBe(5);
    });

    it('has correct role name mappings', () => {
      expect(ROLE_NAMES[UserRole.ADMIN]).toBe('admin');
      expect(ROLE_NAMES[UserRole.MANAGER]).toBe('manager');
      expect(ROLE_NAMES[UserRole.HR]).toBe('hr');
      expect(ROLE_NAMES[UserRole.WORKER]).toBe('worker');
      expect(ROLE_NAMES[UserRole.USER]).toBe('user');
    });

    it('has correct role label mappings', () => {
      expect(ROLE_LABELS[UserRole.ADMIN]).toBe('Admin');
      expect(ROLE_LABELS[UserRole.MANAGER]).toBe('Manager');
      expect(ROLE_LABELS[UserRole.HR]).toBe('HR');
      expect(ROLE_LABELS[UserRole.WORKER]).toBe('Worker');
      expect(ROLE_LABELS[UserRole.USER]).toBe('User');
    });

    it('defines role groupings accurately', () => {
      expect(ADMIN_ROLES).toEqual([UserRole.ADMIN, UserRole.HR]);
      expect(MANAGEMENT_ROLES).toEqual([UserRole.ADMIN, UserRole.MANAGER, UserRole.HR]);
      expect(ALL_ROLES).toEqual([
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.HR,
        UserRole.WORKER,
        UserRole.USER,
      ]);
    });
  });

  describe('parseRole & normalizeRole', () => {
    it('parses numeric UserRole values directly', () => {
      expect(parseRole(UserRole.ADMIN)).toBe(UserRole.ADMIN);
      expect(parseRole(UserRole.MANAGER)).toBe(UserRole.MANAGER);
      expect(parseRole(UserRole.HR)).toBe(UserRole.HR);
      expect(parseRole(UserRole.WORKER)).toBe(UserRole.WORKER);
      expect(parseRole(UserRole.USER)).toBe(UserRole.USER);
    });

    it('parses numeric strings correctly', () => {
      expect(parseRole('1')).toBe(UserRole.ADMIN);
      expect(parseRole('2')).toBe(UserRole.MANAGER);
      expect(parseRole('3')).toBe(UserRole.HR);
      expect(parseRole('4')).toBe(UserRole.WORKER);
      expect(parseRole('5')).toBe(UserRole.USER);
    });

    it('parses standard string role names case-insensitively', () => {
      expect(parseRole('admin')).toBe(UserRole.ADMIN);
      expect(parseRole('ADMIN')).toBe(UserRole.ADMIN);
      expect(parseRole('Admin')).toBe(UserRole.ADMIN);

      expect(parseRole('manager')).toBe(UserRole.MANAGER);
      expect(parseRole('MANAGER')).toBe(UserRole.MANAGER);

      expect(parseRole('hr')).toBe(UserRole.HR);
      expect(parseRole('HR')).toBe(UserRole.HR);

      expect(parseRole('worker')).toBe(UserRole.WORKER);
      expect(parseRole('WORKER')).toBe(UserRole.WORKER);

      expect(parseRole('user')).toBe(UserRole.USER);
      expect(parseRole('USER')).toBe(UserRole.USER);
    });

    it('handles legacy aliases correctly', () => {
      expect(parseRole('employee')).toBe(UserRole.WORKER);
      expect(parseRole('EMPLOYEE')).toBe(UserRole.WORKER);
      expect(parseRole('guest')).toBe(UserRole.USER);
      expect(parseRole('GUEST')).toBe(UserRole.USER);
    });

    it('handles dotted role strings', () => {
      expect(parseRole('admin.superuser')).toBe(UserRole.ADMIN);
      expect(parseRole('manager.dept')).toBe(UserRole.MANAGER);
      expect(parseRole('worker.shift1')).toBe(UserRole.WORKER);
    });

    it('defaults to UserRole.USER for undefined, null, or unrecognized inputs', () => {
      expect(parseRole(undefined)).toBe(UserRole.USER);
      expect(parseRole(null)).toBe(UserRole.USER);
      expect(parseRole('')).toBe(UserRole.USER);
      expect(parseRole('unknown_role')).toBe(UserRole.USER);
      expect(parseRole(99)).toBe(UserRole.USER);
      expect(normalizeRole(null)).toBe(UserRole.USER);
    });
  });

  describe('Role Predicates and Helper Functions', () => {
    it('identifies isAdminRole accurately', () => {
      expect(isAdminRole(UserRole.ADMIN)).toBe(true);
      expect(isAdminRole('ADMIN')).toBe(true);
      expect(isAdminRole('admin')).toBe(true);
      expect(isAdminRole(1)).toBe(true);
      expect(isAdminRole('manager')).toBe(false);
      expect(isAdminRole('hr')).toBe(false);
      expect(isAdminRole('worker')).toBe(false);
      expect(isAdminRole('user')).toBe(false);
    });

    it('identifies isManagerRole accurately', () => {
      expect(isManagerRole(UserRole.MANAGER)).toBe(true);
      expect(isManagerRole('MANAGER')).toBe(true);
      expect(isManagerRole(2)).toBe(true);
      expect(isManagerRole('admin')).toBe(false);
    });

    it('identifies isHrRole accurately', () => {
      expect(isHrRole(UserRole.HR)).toBe(true);
      expect(isHrRole('HR')).toBe(true);
      expect(isHrRole(3)).toBe(true);
      expect(isHrRole('worker')).toBe(false);
    });

    it('identifies isWorkerRole accurately', () => {
      expect(isWorkerRole(UserRole.WORKER)).toBe(true);
      expect(isWorkerRole('employee')).toBe(true);
      expect(isWorkerRole(4)).toBe(true);
      expect(isWorkerRole('user')).toBe(false);
    });

    it('identifies isUserRole accurately', () => {
      expect(isUserRole(UserRole.USER)).toBe(true);
      expect(isUserRole('guest')).toBe(true);
      expect(isUserRole(5)).toBe(true);
      expect(isUserRole('admin')).toBe(false);
    });

    it('identifies isAdminOrHr accurately', () => {
      expect(isAdminOrHr(UserRole.ADMIN)).toBe(true);
      expect(isAdminOrHr(UserRole.HR)).toBe(true);
      expect(isAdminOrHr('admin')).toBe(true);
      expect(isAdminOrHr('hr')).toBe(true);
      expect(isAdminOrHr(1)).toBe(true);
      expect(isAdminOrHr(3)).toBe(true);
      expect(isAdminOrHr('manager')).toBe(false);
      expect(isAdminOrHr('worker')).toBe(false);
      expect(isAdminOrHr('user')).toBe(false);
      expect(isAdminOrHr(null)).toBe(false);
    });

    it('identifies isManagement accurately', () => {
      expect(isManagement('admin')).toBe(true);
      expect(isManagement('manager')).toBe(true);
      expect(isManagement('hr')).toBe(true);
      expect(isManagement('worker')).toBe(false);
      expect(isManagement('user')).toBe(false);
    });

    it('checks hasRole accurately', () => {
      expect(hasRole('manager', [UserRole.MANAGER, UserRole.ADMIN])).toBe(true);
      expect(hasRole('worker', [UserRole.ADMIN, UserRole.HR])).toBe(false);
    });

    it('gets role name and label strings', () => {
      expect(getRoleName(UserRole.ADMIN)).toBe('admin');
      expect(getRoleName('manager')).toBe('manager');
      expect(getRoleLabel(UserRole.ADMIN)).toBe('Admin');
      expect(getRoleLabel('worker')).toBe('Worker');
    });
  });
});
