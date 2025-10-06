import React, { useEffect, useState, ReactNode, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  UserCredential,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType, AuthUser, UserProfile, AuthContext } from '@/types/auth';
import { handleFirebaseError, logFirebaseError } from '@/lib/firebase-error-handler';
import { cacheAuthState, getCachedAuthState, clearAuthCache, cacheUserProfile, getCachedUserProfile, clearProfileCache } from '@/lib/auth-cache';
import { shouldLogError, initNetworkMonitoring, initConsoleFiltering } from '@/lib/connection-monitor';


// Google Auth Provider with optimized configuration
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  // Remove select_account to speed up the process for returning users
  prompt: 'consent',
  // Enable faster authentication flow
  access_type: 'online',
  // Reduce the number of permission requests
  include_granted_scopes: 'true'
});

// Only request essential scopes for faster loading
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.addScope('profile');

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleSignInLoading, setGoogleSignInLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Create or update user profile in Firestore
  const createUserProfile = useCallback(async (user: User, additionalData: Partial<UserProfile> = {}) => {
    if (!user) return;

    // Check for cached profile first
    const cachedProfile = getCachedUserProfile();
    if (cachedProfile && cachedProfile.uid === user.uid) {
      setUserProfile(cachedProfile);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const { displayName, email, photoURL } = user;
        const userData: Omit<UserProfile, 'uid'> = {
          email: email || '',
          displayName: displayName || email?.split('@')[0] || 'User',
          photoURL,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          role: 'user',
          preferences: {
            theme: 'system',
            notifications: true
          },
          ...additionalData
        };

        try {
          await setDoc(userRef, userData);
          const newProfile: UserProfile = { uid: user.uid, ...userData };
          setUserProfile(newProfile);
          // Cache the new profile
          cacheUserProfile(newProfile);
        } catch (error) {
          const firestoreError = error as Error & { code?: string };
          if (shouldLogError(firestoreError)) {
            console.error('Error creating user profile:', error);
          }
          // Don't show error toast for offline scenarios - create basic profile
          const offlineProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL,
            createdAt: null,
            lastLoginAt: null,
            role: 'user',
            preferences: {
              theme: 'system',
              notifications: true
            }
          };
          setUserProfile(offlineProfile);
          // Cache the offline profile
          cacheUserProfile(offlineProfile);
        }
      } else {
        // Update last login time
        try {
          await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
          const profileData = userDoc.data() as Omit<UserProfile, 'uid'>;
          const fullProfile = { uid: user.uid, ...profileData };
          setUserProfile(fullProfile);
          // Cache the updated profile
          cacheUserProfile(fullProfile);
        } catch (error) {
          const firestoreError = error as Error & { code?: string };
          if (shouldLogError(firestoreError)) {
            console.error('Error updating user profile:', error);
          }
          // Use cached data if available
          const profileData = userDoc.data() as Omit<UserProfile, 'uid'>;
          const fullProfile = { uid: user.uid, ...profileData };
          setUserProfile(fullProfile);
          // Cache the profile even if update failed
          cacheUserProfile(fullProfile);
        }
      }
    } catch (error) {
      const firestoreError = error as Error & { code?: string };
      
      if (firestoreError.code === 'unavailable' || firestoreError.message?.includes('offline')) {
        // Working offline with cached data - no need for noise
      } else if (shouldLogError(firestoreError)) {
        console.error('Error accessing Firestore:', error);
      }
      
      // Create a basic profile from user data when Firestore is unavailable
      const basicProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        createdAt: null,
        lastLoginAt: null,
        role: 'user',
        preferences: {
          theme: 'system',
          notifications: true
        }
      };
      setUserProfile(basicProfile);
      // Cache the basic profile
      cacheUserProfile(basicProfile);
    }
  }, []);

  // Authentication methods
  const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      return result;
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = getAuthErrorMessage(authError.code);
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile
      await createUserProfile(result.user, { displayName });
      
      toast({
        title: "Account Created!",
        description: `Welcome to ProfitHive, ${displayName}!`,
      });
      
      return result;
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = getAuthErrorMessage(authError.code);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<UserCredential> => {
    setGoogleSignInLoading(true);
    
    try {
      // Set a shorter timeout for the popup
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Google sign-in timeout')), 15000); // 15 second timeout
      });

      // Race between sign-in and timeout
      const result = await Promise.race([
        signInWithPopup(auth, googleProvider),
        timeoutPromise
      ]);

      // Show immediate success feedback
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });

      // Create user profile asynchronously (don't block the UI)
      createUserProfile(result.user).catch(error => {
        console.warn('Profile creation delayed:', error);
        // Profile will be created on next auth state change
      });
      
      return result;
    } catch (error) {
      const authError = error as AuthError;
      
      // Handle timeout
      if (error instanceof Error && error.message === 'Google sign-in timeout') {
        toast({
          title: "Sign-in Taking Too Long",
          description: "Google sign-in is slow. Please try again or check your connection.",
          variant: "destructive",
        });
        throw new Error('auth/timeout');
      }
      
      // Log the error for debugging
      logFirebaseError(authError, 'Google Sign In');
      
      // Don't show error for user-cancelled popup
      if (authError.code === 'auth/popup-closed-by-user') {
        return Promise.reject(authError);
      }
      
      // Handle popup blocked
      if (authError.code === 'auth/popup-blocked') {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again, or try a different browser.",
          variant: "destructive",
        });
        throw authError;
      }
      
      // Handle all other errors with improved error handling
      const errorInfo = handleFirebaseError(authError);
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });
      
      throw authError;
    } finally {
      setGoogleSignInLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserProfile(null);
      // Clear all cached authentication data
      clearAuthCache();
      clearProfileCache();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "There was an issue signing you out. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = getAuthErrorMessage(authError.code);
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, data, { merge: true });
      
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an issue updating your profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Auth state listener with caching
  useEffect(() => {
    // Simplified auth state listener to prevent conflicts
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const authUser = user as AuthUser;
        setCurrentUser(authUser);
        
        // Don't await - run profile creation in background
        createUserProfile(user).catch(error => {
          // Silent handling of profile creation errors
          if (shouldLogError(error)) {
            console.warn('Profile creation failed:', error);
          }
        });
        
        // Cache the auth state
        cacheAuthState(authUser);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        // Clear cached auth state on logout
        localStorage.removeItem('auth_state');
        localStorage.removeItem('user_profile');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [createUserProfile]); // Simplified dependencies to prevent infinite loop

  // Initialize console filtering and network monitoring (only once)
  useEffect(() => {
    // Temporarily disabled to debug blinking issue
    // initConsoleFiltering();
    
    // const cleanup = initNetworkMonitoring((online) => {
    //   setIsOnline(online);
    //   // Silently handle network status changes
    // });
    // return cleanup;
  }, []); // Remove currentUser dependency - only initialize once

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    googleSignInLoading,
    isAuthenticated: !!currentUser,
    
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    
    showLoginModal,
    setShowLoginModal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please allow popups and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in popup was cancelled. Please try again.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    case 'unavailable':
      return 'Service temporarily unavailable. Please check your connection.';
    default:
      if (errorCode?.includes('offline') || errorCode?.includes('network')) {
        return 'You appear to be offline. Please check your internet connection.';
      }
      return 'An unexpected error occurred. Please try again.';
  }
};