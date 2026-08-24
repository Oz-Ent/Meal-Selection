import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { MEAL_APP_CORE } from '../utils/misc/config';
import { authService } from './Services/AuthServices';
import { getErrorMessage } from '../helpers/errorMessageHelper';

const apiClient = axios.create({
  baseURL: `${MEAL_APP_CORE}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    const existingAuthHeader =
      (config.headers as Record<string, unknown> | undefined)?.[
        'Authorization'
      ] ??
      (config.headers as Record<string, unknown> | undefined)?.[
        'authorization'
      ];

    if (token && !existingAuthHeader) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    throw error;
  },
);

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (
  error: unknown,
  token: string | null = null,
) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

    const isAuthRequest =
      originalRequest?.url?.startsWith('/auth/');

    /*
     * Existing 401 refresh-token logic
     */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        }).then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] =
              `Bearer ${newToken}`;
          }

          return apiClient(originalRequest);
        });
      }

      const refreshToken =
        localStorage.getItem('refreshToken') ||
        sessionStorage.getItem('refreshToken');

      const isPersistent =
        !!localStorage.getItem('refreshToken');

      const storage = isPersistent
        ? localStorage
        : sessionStorage;

      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');

        window.location.href = '/login';

        return Promise.reject(
          new Error('No refresh token available'),
        );
      }

      isRefreshing = true;

      try {
        const response =
          await authService.refresh({ refreshToken });

        const {
          accessToken,
          refreshToken: newRefreshToken,
        } = response;

        storage.setItem('token', accessToken);
        storage.setItem(
          'refreshToken',
          newRefreshToken,
        );

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] =
            `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');

        window.location.href = '/login';

        processQueue(err, null);

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }


    return Promise.reject(new Error(getErrorMessage(error, "Something went wrong")));
  },
);

export default apiClient;