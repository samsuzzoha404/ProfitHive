// Performance monitoring for authentication
let authStartTime = 0;
let cacheHitCount = 0;
let cacheMissCount = 0;
let hasTimerStarted = false;

export const startAuthTimer = () => {
  if (!hasTimerStarted) {
    authStartTime = performance.now();
    hasTimerStarted = true;
  }
};

export const resetAuthTimer = () => {
  authStartTime = 0;
  hasTimerStarted = false;
};

export const recordCacheHit = () => {
  if (!hasTimerStarted) return 0;
  
  cacheHitCount++;
  const loadTime = performance.now() - authStartTime;
  console.log(`⚡ Auth cache hit - loaded in ${loadTime.toFixed(1)}ms`);
  resetAuthTimer(); // Reset after recording
  return loadTime;
};

export const recordCacheMiss = () => {
  if (!hasTimerStarted) return 0;
  
  cacheMissCount++;
  const loadTime = performance.now() - authStartTime;
  console.log(`🐌 Auth cache miss - loaded in ${loadTime.toFixed(1)}ms`);
  resetAuthTimer(); // Reset after recording
  return loadTime;
};

export const getPerformanceStats = () => {
  const totalRequests = cacheHitCount + cacheMissCount;
  const cacheHitRate = totalRequests > 0 ? (cacheHitCount / totalRequests) * 100 : 0;
  
  return {
    cacheHitCount,
    cacheMissCount,
    totalRequests,
    cacheHitRate: Math.round(cacheHitRate)
  };
};

export const logPerformanceStats = () => {
  const stats = getPerformanceStats();
  if (stats.totalRequests > 0) {
    console.log(`📊 Auth Performance Stats:
    Cache Hits: ${stats.cacheHitCount}
    Cache Misses: ${stats.cacheMissCount}
    Hit Rate: ${stats.cacheHitRate}%`);
  }
};