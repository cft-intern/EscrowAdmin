import { useRef, useCallback } from 'react';

/**
 * Custom hook that throttles a callback function, limiting how often it can be called.
 * Unlike debouncing, throttling ensures the function is called at regular intervals.
 *
 * @param callback - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns The throttled callback function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef<boolean>(false);
  const lastFunc = useRef<NodeJS.Timeout>();
  const lastRan = useRef<number>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        lastRan.current = Date.now();
        inThrottle.current = true;
      } else {
        clearTimeout(lastFunc.current);
        lastFunc.current = setTimeout(() => {
          if (Date.now() - (lastRan.current || 0) >= limit) {
            callback(...args);
            lastRan.current = Date.now();
          }
        }, limit - (Date.now() - (lastRan.current || 0)));
      }
    },
    [callback, limit]
  ) as T;

  return throttledCallback;
}

/**
 * Custom hook that throttles a value, limiting how often it can update.
 *
 * @param value - The value to throttle
 * @param limit - The time limit in milliseconds
 * @returns The throttled value
 */
export function useThrottledValue<T>(value: T, limit: number): T {
  const throttledRef = useRef<T>(value);
  const lastUpdate = useRef<number>(Date.now());

  if (Date.now() - lastUpdate.current >= limit) {
    throttledRef.current = value;
    lastUpdate.current = Date.now();
  }

  return throttledRef.current;
}