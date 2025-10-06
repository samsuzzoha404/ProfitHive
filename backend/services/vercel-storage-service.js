import fs from 'fs';
import path from 'path';

/**
 * Vercel-Compatible Storage Service
 * Handles data storage with fallback for serverless environments
 * In Vercel: Uses in-memory storage only
 * In development: Uses file system storage
 */

class VercelStorageService {
  constructor(dataDir = 'data') {
    this.dataDir = dataDir;
    this.forecastFile = path.join(dataDir, 'forecast_results.json');
    this.historyFile = path.join(dataDir, 'forecast_history.json');
    this.isVercel = !!process.env.VERCEL;
    
    // In-memory storage for Vercel
    this.memoryStore = {
      forecasts: {},
      history: [],
      stats: {
        total_forecasts: 0,
        last_updated: new Date().toISOString()
      }
    };

    // Initialize storage based on environment
    this.initializeStorage();
  }

  /**
   * Initialize storage - different behavior for Vercel vs local
   */
  initializeStorage() {
    if (this.isVercel) {
      console.log('📦 Using in-memory storage for Vercel serverless environment');
      return;
    }

    try {
      // Create data directory if it doesn't exist (local only)
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        console.log(`Created data directory: ${this.dataDir}`);
      }

      // Initialize forecast results file if it doesn't exist
      if (!fs.existsSync(this.forecastFile)) {
        const initialData = {
          last_updated: new Date().toISOString(),
          total_forecasts: 0,
          forecasts: {}
        };
        this.writeJsonFile(this.forecastFile, initialData);
        console.log('Initialized forecast results file');
      }

      // Initialize history file if it doesn't exist
      if (!fs.existsSync(this.historyFile)) {
        const initialHistory = {
          created: new Date().toISOString(),
          entries: []
        };
        this.writeJsonFile(this.historyFile, initialHistory);
        console.log('Initialized forecast history file');
      }

      console.log('Storage service initialized successfully');
    } catch (error) {
      console.warn('Storage initialization warning:', error.message);
      console.log('Falling back to in-memory storage');
      this.isVercel = true; // Force in-memory mode
    }
  }

  /**
   * Save forecast data - uses memory in Vercel, file system locally
   */
  async saveForecast(forecastData, metadata = {}) {
    try {
      const timestamp = new Date().toISOString();
      const forecastId = `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const forecastRecord = {
        id: forecastId,
        timestamp: timestamp,
        data: forecastData,
        metadata: {
          ...metadata,
          saved_at: timestamp
        }
      };

      if (this.isVercel) {
        // In-memory storage for Vercel
        this.memoryStore.forecasts[forecastId] = forecastRecord;
        this.memoryStore.stats.total_forecasts++;
        this.memoryStore.stats.last_updated = timestamp;
        
        console.log(`✅ Forecast saved to memory: ${forecastId}`);
        return {
          success: true,
          forecast_id: forecastId,
          storage_type: 'memory'
        };
      } else {
        // File system storage for local development
        const data = this.readJsonFile(this.forecastFile);
        data.forecasts[forecastId] = forecastRecord;
        data.total_forecasts = Object.keys(data.forecasts).length;
        data.last_updated = timestamp;
        
        this.writeJsonFile(this.forecastFile, data);
        
        console.log(`✅ Forecast saved: ${forecastId}`);
        return {
          success: true,
          forecast_id: forecastId,
          storage_type: 'file'
        };
      }
    } catch (error) {
      console.error('Failed to save forecast:', error);
      return {
        success: false,
        error: error.message,
        storage_type: this.isVercel ? 'memory' : 'file'
      };
    }
  }

  /**
   * Get statistics - from memory or file
   */
  getStats() {
    try {
      if (this.isVercel) {
        return {
          total_forecasts: this.memoryStore.stats.total_forecasts,
          last_updated: this.memoryStore.stats.last_updated,
          storage_type: 'memory',
          environment: 'vercel'
        };
      } else {
        const data = this.readJsonFile(this.forecastFile);
        return {
          total_forecasts: data.total_forecasts || 0,
          last_updated: data.last_updated,
          forecasts_count: Object.keys(data.forecasts || {}).length,
          storage_type: 'file',
          environment: 'local'
        };
      }
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        total_forecasts: 0,
        last_updated: new Date().toISOString(),
        error: error.message,
        storage_type: this.isVercel ? 'memory' : 'file'
      };
    }
  }

  /**
   * Get latest forecast for a store - from memory or file
   */
  getLatestForecast(store) {
    try {
      if (this.isVercel) {
        // Search in-memory forecasts
        const forecasts = Object.values(this.memoryStore.forecasts)
          .filter(f => f.data && f.data.store === store)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return forecasts.length > 0 ? forecasts[0].data : null;
      } else {
        const data = this.readJsonFile(this.forecastFile);
        const forecasts = Object.values(data.forecasts || {})
          .filter(f => f.data && f.data.store === store)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return forecasts.length > 0 ? forecasts[0].data : null;
      }
    } catch (error) {
      console.error('Failed to get latest forecast:', error);
      return null;
    }
  }

  /**
   * Append to forecast history - memory or file
   */
  async appendForecastHistory(historyEntry) {
    try {
      const timestamp = new Date().toISOString();
      const entry = {
        ...historyEntry,
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: timestamp
      };

      if (this.isVercel) {
        // In-memory storage
        this.memoryStore.history.push(entry);
        // Keep only last 100 entries to manage memory
        if (this.memoryStore.history.length > 100) {
          this.memoryStore.history = this.memoryStore.history.slice(-100);
        }
        return { success: true, storage_type: 'memory' };
      } else {
        // File storage
        const data = this.readJsonFile(this.historyFile);
        data.entries.push(entry);
        this.writeJsonFile(this.historyFile, data);
        return { success: true, storage_type: 'file' };
      }
    } catch (error) {
      console.error('Failed to append forecast history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Read JSON file safely
   */
  readJsonFile(filePath) {
    try {
      if (this.isVercel) return {}; // No file operations in Vercel
      
      const rawData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      console.warn(`Failed to read ${filePath}:`, error.message);
      return {};
    }
  }

  /**
   * Write JSON file safely with atomic operations
   */
  writeJsonFile(filePath, data) {
    try {
      if (this.isVercel) return; // No file operations in Vercel
      
      const jsonString = JSON.stringify(data, null, 2);
      const tempFile = `${filePath}.tmp`;
      
      fs.writeFileSync(tempFile, jsonString, 'utf8');
      fs.renameSync(tempFile, filePath);
    } catch (error) {
      console.error(`Failed to write ${filePath}:`, error);
      throw error;
    }
  }
}

export default VercelStorageService;