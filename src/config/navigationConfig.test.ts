import {
  baseNavigationItems,
  adminNavigationItems,
  bottomNavItems,
  getNavigationItemsForRole,
  getAdminNavigationItemsForRole,
  getBottomNavItemsForRole,
  isNavItemAllowed,
  hasRouteAccess,
} from './navigationConfig';
import { UserRole } from '../utils/Enums/Roles';

describe('navigationConfig', () => {
  describe('Navigation items configurations', () => {
    it('defines base navigation items correctly', () => {
      expect(baseNavigationItems.length).toBeGreaterThan(0);
      const ids = baseNavigationItems.map((item) => item.id);
      expect(ids).toContain('activities');
      expect(ids).toContain('select-meal');
      expect(ids).toContain('preset-meals');
      expect(ids).toContain('history');
      expect(ids).toContain('account');
    });

    it('defines admin navigation items correctly', () => {
      const ids = adminNavigationItems.map((item) => item.id);
      expect(ids).toContain('admin-activities');
      expect(ids).toContain('menu');
      expect(ids).toContain('meal-management');
      expect(ids).toContain('selection-status');
      expect(ids).toContain('selection-activity');
      expect(ids).toContain('holidays');
    });

    it('defines bottom navigation items correctly', () => {
      const ids = bottomNavItems.map((item) => item.id);
      expect(ids).toEqual(['home', 'admin', 'history', 'feedback', 'account']);
    });
  });

  describe('isNavItemAllowed', () => {
    it('allows universal items for all 5 roles', () => {
      const allRoles = [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.HR,
        UserRole.WORKER,
        UserRole.USER,
      ];

      const universalItem = baseNavigationItems.find((i) => i.id === 'select-meal')!;
      for (const role of allRoles) {
        expect(isNavItemAllowed(universalItem, role)).toBe(true);
      }
    });

    it('restricts admin-only items', () => {
      const adminItem = adminNavigationItems.find((i) => i.id === 'meal-management')!;
      expect(isNavItemAllowed(adminItem, UserRole.ADMIN)).toBe(true);
      expect(isNavItemAllowed(adminItem, UserRole.HR)).toBe(true);
      expect(isNavItemAllowed(adminItem, UserRole.MANAGER)).toBe(false);
      expect(isNavItemAllowed(adminItem, UserRole.WORKER)).toBe(false);
      expect(isNavItemAllowed(adminItem, UserRole.USER)).toBe(false);
    });

    it('allows selection-status for management roles (Admin, HR, Manager)', () => {
      const statusItem = adminNavigationItems.find((i) => i.id === 'selection-status')!;
      expect(isNavItemAllowed(statusItem, UserRole.ADMIN)).toBe(true);
      expect(isNavItemAllowed(statusItem, UserRole.HR)).toBe(true);
      expect(isNavItemAllowed(statusItem, UserRole.MANAGER)).toBe(true);
      expect(isNavItemAllowed(statusItem, UserRole.WORKER)).toBe(false);
      expect(isNavItemAllowed(statusItem, UserRole.USER)).toBe(false);
    });
  });

  describe('getNavigationItemsForRole', () => {
    it('returns filtered items for User role (Role 5)', () => {
      const items = getNavigationItemsForRole(UserRole.USER);
      const ids = items.map((i) => i.id);
      expect(ids).toContain('activities');
      expect(ids).toContain('select-meal');
      expect(ids).toContain('preset-meals');
      expect(ids).toContain('history');
      expect(ids).toContain('account');
      expect(ids).not.toContain('menu');
    });

    it('returns filtered items for Worker role (Role 4)', () => {
      const items = getNavigationItemsForRole(UserRole.WORKER);
      const ids = items.map((i) => i.id);
      expect(ids).toContain('activities');
      expect(ids).toContain('select-meal');
      expect(ids).toContain('preset-meals');
      expect(ids).toContain('history');
      expect(ids).toContain('account');
      expect(ids).not.toContain('menu');
    });

    it('returns filtered items for Admin role (Role 1)', () => {
      const items = getNavigationItemsForRole(UserRole.ADMIN);
      const ids = items.map((i) => i.id);
      expect(ids).toContain('activities');
      expect(ids).toContain('select-meal');
      expect(ids).toContain('preset-meals');
      expect(ids).toContain('menu');
      expect(ids).toContain('history');
      expect(ids).toContain('account');
    });

    it('returns admin navigation items for Admin/HR and management items for Manager', () => {
      const adminItems = getAdminNavigationItemsForRole(UserRole.ADMIN);
      expect(adminItems.map((i) => i.id)).toContain('menu');
      expect(adminItems.map((i) => i.id)).toContain('meal-management');
      expect(adminItems.map((i) => i.id)).toContain('selection-status');

      const managerItems = getAdminNavigationItemsForRole(UserRole.MANAGER);
      expect(managerItems.map((i) => i.id)).toEqual(['selection-status']);

      const userItems = getAdminNavigationItemsForRole(UserRole.USER);
      expect(userItems).toEqual([]);
    });
  });

  describe('getBottomNavItemsForRole', () => {
    it('returns 4 bottom items for standard users (User, Worker)', () => {
      const userBottom = getBottomNavItemsForRole(UserRole.USER);
      expect(userBottom.map((i) => i.id)).toEqual(['home', 'history', 'feedback', 'account']);

      const workerBottom = getBottomNavItemsForRole(UserRole.WORKER);
      expect(workerBottom.map((i) => i.id)).toEqual(['home', 'history', 'feedback', 'account']);
    });

    it('returns 5 bottom items for Admin and HR', () => {
      const adminBottom = getBottomNavItemsForRole(UserRole.ADMIN);
      expect(adminBottom.map((i) => i.id)).toEqual([
        'home',
        'admin',
        'history',
        'feedback',
        'account',
      ]);

      const hrBottom = getBottomNavItemsForRole(UserRole.HR);
      expect(hrBottom.map((i) => i.id)).toEqual([
        'home',
        'admin',
        'history',
        'feedback',
        'account',
      ]);
    });
  });

  describe('hasRouteAccess', () => {
    it('permits public and general user routes for all roles', () => {
      expect(hasRouteAccess('/activities', UserRole.USER)).toBe(true);
      expect(hasRouteAccess('/select-meal', UserRole.WORKER)).toBe(true);
      expect(hasRouteAccess('/preset-meals', UserRole.MANAGER)).toBe(true);
      expect(hasRouteAccess('/history', UserRole.ADMIN)).toBe(true);
      expect(hasRouteAccess('/account', UserRole.HR)).toBe(true);
    });

    it('restricts /admin routes to Admin and HR', () => {
      expect(hasRouteAccess('/admin/activities', UserRole.ADMIN)).toBe(true);
      expect(hasRouteAccess('/admin/activities', UserRole.HR)).toBe(true);
      expect(hasRouteAccess('/admin/activities', UserRole.MANAGER)).toBe(false);
      expect(hasRouteAccess('/admin/activities', UserRole.WORKER)).toBe(false);
      expect(hasRouteAccess('/admin/activities', UserRole.USER)).toBe(false);
    });

    it('allows manager to access selection-status under /admin', () => {
      expect(hasRouteAccess('/admin/selection-status', UserRole.MANAGER)).toBe(true);
      expect(hasRouteAccess('/admin/selection-status', UserRole.ADMIN)).toBe(true);
      expect(hasRouteAccess('/admin/selection-status', UserRole.HR)).toBe(true);
      expect(hasRouteAccess('/admin/selection-status', UserRole.WORKER)).toBe(false);
      expect(hasRouteAccess('/admin/selection-status', UserRole.USER)).toBe(false);
    });
  });
});
