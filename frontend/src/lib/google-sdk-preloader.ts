/**
 * Google SDK Preloader
 * Preloads Google Identity Services to reduce initial sign-in delay
 */

// Preload Google Identity Services
export const preloadGoogleSDK = (): void => {
  // Only preload in production or when explicitly enabled
  if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_GOOGLE_PRELOAD) {
    return;
  }

  // Add Google Identity Services to the page early
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  
  // Add to head for faster loading
  document.head.appendChild(script);

  // Preload Google APIs JavaScript client
  const apiScript = document.createElement('script');
  apiScript.src = 'https://apis.google.com/js/api.js';
  apiScript.async = true;
  apiScript.defer = true;
  
  document.head.appendChild(apiScript);

  // Preconnect to Google domains
  const preconnectDomains = [
    'https://accounts.google.com',
    'https://apis.google.com',
    'https://www.googleapis.com',
    'https://ssl.gstatic.com'
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // DNS prefetch for additional speed
  const dnsPrefetchDomains = [
    'https://accounts.google.com',
    'https://apis.google.com',
    'https://fonts.googleapis.com',
    'https://www.google.com'
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Initialize Google SDK configurations early
export const initializeGoogleSDK = (): void => {
  if (typeof window === 'undefined') return;

  // Wait for script to load, then initialize
  const checkForGoogle = () => {
    const googleAPI = (window as { google?: { accounts?: { id?: { initialize?: (config: Record<string, unknown>) => void } } } }).google;
    
    if (googleAPI) {
      try {
        // Pre-warm the Google Identity Services
        googleAPI.accounts?.id?.initialize?.({
          client_id: import.meta.env.VITE_FIREBASE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: () => {}, // Dummy callback for initialization
          auto_select: false,
          cancel_on_tap_outside: true
        });
      } catch (error) {
        console.debug('Google SDK pre-initialization failed:', error);
      }
    } else {
      // Retry after a short delay
      setTimeout(checkForGoogle, 100);
    }
  };

  // Start checking after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForGoogle);
  } else {
    checkForGoogle();
  }
};

// Call preloader immediately when module is imported
preloadGoogleSDK();