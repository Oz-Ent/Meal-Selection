import apiClient from '../axios';

export interface Meal {
  id: number;
  imagePath: string | null;
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
  imagePath?: string | null;
  isActive?: boolean;
  foodCode: string;
  calories?: number;
  description?: string;
}

export interface UpdateMealRequest {
  name?: string;
  imagePath?: string | null;
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


export interface MealDetailsResponse{
  name: string
  description: string
  imagePath: string
  calories: number
  ingredients: {
    name: string
    foodGroup: string
  }[]
}
// Builds a multipart payload when an image file must be uploaded alongside the
// meal fields. The backend meal endpoints accept the file under the "image"
// field and store the resulting public URL as imagePath.
const buildMealFormData = (
  data: CreateMealRequest | UpdateMealRequest,
  imageFile: File,
): FormData => {
  const formData = new FormData();
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.foodCode !== undefined) formData.append('foodCode', data.foodCode);
  if (data.calories !== undefined && data.calories !== null)
    formData.append('calories', String(data.calories));
  if (data.description !== undefined && data.description !== null)
    formData.append('description', data.description);
  if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
  formData.append('image', imageFile);
  return formData;
};

export const mealService = {
  getAll: async (): Promise<MealListResponse> => {
    const response = await apiClient.get<MealListResponse>('/meals');
    return response.data;
  },

  getById: async (id: number): Promise<MealResponse> => {
    const response = await apiClient.get<MealResponse>(`/meals/${id}`);
    return response.data;
  },

  getDetails: async(foodCode: string): Promise<MealDetailsResponse>=>{
    const response = await apiClient.get<{mealDetails: MealDetailsResponse}>(`/meals/details/${foodCode}`)
    return response.data.mealDetails;
  },
  create: async (data: CreateMealRequest, imageFile?: File | null): Promise<MealResponse> => {
    if (imageFile) {
      const response = await apiClient.post<MealResponse>(
        '/meals',
        buildMealFormData(data, imageFile),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return response.data;
    }
    const response = await apiClient.post<MealResponse>('/meals', data);
    return response.data;
  },

  createBatch: async (data: CreateMealRequest[]): Promise<BatchMealResponse> => {
    const response = await apiClient.post<BatchMealResponse>('/meals/batch', data);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateMealRequest,
    imageFile?: File | null,
  ): Promise<MealResponse> => {
    if (imageFile) {
      const response = await apiClient.put<MealResponse>(
        `/meals/${id}`,
        buildMealFormData(data, imageFile),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      return response.data;
    }
    const response = await apiClient.put<MealResponse>(`/meals/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<MealResponse> => {
    const response = await apiClient.delete<MealResponse>(`/meals/${id}`);
    return response.data;
  },
};
