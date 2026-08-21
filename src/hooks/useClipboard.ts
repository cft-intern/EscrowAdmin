import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/utils';

interface UseClipboardReturn {
  isCopied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Custom hook for clipboard operations with copy state management.
 * Provides a convenient way to copy text to clipboard and track the copy state.
 *
 * @param timeout - How long to keep the copied state (default: 2000ms)
 * @returns Object with copy function, copied state, and reset function
 */
export function useClipboard(timeout: number = 2000): UseClipboardReturn {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        const success = await copyToClipboard(text);
        
        if (success) {
          setIsCopied(true);
          
          // Reset the copied state after timeout
          setTimeout(() => {
            setIsCopied(false);
          }, timeout);
        }
        
        return success;
      } catch (error) {
        console.error('Failed to copy text to clipboard:', error);
        return false;
      }
    },
    [timeout]
  );

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  return {
    isCopied,
    copy,
    reset,
  };
}

/**
 * Custom hook that automatically copies text and provides feedback.
 * Useful for copy buttons and similar UI elements.
 *
 * @param text - The text to copy
 * @param timeout - How long to keep the copied state
 * @returns Object with copy function and copied state
 */
export function useAutoCopy(text: string, timeout: number = 2000) {
  const { isCopied, copy, reset } = useClipboard(timeout);

  const handleCopy = useCallback(() => {
    copy(text);
  }, [copy, text]);

  return {
    isCopied,
    copy: handleCopy,
    reset,
  };
}