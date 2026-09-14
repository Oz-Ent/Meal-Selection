import apiClient from '../axios';

export interface DashboardAnalyticsResponse {
  period: {
    startDate: string;
    endDate: string;
    asOfDate: string;
    daysTotal: number;
    daysElapsed: number;
  };
  budget: {
    id: number | null;
    title: string | null;
    totalBudget: number;
    consumed: number;
    remaining: number;
    consumptionPercentage: number;
    status: 'SURPLUS' | 'OVERSPENT' | 'BALANCED';
    dailyBurnRate: number;
    projectedTotalSpend: number;
    projectedStatus: 'PROJECTED_SURPLUS' | 'PROJECTED_OVERSPENT' | 'ON_TRACK';
  };
  selections: {
    total: number;
    fulfilled: number;
    notFulfilled: number;
    pending: number;
    fulfillmentRatePercentage: number;
    averageFulfillmentTimeOfDay: string | null;
    averageFulfillmentDurationMinutes: number | null;
  };
  weeklyExpenditure: Array<{
    week: number;
    year: number;
    weekStart: string;
    weekEnd: string;
    totalPortions: number;
    unitCost: number;
    totalCost: number;
    fulfilledCount: number;
  }>;
  dayOfWeekExpenditure: Array<{
    day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    portions: number;
    totalCost: number;
  }>;
}

export const analyticsService = {
  getDashboard: async (params?: { date?: string; budgetId?: number }): Promise<DashboardAnalyticsResponse> => {
    const response = await apiClient.get<DashboardAnalyticsResponse>('/analytics/dashboard', { params });
    return response.data;
  },
};
