import toast from 'react-hot-toast';

export interface CategoryErrorHandlerOptions {
  onSlugConflict?: () => void;
  customMessage?: string;
  silent?: boolean;
}

/**
 * Production-ready API Error Handler for Category Module
 * - Hides raw API stack traces & console errors in production (only logs in dev mode)
 * - Safe extraction of backend messages (never exposes [object Object] or raw JSON)
 * - Handles standard HTTP status codes (400, 401, 403, 404, 409, 422, 500, Network)
 * - Triggers toast notifications and optional UI callbacks (e.g. slug highlight)
 */
export const handleCategoryApiError = (
  error: any,
  options?: CategoryErrorHandlerOptions
): string => {
  // 1. Log detailed errors ONLY in development mode
  const isDev = Boolean(
    (typeof import.meta !== 'undefined' && import.meta?.env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')
  );

  if (isDev) {
    console.error('[Category API Error]:', error);
  }

  let userMessage = 'An unexpected error occurred. Please try again.';

  // 2. Network Errors (No response received or offline)
  if (!error?.response) {
    if (
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error') ||
      (typeof navigator !== 'undefined' && !navigator.onLine)
    ) {
      userMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (typeof error?.message === 'string' && error.message.trim()) {
      userMessage = error.message;
    } else {
      userMessage = 'Unable to connect to the server. Please check your internet connection.';
    }
  } else {
    // 3. HTTP Status Error Responses
    const status = error.response.status;
    const data = error.response.data || {};
    const rawMsg = data.message || data.error;

    // Safely extract backend message
    let backendMsg = '';
    if (Array.isArray(rawMsg)) {
      backendMsg = rawMsg.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))).join('. ');
    } else if (typeof rawMsg === 'string') {
      backendMsg = rawMsg;
    } else if (typeof rawMsg === 'object' && rawMsg !== null) {
      backendMsg = rawMsg.message || rawMsg.error || '';
    }

    switch (status) {
      case 400:
        userMessage = 'Please check the form data and try again.';
        break;

      case 401:
        userMessage = 'Your session has expired. Please login again.';
        break;

      case 403:
        userMessage = 'You do not have permission to perform this action.';
        break;

      case 404:
        userMessage = 'Requested resource was not found.';
        break;

      case 409:
        const lowerMsg = backendMsg.toLowerCase();
        if (
          lowerMsg.includes('category slug already exists') ||
          lowerMsg.includes('slug already exists') ||
          lowerMsg.includes('slug')
        ) {
          userMessage = 'This category slug already exists. Please choose another slug.';
          if (options?.onSlugConflict) {
            options.onSlugConflict();
          }
        } else {
          userMessage = backendMsg || 'This category or resource already exists. Please choose another name or slug.';
        }
        break;

      case 422:
        userMessage = backendMsg || 'Validation error. Please check your inputs and try again.';
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        userMessage = 'Something went wrong. Please try again later.';
        break;

      default:
        userMessage = backendMsg || options?.customMessage || 'An error occurred while processing your request.';
        break;
    }
  }

  // 4. Show toast message unless explicitly silent
  if (!options?.silent) {
    toast.error(userMessage);
  }

  return userMessage;
};

export default handleCategoryApiError;
