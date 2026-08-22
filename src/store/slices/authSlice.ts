import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '@/types';
import { isTokenExpired } from '@/utils';

const TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'admin_template_token';
const REFRESH_TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_REFRESH_TOKEN_STORAGE_KEY || 'admin_template_refresh_token';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || localStorage.getItem('refreshToken');
  const storedUser = localStorage.getItem('user');

  // Check if token is valid
  const isTokenValid = storedToken && !isTokenExpired(storedToken);

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    accessToken: isTokenValid ? storedToken : storedToken || null,
    refreshToken: storedRefreshToken || null,
    isAuthenticated: Boolean(storedToken),
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    login: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.accessToken = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.accessToken);
        if (action.payload.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, action.payload.refreshToken);
        }
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setLoading, setError, login, logout, setUser, setTokens, clearAuth } = authSlice.actions;