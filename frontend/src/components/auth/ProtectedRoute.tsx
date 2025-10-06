import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackContent?: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackContent,
  requireAuth = true 
}) => {
  const { 
    isAuthenticated, 
    loading, 
    showLoginModal, 
    setShowLoginModal 
  } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 glow-primary">
            <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // If authentication is not required or user is authenticated, show the content
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // Show fallback content with login prompt
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        {fallbackContent || (
          <div className="text-center max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
              className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 glow-primary"
            >
              <svg 
                className="h-10 w-10 text-primary-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Authentication Required
            </h2>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Please sign in to access this premium feature and unlock the full potential of ProfitHive's AI-powered platform.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-primary hover-glow text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg"
            >
              Sign In to Continue
            </motion.button>
          </div>
        )}
      </motion.div>

    </>
  );
};

export default ProtectedRoute;