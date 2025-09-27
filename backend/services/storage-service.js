import fs from 'fs';
import path from 'path';

/**
 * Data Storage Service
 * Handles saving and retrieving forecast results from JSON files
 * Provides persistent storage for forecast history and analysis
 */

class StorageService {
  constructor(dataDir = 'data') {
    this.dataDir = dataDir;
    this.forecastFile = path.join(dataDir, 'forecast_results.json');
    this.historyFile = path.join(dataDir, 'forecast_history.json');
    
    // Ensure data directory exists
    this.initializeStorage();
  }

  /**
   * Initialize storage directory and files
   * Creates necessary directories and files if they don't exist
   */
  initializeStorage() {
    try {
      // Create data directory if it doesn't exist
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
      console.error('Storage initialization error:', error);
      throw new Error(`Failed to initialize storage: ${error.message}`);
    }
  }

  /**
   * Save forecast result with metadata
   * @param {Object} forecastData - Complete forecast data
   * @param {Object} metadata - Additional metadata (method, timing, etc.)
   * @returns {Object} - Save operation result
   */
  async saveForecast(forecastData, metadata = {}) {
    try {
      const timestamp = new Date().toISOString();
      const forecastId = this.generateForecastId(forecastData.store, timestamp);
      
      // Create complete forecast record
      const forecastRecord = {
        id: forecastId,
        timestamp: timestamp,
        store: forecastData.store,
        city: forecastData.city,
        forecast_horizon_days: forecastData.forecast_horizon_days,
        forecast: forecastData.forecast,
        summary: forecastData.summary,
        method: forecastData.method || metadata.method || 'openai',
        confidence_note: forecastData.confidence_note || null,
        processing_time_ms: metadata.processing_time_ms || null,
        input_records_count: metadata.input_records_count || null,
        validation_passed: metadata.validation_passed !== false, // Default true
        ...metadata // Include any additional metadata
      };

      // Save to main forecast results file
      await this.updateForecastResults(forecastId, forecastRecord);
      
      // Add to history
      await this.addToHistory(forecastRecord);
      
      console.log(`Forecast saved successfully: ${forecastId}`);
      
      return {
        success: true,
        forecast_id: forecastId,
        timestamp: timestamp,
        message: 'Forecast saved successfully'
      };

    } catch (error) {
      console.error('Error saving forecast:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to save forecast'
      };
    }
  }

  /**
   * Update the main forecast results file
   * @param {string} forecastId - Unique forecast identifier
   * @param {Object} forecastRecord - Complete forecast record
   */
  async updateForecastResults(forecastId, forecastRecord) {
    const data = this.readJsonFile(this.forecastFile);
    
    // Update forecasts object
    data.forecasts[forecastId] = forecastRecord;
    
    // Update metadata
    data.last_updated = new Date().toISOString();
    data.total_forecasts = Object.keys(data.forecasts).length;
    
    // Keep only last 100 forecasts to prevent file from growing too large
    if (data.total_forecasts > 100) {
      const sortedIds = Object.keys(data.forecasts)
        .sort((a, b) => new Date(data.forecasts[b].timestamp) - new Date(data.forecasts[a].timestamp))
        .slice(0, 100);
      
      const trimmedForecasts = {};
      sortedIds.forEach(id => {
        trimmedForecasts[id] = data.forecasts[id];
      });
      
      data.forecasts = trimmedForecasts;
      data.total_forecasts = 100;
      console.log('Trimmed forecast results to last 100 entries');
    }
    
    this.writeJsonFile(this.forecastFile, data);
  }

  /**
   * Add forecast to history log
   * @param {Object} forecastRecord - Forecast record to add to history
   */
  async addToHistory(forecastRecord) {
    const history = this.readJsonFile(this.historyFile);
    
    // Create history entry (lighter version)
    const historyEntry = {
      id: forecastRecord.id,
      timestamp: forecastRecord.timestamp,
      store: forecastRecord.store,
      method: forecastRecord.method,
      forecast_days: forecastRecord.forecast_horizon_days,
      input_records: forecastRecord.input_records_count,
      processing_time_ms: forecastRecord.processing_time_ms,
      validation_passed: forecastRecord.validation_passed
    };
    
    history.entries.unshift(historyEntry); // Add to beginning
    
    // Keep only last 500 history entries
    if (history.entries.length > 500) {
      history.entries = history.entries.slice(0, 500);
    }
    
    this.writeJsonFile(this.historyFile, history);
  }

  /**
   * Retrieve latest forecast for a specific store
   * @param {string} store - Store name
   * @returns {Object|null} - Latest forecast or null if not found
   */
  getLatestForecast(store) {
    try {
      const data = this.readJsonFile(this.forecastFile);
      
      // Find latest forecast for the store
      const storeForecasts = Object.values(data.forecasts)
        .filter(f => f.store.toLowerCase() === store.toLowerCase())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return storeForecasts.length > 0 ? storeForecasts[0] : null;
      
    } catch (error) {
      console.error('Error retrieving latest forecast:', error);
      return null;
    }
  }

  /**
   * Get all forecasts for a store
   * @param {string} store - Store name
   * @param {number} limit - Maximum number of results
   * @returns {Array} - Array of forecasts
   */
  getStoreForecasts(store, limit = 10) {
    try {
      const data = this.readJsonFile(this.forecastFile);
      
      return Object.values(data.forecasts)
        .filter(f => f.store.toLowerCase() === store.toLowerCase())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error retrieving store forecasts:', error);
      return [];
    }
  }

  /**
   * Get forecast by ID
   * @param {string} forecastId - Forecast identifier
   * @returns {Object|null} - Forecast data or null if not found
   */
  getForecastById(forecastId) {
    try {
      const data = this.readJsonFile(this.forecastFile);
      return data.forecasts[forecastId] || null;
    } catch (error) {
      console.error('Error retrieving forecast by ID:', error);
      return null;
    }
  }

  /**
   * Get forecast statistics and summary
   * @returns {Object} - Statistics about stored forecasts
   */
  getForecastStats() {
    try {
      const data = this.readJsonFile(this.forecastFile);
      const history = this.readJsonFile(this.historyFile);
      
      const forecasts = Object.values(data.forecasts);
      const methods = {};
      const stores = {};
      
      forecasts.forEach(f => {
        methods[f.method] = (methods[f.method] || 0) + 1;
        stores[f.store] = (stores[f.store] || 0) + 1;
      });
      
      return {
        total_forecasts: data.total_forecasts,
        last_updated: data.last_updated,
        methods_used: methods,
        stores_tracked: stores,
        total_history_entries: history.entries.length,
        oldest_forecast: forecasts.length > 0 
          ? forecasts.reduce((oldest, f) => 
              new Date(f.timestamp) < new Date(oldest.timestamp) ? f : oldest
            ).timestamp
          : null
      };
      
    } catch (error) {
      console.error('Error retrieving forecast stats:', error);
      return {
        error: 'Failed to retrieve statistics',
        message: error.message
      };
    }
  }

  /**
   * Generate unique forecast ID
   * @param {string} store - Store name
   * @param {string} timestamp - ISO timestamp
   * @returns {string} - Unique forecast ID
   */
  generateForecastId(store, timestamp) {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
    const storeSlug = store.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    return `${storeSlug}-${dateStr}-${timeStr}`;
  }

  /**
   * Read JSON file safely
   * @param {string} filePath - Path to JSON file
   * @returns {Object} - Parsed JSON data
   */
  readJsonFile(filePath) {
    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      throw new Error(`Failed to read ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write JSON file safely with atomic operation
   * @param {string} filePath - Path to JSON file
   * @param {Object} data - Data to write
   */
  writeJsonFile(filePath, data) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const tempFile = `${filePath}.tmp`;
      
      // Write to temporary file first (atomic operation)
      fs.writeFileSync(tempFile, jsonString, 'utf8');
      
      // Rename temp file to actual file (atomic on most filesystems)
      fs.renameSync(tempFile, filePath);
      
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}:`, error);
      throw new Error(`Failed to write ${filePath}: ${error.message}`);
    }
  }

  /**
   * Clean up old forecasts (maintenance function)
   * @param {number} daysToKeep - Number of days of forecasts to keep
   * @returns {Object} - Cleanup result
   */
  cleanupOldForecasts(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const data = this.readJsonFile(this.forecastFile);
      const originalCount = Object.keys(data.forecasts).length;
      
      // Filter forecasts newer than cutoff date
      const filteredForecasts = {};
      Object.entries(data.forecasts).forEach(([id, forecast]) => {
        if (new Date(forecast.timestamp) >= cutoffDate) {
          filteredForecasts[id] = forecast;
        }
      });
      
      data.forecasts = filteredForecasts;
      data.total_forecasts = Object.keys(filteredForecasts).length;
      data.last_updated = new Date().toISOString();
      
      this.writeJsonFile(this.forecastFile, data);
      
      const removed = originalCount - data.total_forecasts;
      console.log(`Cleaned up ${removed} old forecasts, kept ${data.total_forecasts}`);
      
      return {
        success: true,
        removed_count: removed,
        remaining_count: data.total_forecasts,
        cutoff_date: cutoffDate.toISOString()
      };
      
    } catch (error) {
      console.error('Cleanup error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default StorageService;