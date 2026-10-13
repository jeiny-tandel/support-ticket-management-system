import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { AUTH_TOKEN_KEY } from '../constants/auth';
import type { ApiErrorResponse, NormalizedApiError } from '../types/api.types';

export class ApiError extends Error implements NormalizedApiError {
  statusCode: number;
  errors: string[];
  raw?: ApiErrorResponse;

  constructor(
    message: string,
    statusCode: number,
    errors: string[] = [],
    raw?: ApiErrorResponse,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.raw = raw;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Normalizes backend error responses (e.g., NestJS HttpExceptionFilter output),
 * network disconnects, or client-side request failures into a consistent ApiError.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const response = axiosError.response;

    if (response) {
      const data = response.data;
      const statusCode = response.status || data?.statusCode || 500;
      let primaryMessage = '';
      let errorsList: string[] = [];

      if (data && typeof data === 'object') {
        if (Array.isArray(data.message)) {
          errorsList = data.message.map((msg) => String(msg));
          primaryMessage = errorsList.join(', ');
        } else if (
          typeof data.message === 'string' &&
          data.message.trim().length > 0
        ) {
          primaryMessage = data.message;
          errorsList = [data.message];
        } else if (
          typeof data.error === 'string' &&
          data.error.trim().length > 0
        ) {
          primaryMessage = data.error;
          errorsList = [data.error];
        }
      }

      if (!primaryMessage) {
        switch (statusCode) {
          case 400:
            primaryMessage = 'Invalid request parameters.';
            break;
          case 401:
            primaryMessage = 'Invalid credentials or session expired.';
            break;
          case 403:
            primaryMessage =
              'You do not have permission to perform this action.';
            break;
          case 404:
            primaryMessage = 'The requested resource was not found.';
            break;
          case 409:
            primaryMessage =
              'A conflict occurred. The resource may already exist.';
            break;
          case 500:
            primaryMessage =
              'An internal server error occurred. Please try again later.';
            break;
          default:
            primaryMessage =
              axiosError.message || `Request failed with status ${statusCode}.`;
        }
        if (errorsList.length === 0) {
          errorsList = [primaryMessage];
        }
      }

      return new ApiError(primaryMessage, statusCode, errorsList, data);
    }

    if (axiosError.request) {
      const message =
        'Unable to reach the server. Please check your network connection.';
      return new ApiError(message, 0, [message]);
    }

    const message = axiosError.message || 'Request configuration error.';
    return new ApiError(message, 0, [message]);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0, [error.message]);
  }

  return new ApiError('An unexpected error occurred.', 500, [
    'An unexpected error occurred.',
  ]);
}

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach existing JWT access token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);

// Response interceptor: normalize all errors, handling 401 without redirect loops
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // 401 responses are normalized and rejected without causing redirect loops
    // or uncoordinated global event dispatches. Redux and router will coordinate
    // session state in subsequent phases.
    return Promise.reject(normalizeApiError(error));
  },
);

export default apiClient;
