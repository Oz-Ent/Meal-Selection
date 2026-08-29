import apiClient from "../axios";

export interface User {
  id: number;
  name: string;
  email: string;
  referenceEmail: string;
  status: "ACTIVE" | "INACTIVE" | "RETIRED";
  roleId: number;
  referenceId: number;
  role: {
    name: string;
  };
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  status?: "ACTIVE" | "INACTIVE" | "RETIRED";
  roleId?: number;
}

export interface UpdateUserResponse {
  id: number;
  name: string;
  email: string;
  referenceEmail: string;
  referenceId: number;
  status: string;
  passwordHash: string;
  createdAt: string;
  isActivated: boolean;
  roleId: number;
}

export interface UserLeave {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  daysCount: number;
  createdAt: string;
}

export interface UserDislikes {
  meals?: number[];
  foodItems?: string[];
}

export interface UserPreferences {
  userId: number | null;
  dislikes: UserDislikes | string[] | null;
  excludedMealIds: number[] | null;
  updatedAt?: string;
}

export interface UpdateUserPreferencesRequest {
  dislikes: {
    meals?: number[];
    foodItems?: string[];
  };
}

export interface UpdateUserPreferencesResponse {
  message: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string | null;
  referenceEmail: string;
  referenceId: number;
  status: "ACTIVE" | "INACTIVE" | "RETIRED";
  roleId: number;
  roleName: string;
  role?: {
    id: number;
    name: string;
    description?: string;
  };
  createdAt: string;
  isActivated: boolean;
  preferences?: UserPreferences | null;
  leaves: UserLeave[];
  upcomingOrActiveLeaves: UserLeave[];
  totalLeaveDays: number;
  stats?: {
    totalSelections: number;
    totalPresets: number;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await apiClient.put<UpdateUserResponse>(`/users/${id}`, data);
    return response.data;
  },

  getProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>("/users/profile");
    return response.data;
  },

  getUserLeaves: async (userId: number): Promise<UserLeave[]> => {
    const response = await apiClient.get<UserLeave[]>(`/users/${userId}/leaves`);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post<ChangePasswordResponse>("/auth/change-password", data);
    return response.data;
  },

  getPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get<UserPreferences>("/users/preferences");
    return response.data;
  },

  updatePreferences: async (data: UpdateUserPreferencesRequest): Promise<UpdateUserPreferencesResponse> => {
    const response = await apiClient.put<UpdateUserPreferencesResponse>("/users/preferences", data);
    return response.data;
  },
};


