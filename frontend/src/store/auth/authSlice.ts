import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { AUTH_TOKEN_KEY } from '../../constants/auth';
import type { AuthState, User } from '../../types';
import { fetchCurrentUser, login, registerAgent } from './authThunk';

const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

const initialState: AuthState = {
  user: null,
  token: storedToken,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.isInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem(AUTH_TOKEN_KEY, action.payload);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload ?? 'Login failed';
      });

    builder
      .addCase(registerAgent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAgent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(registerAgent.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload ?? 'Registration failed';
      });

    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = localStorage.getItem(AUTH_TOKEN_KEY);
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isInitialized = true;
        state.error =
          action.payload === 'No authentication token found'
            ? null
            : (action.payload ?? null);
      });
  },
});

export const { logout, clearError, setInitialized, setToken, updateUser } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

export default authSlice.reducer;

