import apiClient from "../axios";

export interface Meal {
  id: number;
  image: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  foodCode: string;
  calories: number | null;
}

export interface CreateMealRequest {
  name: string;
  image?: string;
  isActive?: boolean;
  foodCode: string;
  calories?: number;
  description?: string;
}

export interface UpdateMealRequest {
  name?: string;
  image?: string;
  isActive?: boolean;
  foodCode?: string;
  calories?: number;
  description?: string;
}

export interface MealListResponse {
  message: string;
  meals: Meal[];
}

export interface MealResponse {
  message: string;
  meal: Meal;
}

export interface BatchMealResponse {
  message: string;
  meal: { count: number };
}

export const mealService = {
  getAll: async (): Promise<MealListResponse> => {
    const response = await apiClient.get<MealListResponse>("/meals");
    return response.data;
  },

  getById: async (id: number): Promise<MealResponse> => {
    const response = await apiClient.get<MealResponse>(`/meals/${id}`);
    return response.data;
  },

  create: async (data: CreateMealRequest): Promise<MealResponse> => {
    const response = await apiClient.post<MealResponse>("/meals", data);
    return response.data;
  },

  createBatch: async (data: CreateMealRequest[]): Promise<BatchMealResponse> => {
    const response = await apiClient.post<BatchMealResponse>("/meals/batch", data);
    return response.data;
  },

  update: async (id: number, data: UpdateMealRequest): Promise<MealResponse> => {
    const response = await apiClient.put<MealResponse>(`/meals/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<MealResponse> => {
    const response = await apiClient.delete<MealResponse>(`/meals/${id}`);
    return response.data;
  },
};
