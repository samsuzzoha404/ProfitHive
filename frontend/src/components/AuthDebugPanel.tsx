import { useState, useEffect } from 'react';
import { getCachedAuthState, getCachedUserProfile } from '@/lib/auth-cache';

export const AuthDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState({
    hasCachedAuth: false,
    hasCachedProfile: false,
    isOnline: navigator.onLine,
    cacheTimestamp: null as number | null
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      const cachedAuth = getCachedAuthState();
      const cachedProfile = getCachedUserProfile();

      setDebugInfo({
        hasCachedAuth: !!cachedAuth,
        hasCachedProfile: !!cachedProfile,
        isOnline: navigator.onLine,
        cacheTimestamp: cachedAuth?.timestamp || null
      });
    };

    // Update immediately
    updateDebugInfo();

    // Update every 10 seconds instead of 5 to reduce load
    const interval = setInterval(updateDebugInfo, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">🔧 Auth Debug</div>
      <div className="space-y-1">
        <div className={`flex items-center gap-2 ${debugInfo.hasCachedAuth ? 'text-green-400' : 'text-red-400'}`}>
          <span>{debugInfo.hasCachedAuth ? '✅' : '❌'}</span>
          <span>Auth Cache</span>
        </div>
        <div className={`flex items-center gap-2 ${debugInfo.hasCachedProfile ? 'text-green-400' : 'text-red-400'}`}>
          <span>{debugInfo.hasCachedProfile ? '✅' : '❌'}</span>
          <span>Profile Cache</span>
        </div>
        <div className={`flex items-center gap-2 ${debugInfo.isOnline ? 'text-green-400' : 'text-yellow-400'}`}>
          <span>{debugInfo.isOnline ? '🌐' : '📡'}</span>
          <span>{debugInfo.isOnline ? 'Online' : 'Offline'}</span>
        </div>
        {debugInfo.cacheTimestamp && (
          <div className="text-gray-300 text-xs mt-2">
            Cache: {new Date(debugInfo.cacheTimestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};