import { initializeApp, getApp, getApps, setLogLevel } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

// Disable Firebase SDK logging in development
if (import.meta.env.VITE_NODE_ENV === 'development') {
  setLogLevel('silent');
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    console.error('Missing Firebase config:', missing);
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }
};

// Validate config before initializing
validateConfig();

// Initialize Firebase (singleton pattern to avoid re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication with persistence
export const auth = getAuth(app);

// Initialize Cloud Firestore with optimized offline support and caching
let db: ReturnType<typeof getFirestore>;

try {
  // Initialize Firestore with persistent cache for better performance
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    }),
    // Add connection retry configuration
    experimentalForceLongPolling: true, // Use long polling for better connection stability
    ignoreUndefinedProperties: true
  });
  
  // Firestore initialized with persistent cache
} catch (error) {
  // Fallback to default initialization if persistent cache fails
  console.warn('Failed to initialize Firestore with persistent cache, using default:', error);
  db = getFirestore(app);
}

// Connection monitoring and retry logic
let isOffline = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Monitor connection status
const handleConnectionError = async (error: Error & { code?: string }) => {
  if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
    if (!isOffline) {
      isOffline = true;
      console.log('🔄 Firestore connection lost, switching to offline mode');
    }
    
    // Attempt to reconnect with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      setTimeout(async () => {
        try {
          await enableNetwork(db);
          isOffline = false;
          retryCount = 0;
          console.log('✅ Firestore connection restored');
        } catch (retryError) {
          retryCount++;
          console.log(`🔄 Reconnection attempt ${retryCount} failed`);
          if (retryCount >= MAX_RETRIES) {
            console.log('⚠️ Maximum retry attempts reached, staying offline');
          }
        }
      }, delay);
    }
  }
};

// Export connection helper
export const getConnectionStatus = () => ({ isOffline, retryCount });
export const forceReconnect = async () => {
  try {
    await enableNetwork(db);
    isOffline = false;
    retryCount = 0;
    console.log('✅ Manual reconnection successful');
  } catch (error) {
    console.error('❌ Manual reconnection failed:', error);
    throw error;
  }
};

export { db };

// Enable offline persistence and handle network connectivity
try {
  // Enable network connectivity (helpful for debugging)
  enableNetwork(db).catch((error) => {
    console.warn('Failed to enable Firestore network:', error);
  });
} catch (error) {
  console.warn('Firestore network setup warning:', error);
}

// Export utility functions for network management
export const enableFirestoreNetwork = () => enableNetwork(db);
export const disableFirestoreNetwork = () => disableNetwork(db);

export default app;