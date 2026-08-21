import React from 'react';
import { useFeatureFlag as useFeatureFlagRedux } from './redux';
import { FeatureFlags } from '@/types';

/**
 * Enhanced feature flag hook with environment variable fallbacks
 * Checks both Redux state and environment variables
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  // Get from Redux state (user preferences)
  const userPreference = useFeatureFlagRedux(flag);
  
  // Check environment variable as fallback
  const envFlag = getEnvironmentFlag(flag);
  
  // User preference takes precedence over environment
  return userPreference ?? envFlag;
}

/**
 * Hook to check multiple feature flags at once
 */
export function useFeatureFlags(flags: (keyof FeatureFlags)[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  
  flags.forEach(flag => {
    result[flag] = useFeatureFlag(flag);
  });
  
  return result;
}

/**
 * Hook for conditional rendering based on feature flag
 */
export function useFeatureComponent<T extends React.ComponentType>(
  flag: keyof FeatureFlags,
  component: T,
  fallback?: React.ComponentType
): T | React.ComponentType | null {
  const isEnabled = useFeatureFlag(flag);
  
  if (isEnabled) {
    return component;
  }
  
  return fallback || null;
}

/**
 * Get feature flag from environment variables
 */
function getEnvironmentFlag(flag: keyof FeatureFlags): boolean {
  const envMap: Record<keyof FeatureFlags, string> = {
    betaFeatures: 'VITE_FEATURE_BETA_ENABLED',
    advancedAnalytics: 'VITE_FEATURE_ANALYTICS_ENABLED',
    experimentalUI: 'VITE_FEATURE_EXPERIMENTAL_UI',
  };
  
  const envVar = envMap[flag];
  if (!envVar) return false;
  
  const value = import.meta.env[envVar];
  return value === 'true' || value === '1';
}

/**
 * Higher-order component for feature flag gating
 */
export function withFeatureFlag<P extends object>(
  flag: keyof FeatureFlags,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const isEnabled = useFeatureFlag(flag);
    
    if (!isEnabled) {
      return FallbackComponent ? React.createElement(FallbackComponent, props) : null;
    }
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withFeatureFlag(${flag})(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}