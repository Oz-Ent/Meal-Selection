export const queryKeys = {
  meals: ['meals'] as const,
  foodLibrary: ['food-library'] as const,
  menus: ['menus'] as const,
  menu: (menuId: number) => ['menus', menuId] as const,
  menuDays: (menuId: number) => ['menus', menuId, 'days'] as const,
  menuMeals: (menuId: number) => ['menus', menuId, 'meals'] as const,
  weekSchedules: ['week-menu-schedules'] as const,
  weekSchedule: (week: number, year: number) =>
    ['week-menu-schedules', 'by-week-year', week, year] as const,
  users: ['users'] as const,
  weeklySelections: (userId: number, date: string) =>
    ['meal-selections', 'weekly', userId, date] as const,
};