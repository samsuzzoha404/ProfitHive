// Simple performance indicator for authentication
const sessionStartTime = Date.now();
const authEvents: Array<{type: 'cache_hit' | 'cache_miss' | 'firebase_load', timestamp: number}> = [];

export const logAuthEvent = (type: 'cache_hit' | 'cache_miss' | 'firebase_load') => {
  const now = Date.now();
  authEvents.push({ type, timestamp: now });
  
  // Silent operation - performance tracking only
};

export const getAuthSummary = () => {
  const cacheHits = authEvents.filter(e => e.type === 'cache_hit').length;
  const cacheMisses = authEvents.filter(e => e.type === 'cache_miss').length;
  const total = cacheHits + cacheMisses;
  
  if (total > 0) {
    const hitRate = Math.round((cacheHits / total) * 100);
    console.log(`📊 Auth Performance: ${cacheHits}/${total} cache hits (${hitRate}% hit rate)`);
  }
};

// Summary available on demand via getAuthSummary() if needed