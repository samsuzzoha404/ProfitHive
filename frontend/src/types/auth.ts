import { createContext } from 'react';
import { User, UserCredential } from 'firebase/auth';
import { Timestamp, FieldValue } from 'firebase/firestore';

// Types
export interface AuthUser extends User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp | FieldValue | null;
  lastLoginAt: Timestamp | FieldValue | null;
  role: 'user' | 'retailer' | 'investor';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

export interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  googleSignInLoading: boolean;
  isAuthenticated: boolean;
  
  // Authentication methods
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // UI state
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);