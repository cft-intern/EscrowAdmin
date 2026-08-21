import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, AuthTokens } from '@/types';
import { store } from '@/store';
import { clearAuth, setTokens } from '@/store/slices/authSlice';
import { setNotification } from '@/store/slices/uiSlice';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          });

          const tokens: AuthTokens = response.data.data;
          store.dispatch(setTokens(tokens));

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          store.dispatch(clearAuth());
          store.dispatch(
            setNotification({
              type: 'error',
              title: 'Session Expired',
              message: 'Please log in again.',
            })
          );
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, logout user
        store.dispatch(clearAuth());
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    // Handle network errors
    if (!error.response) {
      store.dispatch(
        setNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Please check your internet connection and try again.',
        })
      );
    }

    // Handle server errors (5xx)
    if (error.response?.status && error.response.status >= 500) {
      store.dispatch(
        setNotification({
          type: 'error',
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
        })
      );
    }

    // Handle client errors (4xx) except 401 which is handled above
    if (
      error.response?.status &&
      error.response.status >= 400 &&
      error.response.status < 500 &&
      error.response.status !== 401
    ) {
      const errorMessage = 
        (error.response.data as ApiResponse<any>)?.message || 
        'Request failed. Please check your input and try again.';
      
      store.dispatch(
        setNotification({
          type: 'error',
          title: 'Request Failed',
          message: errorMessage,
        })
      );
    }

    return Promise.reject(error);
  }
);

// Exponential backoff retry logic
const retryRequest = async (
  requestFn: () => Promise<AxiosResponse>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<AxiosResponse> => {
  let lastError: AxiosError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as AxiosError;
      
      // Don't retry on 4xx errors (client errors)
      if (lastError.response?.status && lastError.response.status >= 400 && lastError.response.status < 500) {
        throw lastError;
      }
      
      // Don't retry on the last attempt
      if (i === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};

// API wrapper class
export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await retryRequest(() => this.client.get(url, config));
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await retryRequest(() => this.client.post(url, data, config));
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await retryRequest(() => this.client.put(url, data, config));
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await retryRequest(() => this.client.patch(url, data, config));
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await retryRequest(() => this.client.delete(url, config));
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export axios instance for direct use if needed
export { apiClient };

export default api;