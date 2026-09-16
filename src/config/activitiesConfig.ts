import menuIcon from '../assets/admin/MenuIcon.webp';
import mealIcon from '../assets/admin/MenuFood.webp';
import reportIcon from '../assets/admin/SelectionsReports.webp';
import budgetsIcon from '../assets/admin/budgetsIcon.webp';
import holidaysIcon from '../assets/admin/HolidaySchedules.webp';
import foodAssignmentIcon from '../assets/admin/FoodAssignment.webp';
import SelectMealIcon from '../assets/admin/MenuIcon.webp';
import PresetsIcon from '../assets/admin/PresetsIcon.webp';
import { Users, UtensilsCrossed } from 'lucide-react';
import type { ElementType } from 'react';
import { Role, type RoleInput } from '../utils/Enums/Roles';
import { getItemsForRole } from './navigationConfig';

export interface AdminActivityConfig {
  id: string;
  title: string;
  description: string;
  image: string;
  path: string;
  roles: readonly Role[];
}

export const adminActivitiesConfig: readonly AdminActivityConfig[] = [
  {
    id: 'menus',
    title: 'Menus',
    description: 'Create custom menus and schedule them for your weekly meal planning.',
    image: menuIcon,
    path: '/admin/menu',
    roles: [Role.admin, Role.hr, Role.worker],
  },
  {
    id: 'meals',
    title: 'Meals',
    description: 'Create and manage the master library of dishes used to build your menus.',
    image: mealIcon,
    path: '/admin/meal',
    roles: [Role.admin, Role.hr, Role.worker],
  },
  {
    id: 'food-assignment',
    title: 'Food Assignment',
    description: 'Log arrived deliveries and distribute meals to assigned users for today.',
    image: foodAssignmentIcon,
    path: '/admin/selection-activity',
    roles: [Role.admin, Role.hr, Role.worker],
  },
  {
    id: 'selection-status',
    title: 'Selection Status',
    description: 'Track users pending meal choices and toggle weekly selection closure.',
    image: reportIcon,
    path: '/admin/selection-status',
    roles: [Role.admin, Role.hr, Role.manager],
  },
  {
    id: 'budgets',
    title: 'Budgets & Rates',
    description: 'Set company food budgets and adjust per-meal vendor catering rates.',
    image: budgetsIcon,
    path: '/admin/budgets',
    roles: [Role.admin, Role.manager],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'Track budget burn rates, delivery clock times, and meal spending.',
    image: reportIcon,
    path: '/admin/analytics',
    roles: [Role.admin, Role.hr, Role.manager],
  },
  {
    id: 'mark-holidays',
    title: 'Mark Holidays',
    description: 'Schedule and manage company holidays and view public holiday closures.',
    image: holidaysIcon,
    path: '/admin/holidays',
    roles: [Role.admin, Role.hr],
  },
];

export interface MenuCardConfig {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  path?: string;
  actionKey?: string;
  roles: readonly Role[];
}

export const menuCardsConfig: readonly MenuCardConfig[] = [
  {
    id: 'select-meals',
    label: 'Select Meals',
    subtitle: 'Pick dishes for the upcoming week for yourself or on behalf of other users.',
    icon: SelectMealIcon,
    actionKey: 'select-meals',
    roles: [Role.admin, Role.hr, Role.manager, Role.worker, Role.user],
  },
  {
    id: 'preset-meals',
    label: 'Preset Meals',
    subtitle: 'Create reusable dish combo templates to avoid repetitive meal selections.',
    icon: PresetsIcon,
    path: '/preset-meals',
    roles: [Role.admin, Role.hr, Role.manager, Role.worker, Role.user],
  },
];

export interface ModalActionConfig {
  id: string;
  title: string;
  description?: string;
  actionKey: string;
  icon: ElementType;
  roles: readonly Role[];
}

export const selectMealModalActionsConfig: readonly ModalActionConfig[] = [
  {
    id: 'select-for-self',
    title: 'Select for Myself',
    description: 'Submit your personal weekly meal choices.',
    actionKey: 'self',
    icon: UtensilsCrossed,
    roles: [Role.admin, Role.hr, Role.manager, Role.worker, Role.user],
  },
  {
    id: 'select-for-guests',
    title: 'Select for Guests',
    description: 'Order visitor packs with custom quantities.',
    actionKey: 'guest',
    icon: Users,
    roles: [Role.admin, Role.hr],
  },
  {
    id: 'select-for-others',
    title: 'Select for Other Employees',
    description: 'Submit on behalf of one or more colleagues.',
    actionKey: 'others',
    icon: Users,
    roles: [Role.admin, Role.hr, Role.user, Role.user],
  },
];

export function getAdminActivitiesForRole(
  role?: RoleInput,
): AdminActivityConfig[] {
  return getItemsForRole(adminActivitiesConfig, role);
}

export function getMenuCardsForRole(
  role?: RoleInput,
): MenuCardConfig[] {
  return getItemsForRole(menuCardsConfig, role);
}

export function getModalActionsForRole(
  role?: RoleInput,
): ModalActionConfig[] {
  return getItemsForRole(selectMealModalActionsConfig, role);
}
