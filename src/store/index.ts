import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { authSlice } from './slices/authSlice';
import { featureFlagsSlice } from './slices/featureFlagsSlice';
import { uiSlice } from './slices/uiSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    featureFlags: featureFlagsSlice.reducer,
    ui: uiSlice.reducer,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export action creators
export const { login, logout, setUser, setTokens, clearAuth } = authSlice.actions;
export const { toggleFeatureFlag, setFeatureFlags } = featureFlagsSlice.actions;
export const { setLoading, setError, clearError, setNotification, clearNotification } = uiSlice.actions;