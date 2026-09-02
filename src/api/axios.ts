import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { MEAL_APP_CORE } from '../utils/misc/config';
import { authService } from './Services/AuthServices';
import { getErrorMessage } from '../helpers/errorMessageHelper';
import { authStorage } from '../utils/misc/authStorage';

// Custom event to notify React auth context of unrecoverable auth failures
export const AUTH_ERROR_EVENT = 'auth:error';

const apiClient = axios.create({
  baseURL: `${MEAL_APP_CORE}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();

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
    return Promise.reject(error);
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

      const refreshToken = authStorage.getRefreshToken();
      const isPersistent = authStorage.isPersistent();

      isRefreshing = true;

      try {
        const response = await authService.refresh(
          refreshToken ? { refreshToken } : undefined,
        );

        const {
          accessToken,
          refreshToken: newRefreshToken,
        } = response;

        authStorage.setTokens(
          accessToken,
          newRefreshToken || refreshToken || '',
          isPersistent,
        );

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] =
            `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (err) {
        authStorage.clear();
        window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
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