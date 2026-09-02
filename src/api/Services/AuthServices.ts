import apiClient from "../axios";

export interface LoginRequest {
  email: string;
  password: string;
  keepSignedIn?: boolean;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    roleId: number;
    roleName: string;
  };
  availability: {
    startDate: string;
    endDate: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  token: string;
}

export interface RegisterResponse {
  message: string;
  result: {
    message: string;
  };
}

export interface OnboardingRequest {
  email: string;
}

export interface OnboardingResponse {
  result: {
    message: string;
  };
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RefreshRequest {
  refreshToken?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    roleId: number;
    roleName: string;
  };
  availability?: {
    startDate: string;
    endDate: string;
  };
}

export interface GeneratePasswordTokenRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  token: string;
}

export interface VerifyOTPResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  token: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface MeResponse {
  user: {
    id: number;
    email: string;
    name: string;
    roleId: number;
    roleName: string;
  };
  availability: {
    startDate: string;
    endDate: string;
  };
}

export const authService = {
  login: async (loginRequest: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", loginRequest);
    return response.data;
  },

  register: async (registerRequest: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/auth/register", registerRequest);
    return response.data;
  },

  onboarding: async (onboardingRequest: OnboardingRequest): Promise<OnboardingResponse> => {
    const response = await apiClient.post<OnboardingResponse>("/auth/onboarding", onboardingRequest);
    return response.data;
  },

  logout: async (logoutRequest?: LogoutRequest): Promise<LogoutResponse> => {
    const response = await apiClient.post<LogoutResponse>("/auth/logout", logoutRequest || {});
    return response.data;
  },

  refresh: async (refreshRequest?: RefreshRequest): Promise<RefreshResponse> => {
    const response = await apiClient.post<RefreshResponse>("/auth/refresh", refreshRequest || {});
    return response.data;
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>("/auth/me");
    return response.data;
  },

  generatePasswordToken: async (
    data: GeneratePasswordTokenRequest
  ): Promise<void> => {
    await apiClient.post("/auth/generate-password-token", data);
  },

  verifyOtp: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await apiClient.post<VerifyOTPResponse>("/auth/verify-otp", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>("/auth/reset-password", data);
    return response.data;
  },

  sync: async (): Promise<string> => {
    const response = await apiClient.post<string>("/auth/sync");
    return response.data;
  },
};