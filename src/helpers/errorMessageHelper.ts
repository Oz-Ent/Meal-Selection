import axios from 'axios';

interface ApiErrorResponse {
  messages?: string;
  message?: string;
}

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong.',
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.messages ??
      error.response?.data?.message ??
      error.message ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};