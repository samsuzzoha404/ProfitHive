import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ValidationService from './services/validation-service.js';
import EnhancedAIForecastService from './services/enhanced-ai-service.js';
import StorageService from './services/storage-service.js';

/**
 * Retail Smart Demand & Revenue Sharing Platform - Backend Server
 * Provides Enhanced AI-powered demand forecasting
 * 
 * Author: Cyberjaya Team
 * Tech Stack: Node.js + Express + Enhanced AI Statistical Algorithms
 */

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize services
const validationService = new ValidationService();
const storageService = new StorageService();
const enhancedAIService = new EnhancedAIForecastService();

// Middleware configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Support larger JSON payloads
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

/**
 * Health check endpoint
 * Verifies server status and service availability
 */
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      validation: 'active',
      storage: 'active',
      enhanced_ai: 'active'
    },
    uptime: process.uptime()
  };
  
  res.json(health);
});

/**
 * Get forecast statistics endpoint
 * Returns information about stored forecasts
 */
app.get('/api/stats', (req, res) => {
  try {
    const stats = storageService.getForecastStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve statistics'
    });
  }
});

/**
 * Get latest forecast for a store
 */
app.get('/api/forecast/:store', (req, res) => {
  try {
    const { store } = req.params;
    const forecast = storageService.getLatestForecast(store);
    
    if (!forecast) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No forecast found for store: ${store}`
      });
    }
    
    res.json(forecast);
  } catch (error) {
    console.error('Get forecast endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve forecast'
    });
  }
});

/**
 * Main forecast endpoint - POST /api/forecast
 * Accepts historical sales data and returns AI-generated demand forecast
 * 
 * Request body format:
 * {
 *   "store": "Cafe Cyber",
 *   "city": "Cyberjaya", 
 *   "records": [
 *     {"date": "2025-01-01", "customers": 120, "sales_rm": 2400},
 *     {"date": "2025-01-02", "customers": 135, "sales_rm": 2700}
 *   ]
 * }
 */
app.post('/api/forecast', async (req, res) => {
  const startTime = Date.now();
  let forecastData = null;
  let method = 'unknown';
  let validationPassed = false;

  try {
    console.log('\n=== Starting Forecast Request ===');
    
    // Step 1: Validate request data
    console.log('Step 1: Validating request data...');
    const validation = validationService.validateRequest(req.body);
    
    if (!validation.valid) {
      console.log('Request validation failed:', validation.errors);
      return res.status(400).json(
        validationService.formatValidationErrors(validation.errors)
      );
    }

    const { store, city, records } = validation.data;
    console.log(`Request validated: ${store} in ${city} with ${records.length} records`);

    // Use Enhanced AI Forecasting with external data integration
    console.log('Step 2: Generating Enhanced AI Forecast with external data...');
    forecastData = await EnhancedAIForecastService.generateEnhancedForecast(store, city, records);
    method = 'enhanced_ai_with_external_data';
    validationPassed = true;

    // Step 3: Save forecast results
    console.log('Step 3: Saving forecast results...');
    const processingTime = Date.now() - startTime;
    
    const saveResult = await storageService.saveForecast(forecastData, {
      method: method,
      processing_time_ms: processingTime,
      input_records_count: records.length,
      validation_passed: validationPassed,
      request_timestamp: new Date().toISOString(),
      client_ip: req.ip
    });

    if (!saveResult.success) {
      console.log('Warning: Failed to save forecast results:', saveResult.error);
      // Continue anyway, don't fail the request
    }

    // Step 5: Return successful response
    console.log(`✓ Forecast completed in ${processingTime}ms using ${method}`);
    console.log('=== Forecast Request Complete ===\n');

    // Add metadata to response
    const response = {
      ...forecastData,
      metadata: {
        processing_time_ms: processingTime,
        method: method,
        validation_passed: validationPassed,
        forecast_id: saveResult.forecast_id,
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);

  } catch (error) {
    // Handle any unexpected errors
    console.error('Forecast endpoint error:', error);
    
    const processingTime = Date.now() - startTime;
    
    // Log error details for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      processing_time_ms: processingTime
    });

    // Return generic error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Forecast generation failed due to an unexpected error',
      method: method,
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Error handling middleware
 * Catches any unhandled errors and returns proper JSON response
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 handler for unknown routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /health',
      'GET /api/stats', 
      'GET /api/forecast/:store',
      'POST /api/forecast'
    ]
  });
});

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log('\n🚀 Retail Smart Demand Backend Server Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔮 Forecast API: http://localhost:${PORT}/api/forecast`);
  console.log(`📊 Statistics: http://localhost:${PORT}/api/stats`);
  
  console.log('\n📋 Available Services:');
  console.log('  • Enhanced AI Statistical Algorithms (Advanced Pattern Recognition)');
  console.log('  • Cyberjaya Market Analysis (Tech Worker Patterns)');
  console.log('  • Request Validation (AJV Schema)');
  console.log('  • Persistent Storage (JSON Files)');
  console.log('  • CORS Support for Frontend Integration');
  console.log('\n=== Server Ready ===\n');
});

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT (Ctrl+C), shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;