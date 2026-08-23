import apiClient from '../axios';

export interface Preset {
  id: number;
  name: string | null;
  description: string | null;
  isDefault: boolean;
  userId: number;
  menuId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PresetItem {
  id: number;
  presetId: number;
  menuDayId: number;
  dayMealId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PresetItemDetail extends PresetItem {
  menuDay: { day: string };
  menuDayMeals: {
    id: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    menuDayId: number;
    mealId: number;
    meal: {
      name: string;
      id: number;
    };
  };
}

export interface PresetWithDetails extends Preset {
  presetItems: PresetItemDetail[];
  presetItemsGrouped: {
    day: string;
    items: PresetItemDetail[];
  }[];
}

export interface CreatePresetItemData {
  menuDayId: number;
  dayMealId: number;
}

export interface CreatePresetRequest {
  name?: string;
  description?: string;
  isDefault?: boolean;
  menuId: number;
  userId?: number;
  presetItems?: CreatePresetItemData[];
}

export interface UpdatePresetRequest {
  name?: string;
  description?: string;
  isDefault?: boolean;
  menuId?: number;
  presetItems?: CreatePresetItemData[];
}

export interface CreatePresetItemRequest {
  presetId: number;
  menuDayId: number;
  dayMealId: number;
}

export interface UpdatePresetItemRequest {
  menuDayId?: number;
  dayMealId?: number;
}

export const presetService = {
  getAll: async (): Promise<Preset[]> => {
    const response = await apiClient.get<Preset[]>('/presets');
    return response.data;
  },

  getById: async (id: number): Promise<Preset> => {
    const response = await apiClient.get<Preset>(`/presets/${id}`);
    return response.data;
  },

  getByUser: async (id: number, menuId?: number): Promise<Preset[]> => {
    const response = await apiClient.get<Preset[]>(`/presets/by-user/${id}`, {
      params: menuId ? { menuId } : undefined,
    });
    return response.data;
  },

  getWithDetails: async (id: number): Promise<PresetWithDetails> => {
    const response = await apiClient.get<PresetWithDetails>(`/presets/with-details/${id}`);
    return response.data;
  },

  create: async (data: CreatePresetRequest): Promise<Preset> => {
    const response = await apiClient.post<Preset>('/presets', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePresetRequest): Promise<Preset> => {
    const response = await apiClient.put<Preset>(`/presets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/presets/${id}`);
    return response.data;
  },

  setDefault: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/presets/set-default`, {
      presetId: id,
    });
    return response.data;
  },

  getItems: async (presetId: number): Promise<PresetItem[]> => {
    const response = await apiClient.get<PresetItem[]>(`/presets/${presetId}/items`);
    return response.data;
  },

  createItem: async (data: CreatePresetItemRequest): Promise<PresetItem> => {
    const response = await apiClient.post<PresetItem>('/presets/items', data);
    return response.data;
  },

  createItemsBatch: async (data: CreatePresetItemRequest[]): Promise<{ count: number }> => {
    const response = await apiClient.post<{ count: number }>('/presets/items-batch', data);
    return response.data;
  },

  updateItem: async (id: number, data: UpdatePresetItemRequest): Promise<PresetItem> => {
    const response = await apiClient.put<PresetItem>(`/presets/items/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: number): Promise<PresetItem> => {
    const response = await apiClient.delete<PresetItem>(`/presets/items/${id}`);
    return response.data;
  },
};
