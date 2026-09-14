import menuIcon from '../assets/admin/MenuIcon.webp';
import mealIcon from '../assets/admin/MenuFood.webp';
import reportIcon from '../assets/admin/SelectionsReports.webp';
import budgetsIcon from '../assets/admin/budgetsIcon.webp'
import holidaysIcon from '../assets/admin/HolidaySchedules.webp';
import foodAssignmentIcon from '../assets/admin/FoodAssignment.webp';
import {
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import type { ElementType } from 'react';

export interface ActivityCardConfig {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  href?: string;
  actionKey?: string;
  adminOnly?: boolean;
}

export interface ModalActionConfig {
  id: string;
  title: string;
  description?: string;
  actionKey: string;
  icon: ElementType;
  adminOnly?: boolean;
}



 export const adminActivitiesConfig = [
    {
      id: 'menus',
      title: 'Menus',
      description: 'Create custom menus and schedule them for your weekly meal planning.',
      image: menuIcon,
      path: '/admin/menu',
    },
    {
      id: 'meals',
      title: 'Meals',
      description: 'Create and manage the master library of dishes used to build your menus.',
      image: mealIcon,
      path: '/admin/meal',
    },
    {
      id: 'food-assignment',
      title: 'Food Assignment',
      description: 'Log arrived deliveries and distribute meals to assigned users for today.',
      image: foodAssignmentIcon,
      path: '/admin/selection-activity',
    },
    {
      id: 'selection-status',
      title: 'Selection Status',
      description: 'Track users pending meal choices and toggle weekly selection closure.',
      image: reportIcon,
      path: '/admin/selection-status',
    },
    {
      id: 'budgets',
      title: 'Budgets & Rates',
      description: 'Set company food budgets and adjust per-meal vendor catering rates.',
      image: budgetsIcon,
      path: '/admin/budgets',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track budget burn rates, delivery clock times, and meal spending.',
      image: reportIcon,
      path: '/admin/analytics',
    },
    {
      id: 'mark-holidays',
      title: 'Mark Holidays',
      description: 'Schedule and manage company holidays and view public holiday closures.',
      image: holidaysIcon,
      path: '/admin/holidays',
    },

  ];

export const selectMealModalActionsConfig: ModalActionConfig[] = [
  {
    id: 'select-for-self',
    title: 'Select for Myself',
    description: 'Submit your personal weekly meal choices.',
    actionKey: 'self',
    icon: UtensilsCrossed,
  },
  {
    id: 'select-for-guests',
    title: 'Select for Guests',
    description: 'Order visitor packs with custom quantities.',
    actionKey: 'guest',
    icon: Users,
    adminOnly: true,
  },
  {
    id: 'select-for-others',
    title: 'Select for Other Employees',
    description: 'Submit on behalf of one or more colleagues.',
    actionKey: 'others',
    icon: Users,
    adminOnly: true,
  },
];
