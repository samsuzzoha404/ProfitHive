import { User } from 'firebase/auth';
import { UserProfile } from '@/types/auth';

// Auth state caching utilities
const AUTH_CACHE_KEY = 'profithive_auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface CachedAuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  timestamp: number;
}

export const cacheAuthState = (user: User | null) => {
  try {
    const cacheData: CachedAuthState = {
      user: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      } : null,
      timestamp: Date.now()
    };
    
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache auth state:', error);
  }
};

export const getCachedAuthState = (): CachedAuthState | null => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;
    
    const cacheData: CachedAuthState = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (not expired)
    if (now - cacheData.timestamp > CACHE_DURATION) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }
    
    return cacheData;
  } catch (error) {
    console.warn('Failed to get cached auth state:', error);
    localStorage.removeItem(AUTH_CACHE_KEY);
    return null;
  }
};

export const clearAuthCache = () => {
  try {
    localStorage.removeItem(AUTH_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear auth cache:', error);
  }
};

// User profile caching
const PROFILE_CACHE_KEY = 'profithive_profile_cache';

export const cacheUserProfile = (profile: UserProfile) => {
  try {
    const cacheData = {
      profile,
      timestamp: Date.now()
    };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache user profile:', error);
  }
};

export const getCachedUserProfile = (): UserProfile | null => {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Cache profile for longer (15 minutes)
    if (now - cacheData.timestamp > 15 * 60 * 1000) {
      localStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }
    
    return cacheData.profile;
  } catch (error) {
    console.warn('Failed to get cached user profile:', error);
    localStorage.removeItem(PROFILE_CACHE_KEY);
    return null;
  }
};

export const clearProfileCache = () => {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear profile cache:', error);
  }
};