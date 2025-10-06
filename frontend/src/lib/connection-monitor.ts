// Connection monitoring and error suppression utility
let lastErrorTime = 0;
let errorCount = 0;
const ERROR_SUPPRESSION_WINDOW = 30000; // 30 seconds
const MAX_LOGGED_ERRORS = 2; // Reduced to show fewer errors

// Store original console methods
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

// Firebase error patterns to suppress
const FIREBASE_ERROR_PATTERNS = [
  'WebChannelConnection RPC',
  'transport errored',
  'Failed to load resource: the server responded with a status of 400',
  'Cross-Origin-Opener-Policy policy would block',
  'window.closed call',
  'window.close call',
  'Firestore (12.3.0):',
  'Listen stream',
  'firestore.googleapis.com',
  'React Router Future Flag Warning',
  'Lit is in dev mode',
  'api.web3modal.org',
  'pulse.walletconnect.org',
  'getAnalyticsConfig',
  'getWallets',
  'w3m-connecting-wc-qrcode',
  'scheduled an update',
  '[Reown Config]',
  'HTTP status code: 403',
  'Failed to fetch remote project configuration',
  'Failed to execute inlined telemetry script',
  'Failed to load resource: the server responded with a status of 404',
  'Uncaught (in promise) undefined',
  'Blocked aria-hidden on an element',
  'Found 2 elements with non-unique id',
  'The current domain is not authorized for OAuth operations',
  'Future Flag Warning',
  'v7_startTransition',
  'v7_relativeSplatPath',
  'dist-UMIEQCNF.js',
  'OAuth operations',
  'Add your domain',
  'Fatal socket error',
  'WebSocket connection closed',
  'Unauthorized: invalid key',
  'closing transport',
  'core/relayer',
  'chunk-FFWCJP5A.js',
  'projectId=demo',
  
  // Firebase project specific patterns
  'projects%2Fprofithive-f5410%2Fdatabases',
  'projects%2Fprofithive-2a203%2Fdatabases',
  'profithive-f5410',
  'profithive-2a203',
  
  // Additional Firebase and Web3Modal patterns to suppress console spam
  'Failed to load resource: the server responded with a status of 400',
  'Failed to load resource: the server responded with a status of 403',
  'Connection interrupted while trying to subscribe',
  'Uncaught (in promise) Error: Connection interrupted',
  'Listen/channel?gsessionid=',
  'firebase_firestore.js',
  'firebase_auth.js',
  'Cross-Origin-Opener-Policy policy would block',
  'index.es-SSJLC7JO.js',
  'traffic.js',
  'requests.js',
  'ERR_ABORTED 400',
  'net::ERR_ABORTED',
  'EventEmitter.c4',
  'onceWrapper',
  'EventEmitter.emit',
  'o2.onClose',
  'f3.onClose',
  'e2.onclose',
  'poll @',
  'chunk-NPY75PGV.js',
  
  // Firebase SDK internal method calls
  '__PRIVATE_sendWatchRequest',
  '__PRIVATE_onWatchStreamOpen',
  '__PRIVATE_onWatchStreamClose',
  '__PRIVATE_startWatchStream',
  'firebase_firestore.js?v=',
  'firebase_auth.js?v=',
  'enqueueAndForget',
  'handleDelayElapsed',
  'createAndSchedule',
  'enqueueAfterDelay',
  'Promise.then',
  'setTimeout',
  
  // WalletConnect/Web3Modal patterns
  'getAnalyticsConfig',
  'getWallets', 
  'w3m-connecting-wc-qrcode',
  'w3m-connecting-wc-mobile',
  'w3m-connecting-wc-web',
  'w3m-account-button',
  'w3m-connect-button'
];

// Cache for pattern matching performance
const patternCache = new Map<string, boolean>();

// Suppress Firebase transport errors at the console level
const shouldSuppressConsoleMessage = (message: string): boolean => {
  // Quick check for empty or very short messages
  if (!message || message.length < 3) {
    return false;
  }
  
  // Check cache first
  if (patternCache.has(message)) {
    return patternCache.get(message)!;
  }
  
  // Convert to lowercase for better matching
  const lowerMessage = message.toLowerCase();
  
  const shouldSuppress = FIREBASE_ERROR_PATTERNS.some(pattern => 
    lowerMessage.includes(pattern.toLowerCase()) || message.includes(pattern)
  );
  
  // Cache result but limit cache size to prevent memory leaks
  if (patternCache.size > 1000) {
    const firstKey = patternCache.keys().next().value;
    patternCache.delete(firstKey);
  }
  patternCache.set(message, shouldSuppress);
  
  return shouldSuppress;
};

// Override console methods to suppress Firebase spam
export const initConsoleFiltering = () => {
  // More aggressive global error handlers
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const errorStr = error ? String(error) + (error.stack || '') : '';
    if (shouldSuppressConsoleMessage(errorStr)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('error', (event) => {
    const errorStr = event.message + (event.filename || '') + (event.error?.stack || '');
    if (shouldSuppressConsoleMessage(errorStr)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Override console methods with more comprehensive filtering
  console.warn = function(...args) {
    const message = args.join(' ');
    if (!shouldSuppressConsoleMessage(message)) {
      originalConsoleWarn.apply(console, args);
    }
  };

  console.error = function(...args) {
    const message = args.join(' ');
    if (!shouldSuppressConsoleMessage(message)) {
      originalConsoleError.apply(console, args);
    }
  };

  console.log = function(...args) {
    const message = args.join(' ');
    
    // Suppress repetitive "Object" logs from Web3Modal/WalletConnect
    if (args.length === 1 && typeof args[0] === 'object') {
      try {
        const objectString = JSON.stringify(args[0] || {});
        if (objectString.includes('core/relayer') || 
            objectString.includes('Fatal socket error') ||
            objectString.includes('WebSocket connection') ||
            objectString.includes('Unauthorized: invalid key') ||
            objectString.includes('firebase_firestore') ||
            objectString.includes('firebase_auth')) {
          return; // Suppress these object logs
        }
      } catch {
        // If JSON.stringify fails, check if it's an Error object
        if (args[0] instanceof Error) {
          const errorString = args[0].toString();
          if (shouldSuppressConsoleMessage(errorString)) {
            return;
          }
        }
      }
    }
    
    // Check for stack trace patterns in errors
    if (args.length === 1 && args[0] instanceof Error) {
      const errorString = args[0].stack || args[0].message || args[0].toString();
      if (shouldSuppressConsoleMessage(errorString)) {
        return;
      }
    }
    
    if (!shouldSuppressConsoleMessage(message)) {
      originalConsoleLog(...args);
    }
  };
};

// Restore original console methods
export const restoreConsole = () => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
};

export const shouldLogError = (error: Error & { code?: string }): boolean => {
  const now = Date.now();
  
  // Reset error count if enough time has passed
  if (now - lastErrorTime > ERROR_SUPPRESSION_WINDOW) {
    errorCount = 0;
  }
  
  lastErrorTime = now;
  
  // Check if it's a connection-related error
  const isConnectionError = 
    error.code === 'unavailable' ||
    error.message?.includes('offline') ||
    error.message?.includes('transport errored') ||
    error.message?.includes('WebChannelConnection') ||
    error.message?.includes('Failed to get document because the client is offline');
  
  if (isConnectionError) {
    errorCount++;
    
    // Only log the first few errors, then suppress
    if (errorCount <= MAX_LOGGED_ERRORS) {
      return true;
    } else if (errorCount === MAX_LOGGED_ERRORS + 1) {
      // Silently suppress further errors - no need to log this
    }
    return false;
  }
  
  // Always log non-connection errors
  return true;
};

export const getConnectionStatus = () => {
  return {
    isOnline: navigator.onLine,
    errorCount,
    lastErrorTime
  };
};

// Network status monitoring
export const initNetworkMonitoring = (onStatusChange?: (isOnline: boolean) => void) => {
  const handleOnline = () => {
    errorCount = 0; // Reset error count when back online
    onStatusChange?.(true);
  };
  
  const handleOffline = () => {
    onStatusChange?.(false);
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};