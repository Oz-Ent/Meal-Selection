import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  type GeneratePasswordTokenRequest,
  type LoginRequest,
  type OnboardingRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
  type VerifyOTPRequest,
} from './Services/AuthServices';
import {
  foodLibraryService,
  type CreateFoodItemRequest,
  type FoodGroup,
} from './Services/FoodLibraryServices';
import {
  mealService,
  type CreateMealRequest,
  type UpdateMealRequest,
} from './Services/MealServices';
import {
  mealSelectionService,
  type CreateSelectionRequest,
} from './Services/MealSelectionServices';
import {
  menuService,
  type AssignMealsRequest,
  type CreateMenuRequest,
  type UpdateMenuRequest,
} from './Services/MenuServices';
import { userService } from './Services/UserServices';
import {
  weekMenuScheduleService,
  type CreateWeekMenuScheduleRequest,
  type UpdateWeekMenuScheduleRequest,
} from './Services/WeekMenuScheduleServices';
import { queryKeys } from './queryKeys';

export const useMealsQuery = () =>
  useQuery({ queryKey: queryKeys.meals, queryFn: mealService.getAll });

export const useFoodLibraryQuery = () =>
  useQuery({ queryKey: queryKeys.foodLibrary, queryFn: foodLibraryService.getAll });

export const useFoodLibraryByGroupQuery = (foodGroup: FoodGroup) =>
  useQuery({
    queryKey: [...queryKeys.foodLibrary, foodGroup],
    queryFn: () => foodLibraryService.getByFoodGroup(foodGroup),
  });

export const useMenusQuery = () =>
  useQuery({ queryKey: queryKeys.menus, queryFn: menuService.getAll });

export const useMenuQuery = (menuId: number) =>
  useQuery({
    queryKey: queryKeys.menu(menuId),
    queryFn: () => menuService.getById(menuId),
    enabled: Number.isInteger(menuId) && menuId > 0,
  });

export const useMenuDaysQuery = (menuId: number) =>
  useQuery({
    queryKey: queryKeys.menuDays(menuId),
    queryFn: () => menuService.getDays(menuId),
    enabled: Number.isInteger(menuId) && menuId > 0,
  });

export const useMenuMealsQuery = (menuId: number) =>
  useQuery({
    queryKey: queryKeys.menuMeals(menuId),
    queryFn: () => menuService.getMeals(menuId),
    enabled: Number.isInteger(menuId) && menuId > 0,
  });

export const useWeekSchedulesQuery = () =>
  useQuery({ queryKey: queryKeys.weekSchedules, queryFn: weekMenuScheduleService.getAll });

export const useWeekScheduleQuery = (week: number, year: number) =>
  useQuery({
    queryKey: queryKeys.weekSchedule(week, year),
    queryFn: () => weekMenuScheduleService.getByWeekYear(week, year),
    enabled: Number.isInteger(week) && Number.isInteger(year),
    retry: false,
  });

export const useUsersQuery = () =>
  useQuery({ queryKey: queryKeys.users, queryFn: userService.getAll });

export const useWeeklySelectionsQuery = (userId: number | undefined, date: string) =>
  useQuery({
    queryKey: queryKeys.weeklySelections(userId ?? 0, date),
    queryFn: () => mealSelectionService.getWeeklyByUser(userId!, date),
    enabled: Boolean(userId),
  });

export const useCreateMealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, imageFile }: { data: CreateMealRequest; imageFile?: File | null }) =>
      mealService.create(data, imageFile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.meals }),
  });
};

export const useUpdateMealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      imageFile,
    }: {
      id: number;
      data: UpdateMealRequest;
      imageFile?: File | null;
    }) => mealService.update(id, data, imageFile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.meals }),
  });
};

export const useDeleteMealsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealIds: number[]) =>
      Promise.all(mealIds.map((mealId) => mealService.delete(mealId))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.meals }),
  });
};

export const useCreateMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuRequest) => menuService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.menus }),
  });
};

export const useCreateMenuWithAssignmentsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      menu,
      mealIdsByDay,
    }: {
      menu: CreateMenuRequest;
      mealIdsByDay: Record<string, number[]>;
    }) => {
      const createdMenu = await menuService.create(menu);
      const menuDays = await queryClient.fetchQuery({
        queryKey: queryKeys.menuDays(createdMenu.id),
        queryFn: () => menuService.getDays(createdMenu.id),
      });
      const assignments = menuDays.map((day) => ({
        menuDayId: day.id,
        meals: mealIdsByDay[day.day] ?? [],
      }));
      await menuService.assignMeals(assignments);
      return createdMenu;
    },
    onSuccess: (createdMenu) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.menus });
      void queryClient.invalidateQueries({ queryKey: queryKeys.menuDays(createdMenu.id) });
    },
  });
};

export const useUpdateMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMenuRequest }) =>
      menuService.update(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.menus });
      void queryClient.invalidateQueries({ queryKey: queryKeys.menu(id) });
    },
  });
};

export const useDeleteMenuMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (menuId: number) => menuService.delete(menuId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.menus }),
  });
};

export const useAssignMealsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignments }: { menuId: number; assignments: AssignMealsRequest[] }) =>
      menuService.assignMeals(assignments),
    onSuccess: (_, { menuId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.menuMeals(menuId) }),
  });
};

export const useToggleMenuMealStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean; menuId: number }) =>
      menuService.toggleMealStatus(id, isActive),
    onSuccess: (_, { menuId }) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.menuMeals(menuId) }),
  });
};

export const useCreateWeekScheduleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWeekMenuScheduleRequest) => weekMenuScheduleService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.weekSchedules }),
  });
};

export const useUpdateWeekScheduleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWeekMenuScheduleRequest }) =>
      weekMenuScheduleService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.weekSchedules }),
  });
};

export const useCreateMealSelectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSelectionRequest[]) => mealSelectionService.createBatch(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-selections'] }),
  });
};

export const useLoginMutation = () =>
  useMutation({ mutationFn: (data: LoginRequest) => authService.login(data) });

export const useRegisterMutation = () =>
  useMutation({ mutationFn: (data: RegisterRequest) => authService.register(data) });

export const useOnboardingMutation = () =>
  useMutation({ mutationFn: (data: OnboardingRequest) => authService.onboarding(data) });

export const useGeneratePasswordTokenMutation = () =>
  useMutation({
    mutationFn: (data: GeneratePasswordTokenRequest) => authService.generatePasswordToken(data),
  });

export const useVerifyOtpMutation = () =>
  useMutation({ mutationFn: (data: VerifyOTPRequest) => authService.verifyOtp(data) });

export const useResetPasswordMutation = () =>
  useMutation({ mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data) });

export const useCreateFoodItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFoodItemRequest) => foodLibraryService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.foodLibrary }),
  });
};
