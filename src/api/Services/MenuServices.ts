import apiClient from '../axios';
import type { Meal } from './MealServices';

export interface Menu {
  id: number;
  title: string;
  description: string | null;
  isActive: boolean;
  order?: number;
}

export interface MenuDetail extends Menu {
  isActive: boolean;
  createdAt: string;
}

export interface MenuDay {
  id: number;
  day: string;
}

export interface MenuDayMeal {
  id: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  menuDayId: number;
  meal: Pick<Meal, 'id' | 'imagePath' | 'name' | 'description' | 'foodCode' | 'calories'>;
}

export interface CreateMenuRequest {
  title: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateMenuRequest {
  title?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface AssignMealsRequest {
  menuDayId: number;
  meals: number[];
}

export const menuService = {
  getAll: async (): Promise<Menu[]> => {
    const response = await apiClient.get<Menu[]>('/menus');
    return response.data;
  },

  getById: async (id: number): Promise<Menu> => {
    const response = await apiClient.get<Menu>(`/menus/${id}`);
    return response.data;
  },

  getMeals: async (id: number, userId?: number): Promise<MenuDayMeal[]> => {
    const response = await apiClient.get<MenuDayMeal[]>(`/menus/${id}/meals`,{
      params: {
        userId,
      }
    });
    return response.data;
  },

  getDays: async (id: number): Promise<MenuDay[]> => {
    const response = await apiClient.get<MenuDay[]>(`/menus/days/${id}`);
    return response.data;
  },

  create: async (data: CreateMenuRequest): Promise<Menu> => {
    const response = await apiClient.post<Menu>('/menus', data);
    return response.data;
  },

  assignMeals: async (data: AssignMealsRequest[]): Promise<{ count: number }> => {
    const response = await apiClient.post<{ count: number }>('/menus/meals', data);
    return response.data;
  },

  update: async (id: number, data: UpdateMenuRequest): Promise<MenuDetail> => {
    const response = await apiClient.put<MenuDetail>(`/menus/${id}`, data);
    return response.data;
  },

  toggleMealStatus: async (id: number, isActive: boolean): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/menus/meals/${id}`, { isActive });
    return response.data;
  },

  delete: async (id: number): Promise<MenuDetail> => {
    const response = await apiClient.delete<MenuDetail>(`/menus/${id}`);
    return response.data;
  },
};
