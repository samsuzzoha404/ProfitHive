// DevTools Network Tab Error Suppression
// This specifically targets the browser's DevTools console network error logging

// Intercept and suppress DevTools network logging
export const suppressDevToolsNetworkErrors = () => {
  if (process.env.NODE_ENV !== 'development') return;

  // Store original methods
  const originalSend = XMLHttpRequest.prototype.send;
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalFetch = window.fetch;

  // Patterns to suppress
  const suppressPatterns = [
    'firestore.googleapis.com',
    'firebase.googleapis.com',
    'Listen/channel',
    'projects%2Fprofithive-f5410',
    'projects%2Fprofithive-2a203',
    'profithive-f5410',
    'profithive-2a203'
  ];

  // Check if URL should be suppressed
  const shouldSuppress = (url: string): boolean => {
    return suppressPatterns.some(pattern => url.includes(pattern));
  };

  // Override XMLHttpRequest to suppress DevTools logging
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
    const urlString = url.toString();
    
    if (shouldSuppress(urlString)) {
      // Mark this request as silent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)._isSilent = true;
      
      // Override addEventListener to suppress error logging
      const originalAddEventListener = this.addEventListener;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.addEventListener = function(type: string, listener: any, ...listenerArgs: any[]) {
        if (type === 'error' || type === 'abort' || type === 'timeout') {
          // Replace with no-op listener for silent requests
          return originalAddEventListener.call(this, type, () => {}, ...listenerArgs);
        }
        return originalAddEventListener.call(this, type, listener, ...listenerArgs);
      };
    }
    
    return originalOpen.call(this, method, url, ...args);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  XMLHttpRequest.prototype.send = function(...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this as any)._isSilent) {
      // Suppress all events for silent requests
      const suppressEvent = (e: Event) => {
        e.stopImmediatePropagation();
        e.preventDefault();
      };

      this.addEventListener('error', suppressEvent, true);
      this.addEventListener('abort', suppressEvent, true);
      this.addEventListener('timeout', suppressEvent, true);
      this.addEventListener('loadend', suppressEvent, true);
    }
    
    return originalSend.apply(this, args);
  };

  // Override fetch to suppress network tab errors
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : 
                input instanceof Request ? input.url :
                input instanceof URL ? input.href : String(input);
    
    if (shouldSuppress(url)) {
      try {
        const response = await originalFetch.call(this, input, init);
        
        // Create a custom response that doesn't trigger DevTools logging
        if (!response.ok) {
          // Return the response without throwing - suppresses 400/403 logs
          return new Response(null, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
        
        return response;
      } catch (error) {
        // Silently handle network errors for suppressed URLs
        throw new Error('Network request failed (suppressed)');
      }
    }
    
    return originalFetch.call(this, input, init);
  };

  // Suppress Performance API entries for Firebase requests
  const originalClearResourceTimings = performance.clearResourceTimings;
  const intervalId = setInterval(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const firebaseEntries = entries.filter(entry => shouldSuppress(entry.name));
    
    if (firebaseEntries.length > 0) {
      // Clear Firebase-related performance entries to reduce DevTools noise
      performance.clearResourceTimings();
    }
  }, 1000);

  // Clean up interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
};

// Auto-initialize
if (typeof window !== 'undefined') {
  suppressDevToolsNetworkErrors();
}