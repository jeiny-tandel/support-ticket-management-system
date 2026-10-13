export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp?: string;
  path?: string;
  error?: string;
}

export interface NormalizedApiError {
  statusCode: number;
  message: string;
  errors: string[];
  raw?: ApiErrorResponse;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

