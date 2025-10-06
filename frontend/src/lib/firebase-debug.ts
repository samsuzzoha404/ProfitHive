import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Debug utility to test Firebase connections
export const debugFirebaseConnection = async () => {
  console.log('🔥 Firebase Debug Information');
  
  // Check Firebase config
  console.log('Firebase Config:', {
    apiKey: auth.app.options.apiKey ? '✓ Set' : '✗ Missing',
    authDomain: auth.app.options.authDomain ? '✓ Set' : '✗ Missing',
    projectId: auth.app.options.projectId ? '✓ Set' : '✗ Missing',
  });

  // Check auth status
  console.log('Auth Status:', {
    currentUser: auth.currentUser ? '✓ Signed in' : '✗ Not signed in',
    userId: auth.currentUser?.uid || 'N/A'
  });

  // Test Firestore connection
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log('Firestore Connection: ✓ Connected');
  } catch (error) {
    console.log('Firestore Connection: ✗ Failed', error);
  }

  // Check network status
  console.log('Network Status:', {
    online: navigator.onLine ? '✓ Online' : '✗ Offline',
    userAgent: navigator.userAgent.includes('Chrome') ? '✓ Chrome' : '? Other browser'
  });
};

// Call this in development to debug issues
if (import.meta.env.DEV) {
  (window as unknown as { debugFirebase: () => Promise<void> }).debugFirebase = debugFirebaseConnection;
  // Debug function available in console if needed
}