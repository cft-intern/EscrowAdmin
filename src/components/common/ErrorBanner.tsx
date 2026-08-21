import React from 'react';
import { AlertCircle, X, RefreshCw, Info, AlertTriangle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils';

interface ErrorBannerProps {
  title?: string;
  message?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  dismissible?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const typeConfig = {
  error: {
    icon: AlertCircle,
    className: 'bg-destructive/10 border-destructive/20 text-destructive',
    iconClassName: 'text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    iconClassName: 'text-blue-600 dark:text-blue-400',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
};

export function ErrorBanner({
  title,
  message,
  type = 'error',
  dismissible = true,
  onDismiss,
  onRetry,
  className,
  children,
}: ErrorBannerProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-md border p-4',
        config.className,
        className
      )}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', config.iconClassName)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          {message && (
            <div className="text-sm">
              {message}
            </div>
          )}
          {children && (
            <div className="text-sm">
              {children}
            </div>
          )}
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 w-8 p-0 hover:bg-transparent"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Specific error banners for common use cases
export function NetworkErrorBanner({ onRetry, onDismiss }: Pick<ErrorBannerProps, 'onRetry' | 'onDismiss'>) {
  return (
    <ErrorBanner
      type="error"
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

export function ValidationErrorBanner({ 
  errors, 
  onDismiss 
}: { 
  errors: Record<string, string[]>; 
  onDismiss?: () => void; 
}) {
  const errorMessages = Object.entries(errors).flatMap(([field, messages]) =>
    messages.map(message => `${field}: ${message}`)
  );

  return (
    <ErrorBanner
      type="error"
      title="Validation Error"
      onDismiss={onDismiss}
    >
      <ul className="list-disc list-inside space-y-1">
        {errorMessages.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </ErrorBanner>
  );
}

export function SuccessBanner({ 
  message, 
  onDismiss 
}: { 
  message: string; 
  onDismiss?: () => void; 
}) {
  return (
    <ErrorBanner
      type="success"
      message={message}
      onDismiss={onDismiss}
    />
  );
}