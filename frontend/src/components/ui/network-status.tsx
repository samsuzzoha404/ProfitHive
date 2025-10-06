import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NetworkStatusProps {
  isOnline: boolean;
  hasFirebaseError?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  isOnline, 
  hasFirebaseError = false 
}) => {
  if (isOnline && !hasFirebaseError) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <Alert variant={isOnline ? "default" : "destructive"} className="border-l-4">
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <WifiOff className="h-4 w-4" />
            ) : hasFirebaseError ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            <AlertDescription>
              {!isOnline 
                ? "You're offline. Some features may not work properly."
                : hasFirebaseError 
                ? "Connection to our servers is having issues. Please try again."
                : "Connected"
              }
            </AlertDescription>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};