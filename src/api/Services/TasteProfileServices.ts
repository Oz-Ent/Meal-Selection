import apiClient from "../axios";

export interface TasteProfile {
  userId: number;
  calendarYear: number;
  totalMealsSelected: number;
  metrics: {
    proteinPreference: Record<string, number>;
    basePreference: Record<string, number>;
  };
  personalityType: string;
  favoriteProtein: string;
  updatedAt: string;
}

export const tasteProfileService = {
  getByUserId: async (id: number): Promise<TasteProfile[]> => {
    const response = await apiClient.get<TasteProfile[]>(`/users/taste-profiles/${id}`);
    return response.data;
  },
};
