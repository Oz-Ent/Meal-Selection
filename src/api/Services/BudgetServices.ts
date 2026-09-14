import apiClient from '../axios';

export interface Budget {
  id: number;
  title: string;
  description: string | null;
  startPeriod: string;
  endPeriod: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDto {
  title: string;
  description?: string | null;
  startPeriod: string;
  endPeriod: string;
  amount: number;
}

export type UpdateBudgetDto = Partial<CreateBudgetDto>;

export interface ExpenditurePeriod {
  id: number;
  type: 'MEAL';
  cost: number;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenditureDto {
  type?: 'MEAL';
  cost: number;
  startDate: string;
  endDate: string;
}

export type UpdateExpenditureDto = Partial<CreateExpenditureDto>;

export const budgetService = {
  getAll: async (params?: { date?: string; startDate?: string; endDate?: string }): Promise<Budget[]> => {
    const response = await apiClient.get<Budget[]>('/budgets', { params });
    return response.data;
  },

  getActive: async (date?: string): Promise<Budget | null> => {
    const response = await apiClient.get<Budget | null>('/budgets/active', {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  getById: async (id: number): Promise<Budget> => {
    const response = await apiClient.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  create: async (data: CreateBudgetDto): Promise<Budget> => {
    const response = await apiClient.post<Budget>('/budgets', data);
    return response.data;
  },

  update: async (id: number, data: UpdateBudgetDto): Promise<Budget> => {
    const response = await apiClient.patch<Budget>(`/budgets/${id}`, data);
    return response.data;
  },
};

export const expenditureService = {
  getAll: async (params?: { date?: string; startDate?: string; endDate?: string }): Promise<ExpenditurePeriod[]> => {
    const response = await apiClient.get<ExpenditurePeriod[]>('/expenditures', { params });
    return response.data;
  },

  getActive: async (date?: string): Promise<ExpenditurePeriod | null> => {
    const response = await apiClient.get<ExpenditurePeriod | null>('/expenditures/active', {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  getById: async (id: number): Promise<ExpenditurePeriod> => {
    const response = await apiClient.get<ExpenditurePeriod>(`/expenditures/${id}`);
    return response.data;
  },

  create: async (data: CreateExpenditureDto): Promise<ExpenditurePeriod> => {
    const response = await apiClient.post<ExpenditurePeriod>('/expenditures', data);
    return response.data;
  },

  update: async (id: number, data: UpdateExpenditureDto): Promise<ExpenditurePeriod> => {
    const response = await apiClient.patch<ExpenditurePeriod>(`/expenditures/${id}`, data);
    return response.data;
  },
};
