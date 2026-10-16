import { apiClient } from './axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterAgentCredentials,
  User,
} from '../types';

/**
 * Authenticates user with email and password.
 * Backend endpoint: POST /auth/login
 * Response: { accessToken: string, user: { id: string, name: string, email: string, role: string } }
 */
export const loginApi = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/login',
    credentials,
  );
  return response.data;
};

/**
 * Registers a new Support Agent account.
 * Backend endpoint: POST /auth/register
 * Payload: { name, email, password } (client-only confirmPassword excluded to respect backend whitelist)
 * Response: { accessToken: string, user: { id: string, name: string, email: string, role: 'SUPPORT_AGENT' } }
 */
export const registerAgentApi = async (
  credentials: RegisterAgentCredentials,
): Promise<AuthResponse> => {
  const { name, email, password } = credentials;
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

/**
 * Retrieves the currently authenticated user's profile using the Bearer token.
 * Backend endpoint: GET /auth/me
 * Response: { id: string, email: string, name: string, role: string }
 */
export const getMeApi = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

export interface UpdateProfilePayload {
  name: string;
}

/**
 * Updates the currently authenticated user's self profile name.
 * Backend endpoint: PATCH /auth/me
 * Payload: { name: string }
 * Response: { id: string, name: string, email: string, role: string }
 */
export const updateProfileApi = async (
  payload: UpdateProfilePayload,
): Promise<User> => {
  const response = await apiClient.patch<User>('/auth/me', payload);
  return response.data;
};
