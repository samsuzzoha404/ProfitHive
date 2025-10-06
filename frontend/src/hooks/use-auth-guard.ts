import { useAuth } from '@/hooks/use-auth';
import { useCallback } from 'react';

export const useAuthGuard = () => {
  const { isAuthenticated, setShowLoginModal } = useAuth();

  const requireAuth = useCallback((callback?: () => void) => {
    if (isAuthenticated) {
      callback?.();
      return true;
    } else {
      setShowLoginModal(true);
      return false;
    }
  }, [isAuthenticated, setShowLoginModal]);

  return {
    isAuthenticated,
    requireAuth
  };
};