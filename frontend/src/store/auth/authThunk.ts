import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, registerAgentApi, getMeApi } from '../../api/auth.api';
import { normalizeApiError } from '../../api/axios';
import { AUTH_TOKEN_KEY } from '../../constants/auth';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterAgentCredentials,
  User,
} from '../../types';

/**
 * Authenticates user and stores the access token on success.
 */
export const login = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginApi(credentials);
    localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

/**
 * Registers a new Support Agent and stores the access token on success.
 */
export const registerAgent = createAsyncThunk<
  AuthResponse,
  RegisterAgentCredentials,
  { rejectValue: string }
>('auth/registerAgent', async (credentials, { rejectWithValue }) => {
  try {
    const response = await registerAgentApi(credentials);
    localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

/**
 * Validates the stored token by fetching the current user profile from the backend.
 * Clears the stored token on rejection (e.g. 401 Unauthorized / expired).
 */
export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return rejectWithValue('No authentication token found');
  }

  try {
    const user = await getMeApi();
    return user;
  } catch (error) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});
