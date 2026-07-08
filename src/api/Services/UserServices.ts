import apiClient from "../axios";

export interface User {
  id: number;
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
};
