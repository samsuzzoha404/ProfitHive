// React performance hooks for preventing tab hanging and memory leaks

import { useEffect, useRef, useCallback } from 'react';
import { debounce, throttle, PerformanceCleanup, EventListenerManager } from '../lib/performance-utils';

/**
 * Hook for managing cleanup to prevent memory leaks
 */
export const usePerformanceCleanup = () => {
  const cleanupRef = useRef<PerformanceCleanup>();
  const eventManagerRef = useRef<EventListenerManager>();

  useEffect(() => {
    cleanupRef.current = new PerformanceCleanup();
    eventManagerRef.current = new EventListenerManager();

    return () => {
      cleanupRef.current?.clearAll();
      eventManagerRef.current?.removeAllListeners();
    };
  }, []);

  return {
    cleanup: cleanupRef.current,
    eventManager: eventManagerRef.current,
  };
};

/**
 * Hook for debounced functions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) => {
  const debouncedCallback = useRef(debounce(callback, delay));

  useEffect(() => {
    debouncedCallback.current = debounce(callback, delay);
  }, [callback, delay]);

  return useCallback((...args: Parameters<T>) => {
    debouncedCallback.current(...args);
  }, []);
};

/**
 * Hook for throttled functions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  limit: number
) => {
  const throttledCallback = useRef(throttle(callback, limit));

  useEffect(() => {
    throttledCallback.current = throttle(callback, limit);
  }, [callback, limit]);

  return useCallback((...args: Parameters<T>) => {
    throttledCallback.current(...args);
  }, []);
};

/**
 * Hook for preventing component updates after unmount
 */
export const useMountedRef = () => {
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
};

/**
 * Hook for safe async operations that won't update unmounted components
 */
export const useSafeAsync = () => {
  const mountedRef = useMountedRef();

  return useCallback(
    <T>(asyncFn: () => Promise<T>) => {
      return new Promise<T>((resolve, reject) => {
        asyncFn()
          .then(result => {
            if (mountedRef.current) {
              resolve(result);
            }
          })
          .catch(error => {
            if (mountedRef.current) {
              reject(error);
            }
          });
      });
    },
    [mountedRef]
  );
};