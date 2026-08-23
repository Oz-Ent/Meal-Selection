import apiClient from '../axios';

export interface HolidayItem {
  id?: number;
  title: string;
  description?: string | null;
  date: string; // YYYY-MM-DD
  endDate?: string | null;
  dayName: string; // MONDAY, TUESDAY, etc.
  isCompany: boolean;
  source: 'COMPANY' | 'PUBLIC' | 'EXTERNAL_API' | 'GOOGLE_CALENDAR';
  isOverridden?: boolean;
  isIgnored?: boolean;
  adjustedDate?: string | null;
  overrideId?: number;
}

export interface HolidayOverrideItem {
  id: number;
  originalDate: string;
  title: string;
  year: number;
  isIgnored: boolean;
  adjustedDate?: string | null;
  adjustedDayName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AllHolidaysResponse {
  companyHolidays: HolidayItem[];
  publicHolidays: HolidayItem[];
  overrides: HolidayOverrideItem[];
}

export interface CreateHolidayRequest {
  title: string;
  description?: string;
  year?: number;
  startDate: string;
  endDate?: string | null;
  isCompany?: boolean;
}

export interface UpdateHolidayRequest {
  title?: string;
  description?: string;
  year?: number;
  startDate?: string;
  endDate?: string | null;
  isCompany?: boolean;
}

export interface HolidayOverrideRequest {
  originalDate: string;
  title: string;
  year?: number;
  isIgnored?: boolean;
  adjustedDate?: string | null;
  notes?: string | null;
}

export const holidayService = {
  getAll: async (year?: number): Promise<AllHolidaysResponse> => {
    const response = await apiClient.get<AllHolidaysResponse>('/holidays', {
      params: year ? { year } : undefined,
    });
    return response.data;
  },

  getWeeklyHolidays: async (week: number, year: number): Promise<HolidayItem[]> => {
    const response = await apiClient.get<HolidayItem[]>('/holidays/week', {
      params: { week, year },
    });
    return response.data;
  },

  create: async (data: CreateHolidayRequest): Promise<HolidayItem> => {
    const response = await apiClient.post<HolidayItem>('/holidays', data);
    return response.data;
  },

  update: async (id: number, data: UpdateHolidayRequest): Promise<HolidayItem> => {
    const response = await apiClient.put<HolidayItem>(`/holidays/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/holidays/${id}`);
    return response.data;
  },

  // Overrides
  getOverrides: async (year?: number): Promise<HolidayOverrideItem[]> => {
    const response = await apiClient.get<HolidayOverrideItem[]>('/holidays/overrides', {
      params: year ? { year } : undefined,
    });
    return response.data;
  },

  createOrUpdateOverride: async (data: HolidayOverrideRequest): Promise<HolidayOverrideItem> => {
    const response = await apiClient.post<HolidayOverrideItem>('/holidays/override', data);
    return response.data;
  },

  deleteOverride: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/holidays/override/${id}`);
    return response.data;
  },
};
