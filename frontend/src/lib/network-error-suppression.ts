// Comprehensive network error suppression for Firebase/Firestore development noise

// Store original methods
const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

// Patterns for URLs that should be silenced
const SILENT_URL_PATTERNS = [
  'firestore.googleapis.com',
  'firebase.googleapis.com', 
  'api.web3modal.org',
  'pulse.walletconnect.org',
  'Listen/channel?gsessionid='
];

// Check if URL should be silenced
const shouldSilenceURL = (url: string): boolean => {
  return SILENT_URL_PATTERNS.some(pattern => url.includes(pattern));
};

// Override console methods to suppress specific network error logs
const suppressNetworkConsoleLogs = () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('Failed to load resource') || 
        message.includes('400 (Bad Request)') ||
        message.includes('net::ERR_ABORTED') ||
        message.includes('firestore.googleapis.com')) {
      return; // Suppress these specific network errors
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = function(...args) {
    const message = args.join(' ');
    if (message.includes('firestore.googleapis.com') ||
        message.includes('firebase.googleapis.com')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('firestore.googleapis.com') ||
        message.includes('firebase.googleapis.com')) {
      return;
    }
    originalConsoleLog.apply(console, args);
  };
};

// Override window.onerror to suppress Firebase network errors
const suppressGlobalErrors = () => {
  window.addEventListener('error', (event) => {
    if (event.message && (
        event.message.includes('Failed to load resource') ||
        event.message.includes('firestore.googleapis.com') ||
        event.message.includes('net::ERR_ABORTED')
      )) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && error.message && (
        error.message.includes('firestore.googleapis.com') ||
        error.message.includes('Failed to load resource') ||
        error.message.includes('net::ERR_ABORTED')
      )) {
      event.preventDefault();
    }
  });
};

// Enhanced fetch override with better error suppression
const enhancedFetchOverride = () => {
  window.fetch = async function(input, init?) {
    const url = typeof input === 'string' ? input : 
                input instanceof Request ? input.url : 
                input instanceof URL ? input.href : String(input);
    
    try {
      const response = await originalFetch.call(this, input, init);
      
      // Silently handle Firebase errors without logging
      if (!response.ok && shouldSilenceURL(url)) {
        // Create a silent error that won't be logged
        const silentError = new Error(`Silent network error: ${response.status}`);
        silentError.name = 'SilentNetworkError';
        return response; // Return response without throwing
      }
      
      return response;
    } catch (error) {
      if (shouldSilenceURL(url)) {
        // Re-throw but mark as silent
        const silentError = error as Error;
        silentError.name = 'SilentNetworkError';
        throw silentError;
      }
      throw error;
    }
  };
};

// Enhanced XMLHttpRequest override
const enhancedXHROverride = () => {
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._isSilentRequest = shouldSilenceURL(url);
    return originalXHROpen.call(this, method, url, ...args);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    if (this._isSilentRequest) {
      // Suppress all events for silent requests
      this.addEventListener('error', (e) => {
        e.stopPropagation();
        e.preventDefault();
      }, true);
      
      this.addEventListener('abort', (e) => {
        e.stopPropagation();
        e.preventDefault();
      }, true);
      
      this.addEventListener('timeout', (e) => {
        e.stopPropagation();
        e.preventDefault();
      }, true);
    }
    
    return originalXHRSend.apply(this, args);
  };
};

// Initialize all suppression methods
export const initNetworkErrorSuppression = () => {
  suppressNetworkConsoleLogs();
  suppressGlobalErrors();
  enhancedFetchOverride();
  enhancedXHROverride();
};

// Auto-initialize in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  initNetworkErrorSuppression();
}