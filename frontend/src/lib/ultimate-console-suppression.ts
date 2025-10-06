// Ultimate console spam suppression - this handles browser-level network error logging

// Store original console methods
const originalMethods = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
  trace: console.trace,
  group: console.group,
  groupCollapsed: console.groupCollapsed,
  groupEnd: console.groupEnd,
  table: console.table,
  time: console.time,
  timeEnd: console.timeEnd
};

// Comprehensive patterns for Firebase/Firestore errors
const SUPPRESS_PATTERNS = [
  // Network errors
  'Failed to load resource: the server responded with a status of 400',
  'Failed to load resource: the server responded with a status of 403', 
  'net::ERR_ABORTED 400',
  'net::ERR_ABORTED 403',
  '400 (Bad Request)',
  '403 (Forbidden)',
  
  // Firebase URLs
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'Listen/channel?gsessionid=',
  'projects%2Fprofithive-f5410%2Fdatabases',
  'projects%2Fprofithive-2a203%2Fdatabases',
  'profithive-f5410',
  'profithive-2a203',
  
  // Stack traces
  's.fetch @',
  'fetch @',
  'window.fetch @',
  'firebase_firestore.js',
  'firebase_auth.js',
  'requests.js:1',
  'traffic.js:1',
  
  // Error types
  'Cross-Origin-Opener-Policy policy would block',
  'poll @',
  '__PRIVATE_sendWatchRequest',
  '__PRIVATE_onWatchStreamOpen',
  '__PRIVATE_onWatchStreamClose',
  '__PRIVATE_startWatchStream',
  'enqueueAndForget',
  'handleDelayElapsed',
  'Promise.then',
  'setTimeout',
  'Understand this error',
  
  // Web3Modal
  'api.web3modal.org',
  'pulse.walletconnect.org',
  'chunk-FFWCJP5A.js',
  'chunk-NPY75PGV.js',
  'index.es-SSJLC7JO.js'
];

// Check if any argument contains suppressed patterns
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shouldSuppressArgs = (args: any[]): boolean => {
  const fullMessage = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return arg.message + '\n' + (arg.stack || '');
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');

  return SUPPRESS_PATTERNS.some(pattern => 
    fullMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

// Override all console methods
const overrideConsoleMethods = () => {
  console.log = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.log.apply(console, args);
    }
  };

  console.warn = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.warn.apply(console, args);
    }
  };

  console.error = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.error.apply(console, args);
    }
  };

  console.info = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.info.apply(console, args);
    }
  };

  console.debug = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.debug.apply(console, args);
    }
  };

  console.trace = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.trace.apply(console, args);
    }
  };

  // Group methods
  console.group = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.group.apply(console, args);
    }
  };

  console.groupCollapsed = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.groupCollapsed.apply(console, args);
    }
  };

  // Table method
  console.table = function(...args) {
    if (!shouldSuppressArgs(args)) {
      originalMethods.table.apply(console, args);
    }
  };
};

// Initialize console suppression
export const initUltimateConsoleSuppression = () => {
  if (process.env.NODE_ENV === 'development') {
    overrideConsoleMethods();
    
    // Also suppress DevTools console directly by intercepting errors
    const originalOnerror = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof message === 'string' && shouldSuppressArgs([message])) {
        return true; // Suppress the error
      }
      if (originalOnerror) {
        return originalOnerror.call(this, message, source, lineno, colno, error);
      }
      return false;
    };
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  initUltimateConsoleSuppression();
}