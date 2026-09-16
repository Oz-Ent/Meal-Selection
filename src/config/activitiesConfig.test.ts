import {
  adminActivitiesConfig,
  getAdminActivitiesForRole,
  getMenuCardsForRole,
  getModalActionsForRole,
} from './activitiesConfig';
import { Role } from '../utils/Enums/Roles';

describe('activitiesConfig', () => {
  describe('adminActivitiesConfig', () => {
    it('defines roles for all admin activity items', () => {
      for (const item of adminActivitiesConfig) {
        expect(item.roles.length).toBeGreaterThan(0);
      }
    });

    it('returns selection-status, budgets, and analytics for Manager role', () => {
      const managerActivities = getAdminActivitiesForRole(Role.manager);
      expect(managerActivities.map((a) => a.id)).toEqual(['selection-status', 'budgets', 'analytics']);
    });

    it('returns menus, meals, and food-assignment for Worker role', () => {
      const workerActivities = getAdminActivitiesForRole(Role.worker);
      expect(workerActivities.map((a) => a.id)).toEqual([
        'menus',
        'meals',
        'food-assignment',
      ]);
    });

    it('returns all admin activities for Admin', () => {
      const adminActivities = getAdminActivitiesForRole(Role.admin);
      expect(adminActivities.map((a) => a.id)).toEqual([
        'menus',
        'meals',
        'food-assignment',
        'selection-status',
        'budgets',
        'analytics',
        'mark-holidays',
      ]);
    });

    it('returns no admin activities for regular User role', () => {
      expect(getAdminActivitiesForRole(Role.user)).toEqual([]);
    });
  });

  describe('menuCardsConfig', () => {
    it('returns all menu cards for standard users', () => {
      const userCards = getMenuCardsForRole(Role.user);
      expect(userCards.map((c) => c.id)).toEqual(['select-meals', 'preset-meals']);
    });
  });

  describe('selectMealModalActionsConfig', () => {
    it('returns self and others selection for regular users', () => {
      const userActions = getModalActionsForRole(Role.user);
      expect(userActions.map((a) => a.id)).toEqual(['select-for-self', 'select-for-others']);
    });

    it('returns self, guests, and others selection for admin and hr', () => {
      const adminActions = getModalActionsForRole(Role.admin);
      expect(adminActions.map((a) => a.id)).toEqual([
        'select-for-self',
        'select-for-guests',
        'select-for-others',
      ]);
    });
  });
});
