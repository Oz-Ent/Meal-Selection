import apiClient from '../axios';

export interface WeekMenuSchedule {
  id: number;
  week: number;
  year: number;
  menu: {
    id: number;
    title: string;
  };
  status: 'DRAFT' | 'ACTIVE' | 'LOCKED' | 'CLOSED';
}

export interface CreateWeekMenuScheduleRequest {
  week: number;
  year: number;
  menuId: number;
}

export interface UpdateWeekMenuScheduleRequest {
  menuId?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'LOCKED' | 'CLOSED';
}

export const weekMenuScheduleService = {
  getAll: async (): Promise<WeekMenuSchedule[]> => {
    const response = await apiClient.get<WeekMenuSchedule[]>('/week-menu-schedules');
    return response.data;
  },

  getById: async (id: number): Promise<WeekMenuSchedule> => {
    const response = await apiClient.get<WeekMenuSchedule>(`/week-menu-schedules/${id}`);
    return response.data;
  },

  getByWeekYear: async (week: number, year: number): Promise<WeekMenuSchedule> => {
    const response = await apiClient.get<WeekMenuSchedule>('/week-menu-schedules/by-week-year', {
      params: { week, year },
    });
    return response.data;
  },

  getByMenu: async (menuId: number): Promise<WeekMenuSchedule[]> => {
    const response = await apiClient.get<WeekMenuSchedule[]>('/week-menu-schedules/by-menu', {
      params: { menuId },
    });
    return response.data;
  },

  create: async (data: CreateWeekMenuScheduleRequest): Promise<WeekMenuSchedule> => {
    const response = await apiClient.post<WeekMenuSchedule>('/week-menu-schedules', data);
    return response.data;
  },

  update: async (id: number, data: UpdateWeekMenuScheduleRequest): Promise<WeekMenuSchedule> => {
    const response = await apiClient.put<WeekMenuSchedule>(`/week-menu-schedules/${id}`, data);
    return response.data;
  },
};
