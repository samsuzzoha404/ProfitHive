// Performance utilities to prevent UI blocking and memory leaks

/**
 * Debounce function to prevent excessive calls
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Process large arrays in chunks to prevent UI blocking
 */
export async function processInChunks<T, R>(
  array: T[],
  processor: (item: T, index: number) => R,
  chunkSize = 100,
  delay = 0
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    const chunkResults = chunk.map((item, index) => processor(item, i + index));
    results.push(...chunkResults);
    
    // Yield control to prevent blocking
    if (delay > 0 && i + chunkSize < array.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Cleanup function for clearing timeouts and intervals
 */
export class PerformanceCleanup {
  private timeouts: NodeJS.Timeout[] = [];
  private intervals: NodeJS.Timeout[] = [];
  
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(() => {
      callback();
      this.removeTimeout(timeout);
    }, delay);
    this.timeouts.push(timeout);
    return timeout;
  }
  
  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.push(interval);
    return interval;
  }
  
  private removeTimeout(timeout: NodeJS.Timeout) {
    const index = this.timeouts.indexOf(timeout);
    if (index > -1) {
      this.timeouts.splice(index, 1);
    }
  }
  
  clearAll() {
    this.timeouts.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
    this.timeouts = [];
    this.intervals = [];
  }
}

/**
 * Memory-efficient event listener management
 */
export class EventListenerManager {
  private listeners: Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
    options?: AddEventListenerOptions;
  }> = [];
  
  addEventListener(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
  }
  
  removeAllListeners() {
    this.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.listeners = [];
  }
}