import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';
import { clearAuth, setTokens } from '@/store/slices/authSlice';
import { ApiResponse, AuthTokens } from '@/types';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const tokens = (refreshResult.data as ApiResponse<AuthTokens>).data;
        
        // Store the new tokens
        api.dispatch(setTokens(tokens));
        
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch(clearAuth());
      }
    } else {
      // No refresh token, logout user
      api.dispatch(clearAuth());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth', 'FeatureFlags'],
  endpoints: () => ({}),
});

// Export hooks for usage in functional components
export const {
  util: { getRunningQueriesThunk },
} = apiSlice;

// Export the api slice for use in store
export default apiSlice;