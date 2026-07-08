import apiClient from "../axios";

export type FoodGroup = "SUPERGROUP" | "BASE" | "PROTEIN" | "PREP";

export interface FoodItem {
  id: number;
  name: string;
  foodCode: string;
  foodGroup: FoodGroup;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodItemRequest {
  name: string;
  foodCode: string;
  foodGroup: FoodGroup;
}

export const foodLibraryService = {
  getAll: async (): Promise<FoodItem[]> => {
    const response = await apiClient.get<FoodItem[]>("/food-library");
    return response.data;
  },

  getByFoodGroup: async (foodGroup: FoodGroup): Promise<FoodItem[]> => {
    const response = await apiClient.get<FoodItem[]>(`/food-library/${foodGroup}`);
    return response.data;
  },

  create: async (data: CreateFoodItemRequest): Promise<string> => {
    const response = await apiClient.post<string>("/food-library", data);
    return response.data;
  },

  createBatch: async (data: CreateFoodItemRequest[]): Promise<{ count: number }> => {
    const response = await apiClient.post<{ count: number }>("/food-library/batch", data);
    return response.data;
  },
};
