/**
 * Prophet Wrapper Service
 * =======================
 * 
 * Node.js wrapper for the Python Prophet forecasting service.
 * Handles process spawning, data serialization, caching, and error handling.
 */

import { spawn, execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PYTHON_PATH = process.env.PYTHON_PATH || 'py'; // Use 'py' for Windows Python launcher
const SCRIPT_PATH = path.join(__dirname, '..', 'python', 'prophet_service.py');
const DATA_DIR = path.join(__dirname, '..', 'data');
const CACHE_FILE = path.join(DATA_DIR, 'forecast_cache.json');
const TEMP_DIR = path.join(DATA_DIR, 'temp');
const TIMEOUT_MS = 120000; // 2 minutes
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000; // 1 second

/**
 * Prophet Wrapper Class
 */
class ProphetWrapper {
    constructor() {
        this.cache = new Map();
        this.initializeDirectories();
        this.loadCache();
    }

    /**
     * Initialize required directories
     */
    async initializeDirectories() {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            await fs.mkdir(TEMP_DIR, { recursive: true });
        } catch (error) {
            console.error('Failed to create directories:', error);
        }
    }

    /**
     * Load forecast cache from disk
     */
    async loadCache() {
        try {
            const cacheData = await fs.readFile(CACHE_FILE, 'utf8');
            const cached = JSON.parse(cacheData);
            
            // Load non-expired entries
            const now = Date.now();
            for (const [key, value] of Object.entries(cached)) {
                if (value.expires > now) {
                    this.cache.set(key, value);
                }
            }
            
            console.log(`Loaded ${this.cache.size} cached forecasts`);
        } catch (error) {
            console.log('No existing cache found, starting fresh');
        }
    }

    /**
     * Save forecast cache to disk
     */
    async saveCache() {
        try {
            const cacheData = {};
            for (const [key, value] of this.cache.entries()) {
                cacheData[key] = value;
            }
            
            await fs.writeFile(CACHE_FILE, JSON.stringify(cacheData, null, 2));
        } catch (error) {
            console.error('Failed to save cache:', error);
        }
    }

    /**
     * Generate cache key for forecast parameters
     */
    generateCacheKey(historyArray, predictPeriods, freq, retailerId = null) {
        const keyData = {
            history: historyArray.slice(-30), // Only use last 30 records for cache key
            predictPeriods,
            freq,
            retailerId
        };
        
        return crypto
            .createHash('md5')
            .update(JSON.stringify(keyData))
            .digest('hex');
    }

    /**
     * Check if forecast is cached and still valid
     */
    getCachedForecast(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (!cached) return null;
        
        if (Date.now() > cached.expires) {
            this.cache.delete(cacheKey);
            return null;
        }
        
        console.log('Using cached forecast');
        return cached.data;
    }

    /**
     * Cache forecast result
     */
    setCachedForecast(cacheKey, forecast) {
        const expires = Date.now() + CACHE_TTL_MS;
        this.cache.set(cacheKey, {
            data: forecast,
            expires,
            created: Date.now()
        });
        
        // Async save to disk (don't wait)
        this.saveCache().catch(console.error);
    }

    /**
     * Execute Python Prophet service with retry logic
     */
    async executeWithRetry(inputData, attempt = 1) {
        try {
            return await this.executePythonScript(inputData);
        } catch (error) {
            if (attempt >= MAX_RETRIES) {
                throw new Error(`Prophet service failed after ${MAX_RETRIES} attempts: ${error.message}`);
            }
            
            const delay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
            console.log(`Retry ${attempt}/${MAX_RETRIES} in ${delay}ms:`, error.message);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.executeWithRetry(inputData, attempt + 1);
        }
    }

    /**
     * Execute Python script with input data
     */
    async executePythonScript(inputData) {
        return new Promise((resolve, reject) => {
            // Create temporary input file to avoid CLI argument length limits
            const tempId = crypto.randomBytes(8).toString('hex');
            const tempInputFile = path.join(TEMP_DIR, `input_${tempId}.json`);
            
            let pythonProcess = null;
            let timeoutId = null;
            let outputData = '';
            let errorData = '';

            const cleanup = async () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (pythonProcess && !pythonProcess.killed) {
                    pythonProcess.kill('SIGTERM');
                }
                try {
                    await fs.unlink(tempInputFile);
                } catch (error) {
                    // Ignore cleanup errors
                }
            };

            // Setup timeout
            timeoutId = setTimeout(async () => {
                await cleanup();
                reject(new Error(`Prophet service timeout after ${TIMEOUT_MS}ms`));
            }, TIMEOUT_MS);

            // Write input data to temp file and spawn process
            fs.writeFile(tempInputFile, JSON.stringify(inputData))
                .then(() => {
                    console.log('Executing Prophet service...');
                    
                    // Spawn Python process
                    pythonProcess = spawn(PYTHON_PATH, [SCRIPT_PATH, 'predict'], {
                        stdio: ['pipe', 'pipe', 'pipe']
                    });

                    // Send input via stdin
                    pythonProcess.stdin.write(JSON.stringify(inputData));
                    pythonProcess.stdin.end();

                    // Collect output
                    pythonProcess.stdout.on('data', (data) => {
                        outputData += data.toString();
                    });

                    pythonProcess.stderr.on('data', (data) => {
                        errorData += data.toString();
                    });

                    pythonProcess.on('close', async (code) => {
                        await cleanup();
                        
                        if (code !== 0) {
                            const error = errorData || `Process exited with code ${code}`;
                            reject(new Error(`Prophet service error: ${error}`));
                            return;
                        }

                        try {
                            const result = JSON.parse(outputData);
                            
                            if (result.error) {
                                reject(new Error(`Prophet service error: ${result.error}`));
                                return;
                            }
                            
                            console.log('Prophet service completed successfully');
                            resolve(result);
                        } catch (parseError) {
                            reject(new Error(`Failed to parse Prophet output: ${parseError.message}`));
                        }
                    });

                    pythonProcess.on('error', async (error) => {
                        await cleanup();
                        reject(new Error(`Failed to spawn Prophet process: ${error.message}`));
                    });
                })
                .catch(async (error) => {
                    await cleanup();
                    reject(new Error(`Failed to write temp input file: ${error.message}`));
                });
        });
    }

    /**
     * Call Prophet predict service
     * @param {Array} historyArray - Array of historical data points with ds, y, and regressors
     * @param {number} predictPeriods - Number of periods to forecast
     * @param {string} freq - Frequency ('D' for daily, 'H' for hourly)
     * @param {string} retailerId - Optional retailer ID for model selection
     * @returns {Promise<Object>} Forecast result
     */
    async callProphetPredict(historyArray, predictPeriods = 14, freq = 'D', retailerId = null) {
        try {
            console.log(`Calling Prophet predict: ${predictPeriods} ${freq} periods for ${historyArray.length} history points`);
            
            // Validate inputs
            if (!Array.isArray(historyArray) || historyArray.length === 0) {
                throw new Error('History array must be non-empty array');
            }

            if (predictPeriods <= 0 || predictPeriods > 365) {
                throw new Error('Predict periods must be between 1 and 365');
            }

            if (!['D', 'H'].includes(freq)) {
                throw new Error('Frequency must be D (daily) or H (hourly)');
            }

            // Check cache first
            const cacheKey = this.generateCacheKey(historyArray, predictPeriods, freq, retailerId);
            const cachedResult = this.getCachedForecast(cacheKey);
            
            if (cachedResult) {
                return cachedResult;
            }

            // Prepare input data
            const inputData = {
                history: historyArray,
                predict_periods: predictPeriods,
                freq: freq,
                retailer_id: retailerId
            };

            // Execute Prophet service with retries
            const result = await this.executeWithRetry(inputData);

            // Cache the result
            this.setCachedForecast(cacheKey, result);

            return result;

        } catch (error) {
            console.error('Prophet predict failed:', error.message);
            throw error;
        }
    }

    /**
     * Train Prophet model
     * @param {Array} historyArray - Training data
     * @param {string} retailerId - Retailer ID for model storage
     * @returns {Promise<Object>} Training result
     */
    async trainProphetModel(historyArray, retailerId = null) {
        try {
            console.log(`Training Prophet model for retailer: ${retailerId}`);
            
            if (!Array.isArray(historyArray) || historyArray.length < 10) {
                throw new Error('Training requires at least 10 historical data points');
            }

            const inputData = {
                history: historyArray,
                retailer_id: retailerId
            };

            // Create temp file for training data
            const tempId = crypto.randomBytes(8).toString('hex');
            const tempTrainFile = path.join(TEMP_DIR, `train_${tempId}.json`);
            
            try {
                await fs.writeFile(tempTrainFile, JSON.stringify(inputData));
                
                return new Promise((resolve, reject) => {
                    const pythonProcess = spawn(PYTHON_PATH, [SCRIPT_PATH, 'train', '--data', tempTrainFile]);
                    
                    let outputData = '';
                    let errorData = '';

                    pythonProcess.stdout.on('data', (data) => {
                        outputData += data.toString();
                    });

                    pythonProcess.stderr.on('data', (data) => {
                        errorData += data.toString();
                    });

                    pythonProcess.on('close', async (code) => {
                        // Cleanup temp file
                        try {
                            await fs.unlink(tempTrainFile);
                        } catch (error) {
                            // Ignore cleanup errors
                        }

                        if (code !== 0) {
                            reject(new Error(`Training failed: ${errorData}`));
                            return;
                        }

                        try {
                            const result = JSON.parse(outputData);
                            resolve(result);
                        } catch (parseError) {
                            reject(new Error(`Failed to parse training output: ${parseError.message}`));
                        }
                    });

                    pythonProcess.on('error', (error) => {
                        reject(new Error(`Failed to spawn training process: ${error.message}`));
                    });
                });
            } catch (error) {
                throw new Error(`Failed to create training file: ${error.message}`);
            }

        } catch (error) {
            console.error('Prophet training failed:', error.message);
            throw error;
        }
    }

    /**
     * Clear forecast cache
     */
    async clearCache() {
        this.cache.clear();
        try {
            await fs.unlink(CACHE_FILE);
            console.log('Forecast cache cleared');
        } catch (error) {
            console.log('No cache file to clear');
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const [key, value] of this.cache.entries()) {
            if (value.expires > now) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        }

        return {
            validEntries,
            expiredEntries,
            totalEntries: this.cache.size,
            cacheFile: CACHE_FILE
        };
    }
}

// Create singleton instance
const prophetWrapper = new ProphetWrapper();

// ES6 Export functions
export const callProphetPredict = (historyArray, predictPeriods, freq, retailerId) => 
    prophetWrapper.callProphetPredict(historyArray, predictPeriods, freq, retailerId);

export const trainProphetModel = (historyArray, retailerId) => 
    prophetWrapper.trainProphetModel(historyArray, retailerId);

export const clearCache = () => prophetWrapper.clearCache();

export const getCacheStats = () => prophetWrapper.getCacheStats();

// For testing
export const _wrapper = prophetWrapper;
