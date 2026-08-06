import apiClient from '../axios';

export interface Selection {
  id: number;
  createdBy: number;
  createdFor: number;
  weekMenuScheduleId: number;
  selectionStatus: 'PENDING' | 'SUBMITTED';
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
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSelectionRequest {
  dayMealId: number;
  createdBy: number;
  createdFor: number;
  weekMenuScheduleId: number;
  menuDayId: number;
}

export interface UpdateSelectionRequest {
  dayMealId?: number;
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
  mealID: number;
  mealImagePath: string | null;
  foodCode: string;
  calories: number | null;
}

export interface WeeklyUserSelections {
  createdById: number;
  createdBy: string;
  createdForId: number;
  createdFor: string;
  selectionStatus: 'PENDING' | 'SUBMITTED';
  mealSelections: Partial<Record<string, WeeklyUserMealSelection>>;
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

  getWeekly: async (date: string): Promise<Selection[]> => {
    const response = await apiClient.get<Selection[]>('/meal-selections/weekly', {
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

  getWeeklyNoSelections: async (date: string): Promise<{ id: number }[]> => {
    const response = await apiClient.get<{ id: number }[]>(
      '/meal-selections/weekly/no-selections',
      {
        params: { date },
      },
    );
    return response.data;
  },

  create: async (data: CreateSelectionRequest): Promise<Selection> => {
    const response = await apiClient.post<Selection>('/meal-selections', data);
    return response.data;
  },

  createBatch: async (data: CreateSelectionRequest[]): Promise<{ count: number }> => {
    const response = await apiClient.post<{ count: number }>('/meal-selections/batch', data);
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

  submitWeekly: async (weekNumber: number, year: number): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>('/meal-selections/submit-weekly', {
      weekNumber,
      year,
    });
    return response.data;
  },
};
