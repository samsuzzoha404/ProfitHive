import React, { useState, useEffect, memo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { enableFirestoreNetwork, disableFirestoreNetwork } from '@/lib/firebase';

const NetworkStatus: React.FC = memo(() => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
      // Re-enable Firestore network
      enableFirestoreNetwork().catch(console.warn);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await enableFirestoreNetwork();
      setTimeout(() => setIsReconnecting(false), 1000);
    } catch (error) {
      console.warn('Failed to reconnect:', error);
      setIsReconnecting(false);
    }
  };

  if (!showOfflineAlert && isOnline) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto">
      <Alert variant={isOnline ? "default" : "destructive"} className="glass border-primary/20">
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription className="flex items-center justify-between">
          <span>
            {isOnline 
              ? "Back online! Some features may need refreshing." 
              : "You're offline. Some features may not work."
            }
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            disabled={isReconnecting}
            className="ml-2"
          >
            {isReconnecting ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
});

NetworkStatus.displayName = 'NetworkStatus';

export default NetworkStatus;