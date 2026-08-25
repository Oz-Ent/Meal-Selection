import apiClient from '../axios';

export interface Selection {
  id: number;
  createdBy: number;
  createdFor: number;
  weekMenuScheduleId: number;
  selectionStatus: 'PENDING' | 'SUBMITTED';
  selectionType?: 'MEAL' | 'UNAVAILABLE' | 'HOLIDAY';
  createdByUser: {
    id: number;
    name: string;
    email: string;
  };
  createdForUser: {
    id: number;
    name: string;
    email: string;
  };
  menuDay: {
    id: number;
    day: string;
  };
  dayMeal: {
    id: number;
    meal: {
      id: number;
      name: string;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSelectionRequest {
  id?: number;
  dayMealId?: number | null;
  selectionType?: 'MEAL' | 'UNAVAILABLE' | 'HOLIDAY';
  createdFor: number | null;
  guestCount?: number;
  weekMenuScheduleId: number;
  menuDayId: number;
}

export interface ReplaceWeeklyMealRequest {
  weekNumber: number;
  year: number;
  unavailableDayMealId: number;
  replacementDayMealId: number;
}

export interface ReplaceWeeklyMealResponse {
  affectedSelections: number;
  affectedHeadcount: number;
}

export interface ReplaceWeeklyMealsBatchRequest {
  weekNumber: number;
  year: number;
  replacements: Array<{
    unavailableDayMealId: number;
    replacementDayMealId: number;
  }>;
}

export interface UpdateSelectionRequest {
  dayMealId?: number | null;
  selectionType?: 'MEAL' | 'UNAVAILABLE' | 'HOLIDAY';
  createdBy?: number;
  createdFor?: number;
  weekMenuScheduleId?: number;
  menuDayId?: number;
}

export interface BatchUpdateItem {
  id: number;
  data: UpdateSelectionRequest;
}

export interface WeeklyUserMealSelection {
  id: number;
  mealName: string;
  mealID: number | null;
  mealImagePath: string | null;
  foodCode: string;
  calories: number | null;
  selectionType?: 'MEAL' | 'UNAVAILABLE' | 'HOLIDAY';
}

export interface WeeklyUserSelections {
  createdById: number;
  createdBy: string;
  createdForId: number;
  createdFor: string;
  selectionStatus: 'PENDING' | 'SUBMITTED';
  mealSelections: Partial<Record<string, WeeklyUserMealSelection>>;
}

export interface UserWithoutWeeklySelections {
  id: number;
  name: string;
  email: string;
}

export interface WeeklyReportUser {
  id: number | null;
  name: string;
  createdForName: string | null;
  createdByName: string | null;
  isGuest: boolean;
  quantity: number;
}

export interface WeeklyReportMeal {
  id: number;
  name: string;
  imagePath: string | null;
  calories: number | null;
  foodCode: string;
  count: number;
  users: WeeklyReportUser[];
}

export interface WeeklyReportHoliday {
  id?: number;
  title: string;
  description?: string | null;
  isCompany?: boolean;
  source?: string;
}

export interface WeeklyReportDay {
  total: number;
  isHoliday?: boolean;
  holidayTitle?: string | null;
  holiday?: WeeklyReportHoliday | null;
  response: WeeklyReportMeal[];
}

export type WeeklyMealReport = Record<string, WeeklyReportDay>;

export interface WeeklyHistoryFilterParams {
  page?: number;
  limit?: number;
  startWeek?: number;
  fromWeek?: number;
  startYear?: number;
  fromYear?: number;
  endWeek?: number;
  toWeek?: number;
  endYear?: number;
  toYear?: number;
  year?: number;
  order?: 'asc' | 'desc';
  userId?: number;
}

export interface HistoryPagination {
  page: number;
  limit: number;
  totalWeeks: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface WeeklyHistoryReportItem {
  weekMenuScheduleId: number;
  week: number;
  year: number;
  menu: {
    id: number;
    title: string;
  };
  status: string;
  totalResponses: number;
  selections: WeeklyMealReport;
}

export interface WeeklyHistoryReportResponse {
  pagination: HistoryPagination;
  data: WeeklyHistoryReportItem[];
}

export interface UserWeeklyHistoryItem {
  weekMenuScheduleId: number;
  week: number;
  year: number;
  menu: {
    id: number;
    title: string;
  };
  status: string;
  selection: WeeklyUserSelections;
}

export interface UserWeeklyHistoryResponse {
  pagination: HistoryPagination;
  data: UserWeeklyHistoryItem[];
}

export const mealSelectionService = {
  getAll: async (): Promise<Selection[]> => {
    const response = await apiClient.get<Selection[]>('/meal-selections');
    return response.data;
  },

  getById: async (id: number): Promise<Selection> => {
    const response = await apiClient.get<Selection>(`/meal-selections/${id}`);
    return response.data;
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<Selection[]> => {
    const response = await apiClient.get<Selection[]>('/meal-selections/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getByFilter: async (params: {
    userId?: number;
    mealId?: number;
    day?: string;
    menuId?: number;
  }): Promise<Selection[]> => {
    const response = await apiClient.get<Selection[]>('/meal-selections/filter', { params });
    return response.data;
  },

  getByUser: async (id: number): Promise<Selection[]> => {
    const response = await apiClient.get<Selection[]>(`/meal-selections/by-user/${id}`);
    return response.data;
  },

  getByMeal: async (id: number): Promise<Selection[]> => {
    const response = await apiClient.get<Selection[]>(`/meal-selections/by-meal/${id}`);
    return response.data;
  },

  getWeekly: async (date: string): Promise<WeeklyMealReport> => {
    const response = await apiClient.get<WeeklyMealReport>('/meal-selections/weekly', {
      params: { date },
    });
    return response.data;
  },

  getWeeklyByDate: async (date: string): Promise<Selection[]> => {
    const response = await apiClient.get<Selection[]>('/meal-selections/weekly/by-date', {
      params: { date },
    });
    return response.data;
  },

  getWeeklyByUser: async (id: number, date: string): Promise<WeeklyUserSelections> => {
    const response = await apiClient.get<WeeklyUserSelections>(
      `/meal-selections/weekly/by-user/${id}`,
      {
        params: { date },
      },
    );
    return response.data;
  },

  getWeeklyNoSelections: async (date: string): Promise<UserWithoutWeeklySelections[]> => {
    const response = await apiClient.get<UserWithoutWeeklySelections[]>(
      '/meal-selections/weekly/no-selections',
      {
        params: { date },
      },
    );
    return response.data;
  },

  getWeeklyHistory: async (params?: WeeklyHistoryFilterParams): Promise<WeeklyHistoryReportResponse> => {
    const response = await apiClient.get<WeeklyHistoryReportResponse>(
      '/meal-selections/history',
      { params },
    );
    return response.data;
  },

  getUserWeeklyHistory: async (
    userId?: number,
    params?: WeeklyHistoryFilterParams,
  ): Promise<UserWeeklyHistoryResponse> => {
    const url = userId
      ? `/meal-selections/history/by-user/${userId}`
      : '/meal-selections/history/user';
    const response = await apiClient.get<UserWeeklyHistoryResponse>(url, { params });
    return response.data;
  },

  create: async (data: CreateSelectionRequest): Promise<Selection> => {
    const response = await apiClient.post<Selection>('/meal-selections', data);
    return response.data;
  },

  createBatch: async (data: CreateSelectionRequest[]): Promise<{ count: number }> => {
    const response = await apiClient.put<{ count: number }>('/meal-selections/batch', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSelectionRequest): Promise<Selection> => {
    const response = await apiClient.put<Selection>(`/meal-selections/${id}`, data);
    return response.data;
  },

  updateBatch: async (data: BatchUpdateItem[]): Promise<Selection[]> => {
    const response = await apiClient.put<Selection[]>('/meal-selections/batch', data);
    return response.data;
  },

  submit: async (selectionIds: number[]): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>('/meal-selections/submit', {
      selectionIds,
    });
    return response.data;
  },

  submitWeekly: async (
    weekNumber: number,
    year: number,
    status: 'PENDING' | 'SUBMITTED' = 'SUBMITTED',
  ): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>('/meal-selections/submit-weekly', {
      weekNumber,
      year,
      status,
    });
    return response.data;
  },

  adminOverride: async (data: CreateSelectionRequest[]): Promise<{ updated: number }> => {
    const response = await apiClient.put<{ updated: number }>('/meal-selections/override', data);
    return response.data;
  },

  replaceWeeklyMeal: async (data: ReplaceWeeklyMealRequest): Promise<ReplaceWeeklyMealResponse> => {
    const response = await apiClient.patch<ReplaceWeeklyMealResponse>(
      '/meal-selections/replace-weekly-meal',
      data,
    );
    return response.data;
  },

  replaceWeeklyMeals: async (
    data: ReplaceWeeklyMealsBatchRequest,
  ): Promise<ReplaceWeeklyMealResponse> => {
    const response = await apiClient.patch<ReplaceWeeklyMealResponse>(
      '/meal-selections/replace-weekly-meals',
      data,
    );
    return response.data;
  },
};
