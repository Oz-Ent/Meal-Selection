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
  type ReplaceWeeklyMealsBatchRequest,
  type ReplaceWeeklyMealRequest,
  type WeeklyHistoryFilterParams,
} from './Services/MealSelectionServices';
import {
  menuService,
  type AssignMealsRequest,
  type CreateMenuRequest,
  type UpdateMenuRequest,
} from './Services/MenuServices';
import {
  presetService,
  type CreatePresetRequest,
  type UpdatePresetRequest,
} from './Services/PresetServices';
import { userService, type ChangePasswordRequest, type UpdateUserPreferencesRequest, type UpdateUserRequest } from './Services/UserServices';
import {
  weekMenuScheduleService,
  type CreateWeekMenuScheduleRequest,
  type UpdateWeekMenuScheduleRequest,
} from './Services/WeekMenuScheduleServices';
import {
  holidayService,
  type CreateHolidayRequest,
  type UpdateHolidayRequest,
  type HolidayOverrideRequest,
} from './Services/HolidayServices';
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

export const useMenuMealsQuery = (menuId: number, userId?: number) =>
  useQuery({
    queryKey: queryKeys.menuMeals(menuId, userId),
    queryFn: () => menuService.getMeals(menuId, userId),
    enabled: Number.isInteger(menuId) && menuId > 0,
  });

export const useMealDetailsQuery = (foodCode: string | null | undefined) =>
  useQuery({
    queryKey: queryKeys.mealDetails(foodCode ?? ''),
    queryFn: () => mealService.getDetails(foodCode!),
    enabled: Boolean(foodCode),
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

export const usePresetsQuery = () =>
  useQuery({ queryKey: queryKeys.presets, queryFn: presetService.getAll });

export const usePresetsByUserQuery = (userId: number | undefined) =>
  useQuery({
    queryKey: queryKeys.presetsByUser(userId ?? 0),
    queryFn: () => presetService.getByUser(userId!),
    enabled: Boolean(userId),
  });

export const usePresetWithDetailsQuery = (presetId: number | undefined) =>
  useQuery({
    queryKey: queryKeys.preset(presetId ?? 0),
    queryFn: () => presetService.getWithDetails(presetId!),
    enabled: Boolean(presetId),
  });

export const useWeeklySelectionsQuery = (userId: number | undefined, date: string) =>
  useQuery({
    queryKey: queryKeys.weeklySelections(userId ?? 0, date),
    queryFn: () => mealSelectionService.getWeeklyByUser(userId!, date),
    enabled: Boolean(userId),
  });

export const useWeeklyMealReportQuery = (date: string) =>
  useQuery({
    queryKey: queryKeys.weeklyMealReport(date),
    queryFn: () => mealSelectionService.getWeekly(date),
    enabled: Boolean(date),
    retry: false,
  });

export const useWeeklyNoSelectionsQuery = (date: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.weeklyNoSelections(date),
    queryFn: () => mealSelectionService.getWeeklyNoSelections(date),
    enabled: options?.enabled ?? Boolean(date),
  });

export const useWeeklyWithSelectionsQuery = (date: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.weeklyWithSelections(date),
    queryFn: () => mealSelectionService.getWeeklyWithSelections(date),
    enabled: options?.enabled ?? Boolean(date),
  });

export const useWeeklyGuestSelectionsQuery = (date: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.weeklyGuestSelections(date),
    queryFn: () => mealSelectionService.getWeeklyGuestSelections(date),
    enabled: options?.enabled ?? Boolean(date),
  });

export const useWeeklyHistoryQuery = (params?: WeeklyHistoryFilterParams) =>
  useQuery({
    queryKey: queryKeys.weeklyHistory(params),
    queryFn: () => mealSelectionService.getWeeklyHistory(params),
  });

export const useUserWeeklyHistoryQuery = (
  userId?: number,
  params?: WeeklyHistoryFilterParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: queryKeys.userWeeklyHistory(userId, params),
    queryFn: () => mealSelectionService.getUserWeeklyHistory(userId, params),
    enabled: options?.enabled ?? true,
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.menuMeals(createdMenu.id) });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weekSchedules });
      queryClient.invalidateQueries({ queryKey: ['week-schedule'] });
    },
  });
};

export const useUpdateWeekScheduleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWeekMenuScheduleRequest }) =>
      weekMenuScheduleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weekSchedules });
      queryClient.invalidateQueries({ queryKey: ['week-schedule'] });
    },
  });
};

export const useCreateMealSelectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSelectionRequest[]) => mealSelectionService.createBatch(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-selections'] }),
  });
};

export const useAdminOverrideSelectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSelectionRequest[]) => mealSelectionService.adminOverride(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-selections'] }),
  });
};

export const useReplaceWeeklyMealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReplaceWeeklyMealRequest) => mealSelectionService.replaceWeeklyMeal(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-selections'] }),
  });
};

export const useReplaceWeeklyMealsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReplaceWeeklyMealsBatchRequest) =>
      mealSelectionService.replaceWeeklyMeals(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meal-selections'] }),
  });
};

export const useSubmitWeeklySelectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      weekNumber,
      year,
      status,
    }: {
      weekNumber: number;
      year: number;
      status?: 'PENDING' | 'SUBMITTED';
    }) => mealSelectionService.submitWeekly(weekNumber, year, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meal-selections'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.weekSchedules });
    },
  });
};

export const useCreatePresetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePresetRequest) => presetService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.presets }),
  });
};

export const useUpdatePresetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePresetRequest }) =>
      presetService.update(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.presets });
      void queryClient.invalidateQueries({ queryKey: queryKeys.preset(id) });
    },
  });
};

export const useDeletePresetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => presetService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.presets });
    },
  });
};

export const useSetDefaultPresetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => presetService.setDefault(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.presets });
    },
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

export const useHolidaysQuery = (year?: number) =>
  useQuery({
    queryKey: queryKeys.holidays(year),
    queryFn: () => holidayService.getAll(year),
  });

export const useWeeklyHolidaysQuery = (week: number, year: number) =>
  useQuery({
    queryKey: queryKeys.weeklyHolidays(week, year),
    queryFn: () => holidayService.getWeeklyHolidays(week, year),
    enabled: week > 0 && year > 0,
  });

export const useCreateHolidayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHolidayRequest) => holidayService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};

export const useUpdateHolidayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHolidayRequest }) =>
      holidayService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};

export const useDeleteHolidayMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => holidayService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};

export const useHolidayOverridesQuery = (year?: number) =>
  useQuery({
    queryKey: ['holidays', 'overrides', year],
    queryFn: () => holidayService.getOverrides(year),
  });

export const useCreateHolidayOverrideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HolidayOverrideRequest) => holidayService.createOrUpdateOverride(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};

export const useDeleteHolidayOverrideMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => holidayService.deleteOverride(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
};

export const useUserProfileQuery = () =>
  useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => userService.getProfile(),
  });

export const useUserLeavesQuery = (userId: number | undefined, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: queryKeys.userLeaves(userId ?? 0),
    queryFn: () => userService.getUserLeaves(userId!),
    enabled: (options?.enabled ?? true) && Boolean(userId),
  });


export const useUpdateUserProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) => userService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() });
    },
  });
};

export const useUserPreferencesQuery = () =>
  useQuery({
    queryKey: queryKeys.userPreferences(),
    queryFn: () => userService.getPreferences(),
  });

export const useUpdateUserPreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserPreferencesRequest) => userService.updatePreferences(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userPreferences() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() });
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userService.changePassword(data),
  });
};

export const useDeleteGuestSelectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, count }: { id: number; count?: number }) =>
      mealSelectionService.deleteGuestSelection(id, count),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meal-selections'] });
    },
  });
};

export const useBulkDeleteGuestSelectionsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => mealSelectionService.bulkDeleteGuestSelections(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['meal-selections'] });
    },
  });
};



