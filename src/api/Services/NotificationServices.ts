import apiClient from '../axios';

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushUnsubscribePayload {
  endpoint: string;
}

export interface NotificationActionResponse {
  message: string;
  sent?: number;
  failed?: number;
  unselectedUsersCount?: number;
  eligibleRecipientsCount?: number;
}

export const notificationService = {
  subscribe: async (data: PushSubscriptionPayload): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/notifications/subscribe', data);
    return response.data;
  },

  unsubscribe: async (data: PushUnsubscribePayload): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/notifications/unsubscribe', data);
    return response.data;
  },

  notifyUnselectedReminder: async (data?: { weekMenuScheduleId?: number }): Promise<NotificationActionResponse> => {
    const response = await apiClient.post<NotificationActionResponse>('/notifications/unselected-reminder', data ?? {});
    return response.data;
  },

  notifyFoodArrived: async (data?: { weekMenuScheduleId?: number }): Promise<NotificationActionResponse> => {
    const response = await apiClient.post<NotificationActionResponse>('/notifications/food-arrived', data ?? {});
    return response.data;
  },
};
