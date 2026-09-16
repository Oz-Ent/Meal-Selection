import {
  bottomNavItems,
  getBottomNavItemsForRole,
  getItemsForRole,
} from './navigationConfig';
import { Role } from '../utils/Enums/Roles';

describe('navigationConfig', () => {
  describe('bottomNavItems', () => {
    it('defines 4 standard bottom navigation items', () => {
      expect(bottomNavItems).toHaveLength(4);
      expect(bottomNavItems.map((item) => item.id)).toEqual(['home', 'admin', 'history', 'account']);
    });
  });

  describe('getItemsForRole', () => {
    it('filters items correctly based on allowed roles', () => {
      const items = [
        { id: '1', name: 'Public', roles: [Role.user, Role.admin, Role.hr, Role.manager, Role.worker] },
        { id: '2', name: 'Admin Only', roles: [Role.admin, Role.hr] },
        { id: '3', name: 'Management', roles: [Role.admin, Role.hr, Role.manager] },
      ];

      expect(getItemsForRole(items, Role.user).map((i) => i.id)).toEqual(['1']);
      expect(getItemsForRole(items, Role.manager).map((i) => i.id)).toEqual(['1', '3']);
      expect(getItemsForRole(items, Role.admin).map((i) => i.id)).toEqual(['1', '2', '3']);
      expect(getItemsForRole(items, { roleId: Role.admin }).map((i) => i.id)).toEqual(['1', '2', '3']);
    });
  });

  describe('getBottomNavItemsForRole', () => {
    it('returns 3 items for regular users (Home, History, Account)', () => {
      const userItems = getBottomNavItemsForRole(Role.user);
      expect(userItems.map((i) => i.id)).toEqual(['home', 'history', 'account']);
    });

    it('includes Admin item for Admin, HR, and Worker roles', () => {
      const adminItems = getBottomNavItemsForRole(Role.admin);
      expect(adminItems.map((i) => i.id)).toEqual(['home', 'admin', 'history', 'account']);

      const hrItems = getBottomNavItemsForRole(Role.hr);
      expect(hrItems.map((i) => i.id)).toEqual(['home', 'admin', 'history', 'account']);

      const workerItems = getBottomNavItemsForRole(Role.worker);
      expect(workerItems.map((i) => i.id)).toEqual(['home', 'admin', 'history', 'account']);
    });
  });
});
