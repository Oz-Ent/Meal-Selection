import {
  CalendarDays,
  Clock,
  Contact,
  History,
  Home,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  User,
  UserRound,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';
import type { ElementType } from 'react';
import {
  UserRole,
  type RoleInput,
  parseRole,
  isAdminOrHr,
  hasRole,
  ADMIN_ROLES,
  MANAGEMENT_ROLES,
  ALL_ROLES,
} from '../utils/Enums/Roles';

export type NavItemId =
  | 'home'
  | 'admin'
  | 'budget'
  | 'feedback'
  | 'activities'
  | 'admin-activities'
  | 'select-meal'
  | 'preset-meals'
  | 'menu'
  | 'selection-status'
  | 'selection-activity'
  | 'holidays'
  | 'meal-management'
  | 'history'
  | 'account';

export interface NavigationItemConfig {
  id: string;
  name: string;
  href: string;
  icon: ElementType;
  /**
   * Roles allowed to view/access this navigation item.
   * If omitted, the item is available to all 5 roles.
   */
  roles?: readonly UserRole[] | UserRole[];
  /**
   * Backwards-compatible flag for admin/HR only items.
   */
  adminOnly?: boolean;
  badge?: string | number;
  exact?: boolean;
  children?: NavigationItemConfig[];
}

/**
 * Primary navigation items across the application.
 */
export const baseNavigationItems: readonly NavigationItemConfig[] = Object.freeze([
  {
    id: 'activities',
    name: 'Activities',
    href: '/activities',
    icon: LayoutDashboard,
    roles: ALL_ROLES,
  },
  {
    id: 'select-meal',
    name: 'Select Meal',
    href: '/select-meal',
    icon: UtensilsCrossed,
    roles: ALL_ROLES,
  },
  {
    id: 'preset-meals',
    name: 'Presets',
    href: '/preset-meals',
    icon: Sparkles,
    roles: ALL_ROLES,
  },
  {
    id: 'menu',
    name: 'Menu',
    href: '/admin/menu',
    icon: CalendarDays,
    roles: ADMIN_ROLES,
  },
  {
    id: 'history',
    name: 'History',
    href: '/history',
    icon: History,
    roles: ALL_ROLES,
  },
  {
    id: 'account',
    name: 'Account',
    href: '/account',
    icon: User,
    roles: ALL_ROLES,
  },
]);

/**
 * Administrative and Management navigation items.
 */
export const adminNavigationItems: readonly NavigationItemConfig[] = Object.freeze([
  {
    id: 'admin-activities',
    name: 'Admin Activities',
    href: '/admin/activities',
    icon: LayoutDashboard,
    roles: ADMIN_ROLES,
  },
  {
    id: 'menu',
    name: 'Menu Management',
    href: '/admin/menu',
    icon: CalendarDays,
    roles: ADMIN_ROLES,
  },
  {
    id: 'meal-management',
    name: 'Meal Library',
    href: '/admin/meal',
    icon: Utensils,
    roles: ADMIN_ROLES,
  },
  {
    id: 'selection-status',
    name: 'Selection Status',
    href: '/admin/selection-status',
    icon: Clock,
    roles: MANAGEMENT_ROLES,
  },
  {
    id: 'selection-activity',
    name: 'Selection Activity',
    href: '/admin/selection-activity',
    icon: LayoutDashboard,
    roles: ADMIN_ROLES,
  },
  {
    id: 'holidays',
    name: 'Mark Holidays',
    href: '/admin/holidays',
    icon: CalendarDays,
    roles: ADMIN_ROLES,
  },
]);

/**
 * Bottom Navbar navigation items configuration.
 */
export const bottomNavItems: readonly NavigationItemConfig[] = Object.freeze([
  {
    id: 'home',
    name: 'Home',
    href: '/activities',
    icon: Home,
    roles: ALL_ROLES,
  },
  {
    id: 'admin',
    name: 'Admin',
    href: '/admin/activities',
    icon: Contact,
    roles: ADMIN_ROLES,
  },
  {
    id: 'history',
    name: 'History',
    href: '/history',
    icon: History,
    roles: ALL_ROLES,
  },
  {
    id: 'feedback',
    name: 'Feedback',
    href: '/feedback',
    icon: MessageCircle,
    roles: ALL_ROLES,
  },
  {
    id: 'account',
    name: 'Account',
    href: '/account',
    icon: UserRound,
    roles: ALL_ROLES,
  },
]);

/**
 * Checks whether a navigation item is permitted for a given role.
 */
export function isNavItemAllowed(item: NavigationItemConfig, role?: RoleInput): boolean {
  const parsed = parseRole(role);

  if (item.adminOnly && !isAdminOrHr(parsed)) {
    return false;
  }

  if (item.roles && item.roles.length > 0) {
    return hasRole(parsed, item.roles);
  }

  return true;
}

/**
 * Returns filtered navigation items accessible to the resolved role.
 */
export function getNavigationItemsForRole(
  role?: RoleInput,
  items: readonly NavigationItemConfig[] = baseNavigationItems,
): NavigationItemConfig[] {
  return items.filter((item) => isNavItemAllowed(item, role));
}

/**
 * Returns administrative navigation items accessible to the resolved role.
 */
export function getAdminNavigationItemsForRole(role?: RoleInput): NavigationItemConfig[] {
  return adminNavigationItems.filter((item) => isNavItemAllowed(item, role));
}

/**
 * Returns bottom navigation items accessible to the resolved role.
 */
export function getBottomNavItemsForRole(role?: RoleInput): NavigationItemConfig[] {
  return bottomNavItems.filter((item) => isNavItemAllowed(item, role));
}

/**
 * Checks if a specific route path is permitted for the given role.
 */
export function hasRouteAccess(pathname: string, role?: RoleInput): boolean {
  const parsed = parseRole(role);

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // If it's selection status, management roles (Admin, Manager, HR) have access
    if (pathname.startsWith('/admin/selection-status')) {
      return hasRole(parsed, MANAGEMENT_ROLES);
    }
    // All other /admin routes require Admin or HR
    return isAdminOrHr(parsed);
  }

  return true;
}
