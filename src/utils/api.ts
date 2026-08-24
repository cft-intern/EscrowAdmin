import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, AuthTokens, CustomAxiosRequestConfig } from '@/types';
import { store } from '@/store';
import { clearAuth, setTokens } from '@/store/slices/authSlice';
import { setNotification } from '@/store/slices/uiSlice';

const TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'admin_template_token';
const REFRESH_TOKEN_STORAGE_KEY = import.meta.env.VITE_AUTH_REFRESH_TOKEN_STORAGE_KEY || 'admin_template_refresh_token';

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (!envUrl || !envUrl.trim()) {
    console.warn('VITE_API_BASE_URL is not configured.');
  }

  return envUrl?.trim() ?? '';
};

export const isAuthRequest = (url?: string): boolean => {
  if (!url) return false;

  return (
    url.includes('/auth/login') ||
    url.includes('/admin/authenticate')
  );
};

export const isRefreshRequest = (url?: string): boolean => {
  if (!url) return false;

  return (
    url.includes('/auth/refresh') ||
    url.endsWith('/refresh') ||
    url.includes('/api/auth/refresh')
  );
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
});

// Shared promise for deduplicating concurrent token refresh requests
let refreshPromise: Promise<string | null> | null = null;

const handleLogoutAndClearState = () => {
  store.dispatch(clearAuth());
  store.dispatch(
    setNotification({
      type: 'error',
      title: 'Session Expired',
      message: 'Please log in again.',
    })
  );

  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

const performTokenRefresh = async (): Promise<string | null> => {
  const state = store.getState();
  const refreshToken =
    state.auth.refreshToken ||
    (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) : null);

  if (!refreshToken) {
    handleLogoutAndClearState();
    return null;
  }

  try {
    // Call configured refresh endpoint /auth/refresh
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });

    const tokensData = response.data?.data ?? response.data;
    const accessToken =
      tokensData?.accessToken ??
      tokensData?.token ??
      tokensData?.access_token;
    const newRefreshToken =
      tokensData?.refreshToken ??
      tokensData?.refresh_token;

    if (!accessToken) {
      handleLogoutAndClearState();
      return null;
    }

    const tokens: AuthTokens = {
      accessToken,
      refreshToken: newRefreshToken ?? refreshToken,
    };

    store.dispatch(setTokens(tokens));
    return accessToken;
  } catch (refreshError) {
    handleLogoutAndClearState();
    return null;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token =
      state.auth.accessToken ||
      (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null);

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
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';

    // Handle 401 errors (unauthorized) ONLY for non-auth & non-refresh requests that haven't been retried
    if (
      error.response?.status === 401 &&
      !isAuthRequest(requestUrl) &&
      !isRefreshRequest(requestUrl) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return apiClient(originalRequest);
      } else {
        return Promise.reject(error);
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

    // Handle client errors (4xx) except 401 which is handled above or on auth/refresh requests
    if (
      error.response?.status &&
      error.response.status >= 400 &&
      error.response.status < 500 &&
      !isAuthRequest(requestUrl) &&
      !isRefreshRequest(requestUrl)
    ) {
      const rawMsg = (error.response.data as ApiResponse<any>)?.message ?? (error.response.data as any)?.error;
      const errorMessage = Array.isArray(rawMsg)
        ? rawMsg.join(', ')
        : typeof rawMsg === 'string'
        ? rawMsg
        : typeof rawMsg === 'object' && rawMsg !== null
        ? JSON.stringify(rawMsg)
        : error.message || 'Request failed. Please check your input and try again.';

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
export default apiClient;