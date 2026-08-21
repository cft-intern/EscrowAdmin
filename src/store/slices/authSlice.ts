import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens } from '@/types';
import { isTokenExpired } from '@/utils';

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

  const storedToken = localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem('refreshToken');
  const storedUser = localStorage.getItem('user');

  // Check if token is expired
  const isTokenValid = storedToken && !isTokenExpired(storedToken);

  return {
    user: storedUser && isTokenValid ? JSON.parse(storedUser) : null,
    accessToken: isTokenValid ? storedToken : null,
    refreshToken: storedRefreshToken || null,
    isAuthenticated: Boolean(isTokenValid),
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
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
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
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
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
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setLoading, setError, login, logout, setUser, setTokens, clearAuth } = authSlice.actions;