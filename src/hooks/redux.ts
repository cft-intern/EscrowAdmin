import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Convenience hooks for common state selections
export const useAuth = () => useAppSelector((state) => state.auth);
export const useFeatureFlags = () => useAppSelector((state) => state.featureFlags);
export const useUI = () => useAppSelector((state) => state.ui);

// Hook for checking authentication status
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);

// Hook for getting current user
export const useCurrentUser = () => useAppSelector((state) => state.auth.user);

// Hook for checking specific feature flags
export const useFeatureFlag = (flag: keyof import('@/types').FeatureFlags) => {
  return useAppSelector((state) => state.featureFlags.flags[flag]);
};