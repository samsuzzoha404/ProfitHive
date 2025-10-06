import { FirebaseError } from 'firebase/app';
import { AuthError } from 'firebase/auth';

export interface FirebaseErrorInfo {
  title: string;
  description: string;
  shouldRetry: boolean;
  isRecoverable: boolean;
}

export const handleFirebaseError = (error: FirebaseError | AuthError | Error): FirebaseErrorInfo => {
  // Handle Firebase Auth errors
  if ('code' in error) {
    switch (error.code) {
      case 'auth/popup-blocked':
      case 'auth/cancelled-popup-request':
        return {
          title: 'Popup Blocked',
          description: 'Please allow popups for this site and try again.',
          shouldRetry: true,
          isRecoverable: true
        };

      case 'auth/network-request-failed':
        return {
          title: 'Network Error',
          description: 'Please check your internet connection and try again.',
          shouldRetry: true,
          isRecoverable: true
        };

      case 'firestore/unavailable':
      case 'firestore/deadline-exceeded':
        return {
          title: 'Service Temporarily Unavailable',
          description: 'Our services are experiencing issues. Please try again in a moment.',
          shouldRetry: true,
          isRecoverable: true
        };

      case 'firestore/permission-denied':
        return {
          title: 'Access Denied',
          description: 'You don\'t have permission to access this resource.',
          shouldRetry: false,
          isRecoverable: false
        };

      default:
        return {
          title: 'An Error Occurred',
          description: error.message || 'Something went wrong. Please try again.',
          shouldRetry: true,
          isRecoverable: true
        };
    }
  }

  // Handle Cross-Origin-Opener-Policy errors
  if (error.message?.includes('Cross-Origin-Opener-Policy')) {
    return {
      title: 'Browser Security Issue',
      description: 'Your browser security settings are blocking authentication. Please refresh the page and try again.',
      shouldRetry: true,
      isRecoverable: true
    };
  }

  // Handle window.closed errors (popup closed unexpectedly)
  if (error.message?.includes('window.closed')) {
    return {
      title: 'Authentication Popup Closed',
      description: 'The authentication popup was closed. Please try signing in again.',
      shouldRetry: true,
      isRecoverable: true
    };
  }

  // Handle generic network errors
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('NetworkError') ||
      error.message?.includes('ERR_NETWORK')) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to our servers. Please check your internet connection.',
      shouldRetry: true,
      isRecoverable: true
    };
  }

  // Default error handler
  return {
    title: 'Unexpected Error',
    description: error.message || 'An unexpected error occurred. Please try again.',
    shouldRetry: true,
    isRecoverable: true
  };
};

// Utility to check if we should show a retry button
export const shouldShowRetry = (error: FirebaseError | AuthError | Error): boolean => {
  const errorInfo = handleFirebaseError(error);
  return errorInfo.shouldRetry;
};

// Utility to check if the error is recoverable
export const isRecoverableError = (error: FirebaseError | AuthError | Error): boolean => {
  const errorInfo = handleFirebaseError(error);
  return errorInfo.isRecoverable;
};

// Enhanced logging for Firebase errors
export const logFirebaseError = (error: FirebaseError | AuthError | Error, context: string) => {
  // Skip logging for common configuration errors in development
  const skipErrors = [
    'auth/unauthorized-domain',
    'auth/network-request-failed',
    'unavailable'
  ];
  
  const errorCode = 'code' in error ? error.code : '';
  if (skipErrors.includes(errorCode)) {
    return; // Silent handling for expected dev errors
  }
  
  const errorInfo = handleFirebaseError(error);
  
  console.group(`🔥 Firebase Error in ${context}`);
  console.error('Error Object:', error);
  console.log('Error Code:', errorCode || 'N/A');
  console.log('Error Message:', error.message);
  console.log('Recoverable:', errorInfo.isRecoverable);
  console.log('Should Retry:', errorInfo.shouldRetry);
  console.groupEnd();
};