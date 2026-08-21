import { apiSlice } from './apiSlice';
import { User, LoginCredentials, RegisterData, AuthTokens, ApiResponse } from '@/types';
import { mockAuthService } from '@/utils/mockAuth';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<{ user: User; tokens: AuthTokens }>,
      LoginCredentials
    >({
      queryFn: async (credentials) => {
        try {
          const data = await mockAuthService.login(credentials);
          return { data };
        } catch (error: any) {
          return { error: error.response?.data || { message: 'Login failed' } };
        }
      },
      invalidatesTags: ['Auth'],
    }),
    
    register: builder.mutation<
      ApiResponse<{ user: User; tokens: AuthTokens }>,
      RegisterData
    >({
      queryFn: async (userData) => {
        try {
          const data = await mockAuthService.register(userData);
          return { data };
        } catch (error: any) {
          return { error: error.response?.data || { message: 'Registration failed' } };
        }
      },
      invalidatesTags: ['Auth'],
    }),
    
    logout: builder.mutation<ApiResponse<null>, void>({
      queryFn: async () => {
        try {
          const data = await mockAuthService.logout();
          return { data };
        } catch (error: any) {
          return { error: error.response?.data || { message: 'Logout failed' } };
        }
      },
      invalidatesTags: ['Auth'],
    }),
    
    refreshToken: builder.mutation<ApiResponse<AuthTokens>, { refreshToken: string }>({
      queryFn: async ({ refreshToken }) => {
        try {
          const data = await mockAuthService.refreshToken(refreshToken);
          return { data };
        } catch (error: any) {
          return { error: error.response?.data || { message: 'Token refresh failed' } };
        }
      },
    }),
    
    getCurrentUser: builder.query<ApiResponse<User>, string>({
      queryFn: async (token) => {
        try {
          const data = await mockAuthService.getCurrentUser(token);
          return { data };
        } catch (error: any) {
          return { error: error.response?.data || { message: 'Failed to get user' } };
        }
      },
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
} = authApi;