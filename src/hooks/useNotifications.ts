import toast from 'react-hot-toast';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function useNotifications() {
  const success = (message: string, options?: NotificationOptions) => {
    return toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  };

  const error = (message: string, options?: NotificationOptions) => {
    return toast.error(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
    });
  };

  const loading = (message: string, options?: NotificationOptions) => {
    return toast.loading(message, {
      position: options?.position || 'top-right',
    });
  };

  const info = (message: string, options?: NotificationOptions) => {
    return toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: 'ℹ️',
    });
  };

  const warning = (message: string, options?: NotificationOptions) => {
    return toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: '⚠️',
    });
  };

  const promise = async <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: NotificationOptions
  ) => {
    return toast.promise(
      promise,
      messages,
      {
        position: options?.position || 'top-right',
      }
    );
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const custom = (jsx: React.ReactElement, options?: NotificationOptions) => {
    return toast.custom(jsx, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  };

  return {
    success,
    error,
    loading,
    info,
    warning,
    promise,
    dismiss,
    custom,
  };
}