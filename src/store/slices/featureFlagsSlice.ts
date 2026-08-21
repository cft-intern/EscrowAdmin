import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeatureFlags } from '@/types';

interface FeatureFlagsState {
  flags: FeatureFlags;
  isLoading: boolean;
  error: string | null;
}

const getInitialFlags = (): FeatureFlags => {
  if (typeof window === 'undefined') {
    return {
      betaFeatures: false,
      advancedAnalytics: false,
      experimentalUI: false,
    };
  }

  const storedFlags = localStorage.getItem('featureFlags');
  if (storedFlags) {
    try {
      return JSON.parse(storedFlags);
    } catch {
      // If parsing fails, return default flags
    }
  }

  return {
    betaFeatures: false,
    advancedAnalytics: false,
    experimentalUI: false,
  };
};

const initialState: FeatureFlagsState = {
  flags: getInitialFlags(),
  isLoading: false,
  error: null,
};

export const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setFeatureFlags: (state, action: PayloadAction<FeatureFlags>) => {
      state.flags = action.payload;
      state.isLoading = false;
      state.error = null;

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('featureFlags', JSON.stringify(action.payload));
      }
    },
    toggleFeatureFlag: (state, action: PayloadAction<keyof FeatureFlags>) => {
      const flag = action.payload;
      state.flags[flag] = !state.flags[flag];

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('featureFlags', JSON.stringify(state.flags));
      }
    },
    clearFeatureFlags: (state) => {
      state.flags = {
        betaFeatures: false,
        advancedAnalytics: false,
        experimentalUI: false,
      };
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('featureFlags');
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setFeatureFlags,
  toggleFeatureFlag,
  clearFeatureFlags,
} = featureFlagsSlice.actions;