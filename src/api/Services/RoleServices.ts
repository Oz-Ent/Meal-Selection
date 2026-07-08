import apiClient from "../axios";

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface CreateRoleResponse {
  message: string;
  role: Role;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export const roleService = {
  getAll: async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>("/roles");
    return response.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await apiClient.get<Role>(`/roles/${id}`);
    return response.data;
  },

  create: async (data: CreateRoleRequest): Promise<CreateRoleResponse> => {
    const response = await apiClient.post<CreateRoleResponse>("/roles", data);
    return response.data;
  },

  update: async (id: number, data: UpdateRoleRequest): Promise<Role> => {
    const response = await apiClient.put<Role>(`/roles/${id}`, data);
    return response.data;
  },
};
