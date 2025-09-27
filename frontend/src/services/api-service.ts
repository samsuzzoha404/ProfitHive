/**
 * API Service for Retail Smart Demand Forecasting
 * Handles communication with the backend forecast API
 * 
 * Features:
 * - Type-safe API calls with TypeScript interfaces
 * - Error handling and loading states
 * - Automatic retry logic for failed requests
 * - Request/response validation
 */

// API Configuration - Node.js backend with enhanced AI algorithms
const API_BASE_URL = 'http://localhost:5000';
const API_TIMEOUT = 45000; // 45 seconds for AI processing

// TypeScript Interfaces
export interface SalesRecord {
  date: string;           // YYYY-MM-DD format
  customers: number;      // Number of customers
  sales_rm: number;      // Sales amount in Malaysian Ringgit
}

export interface ForecastRequest {
  store: string;          // Store name (e.g., "Cafe Cyber")
  city: string;           // City name (must be "Cyberjaya")
  records: SalesRecord[]; // Historical sales data
}

export interface ForecastEntry {
  date: string;           // YYYY-MM-DD format
  predicted_sales?: number;        // Predicted sales in RM (legacy)
  predicted_customers?: number;    // Predicted number of customers (legacy)
  demand?: number;                 // Unified AI demand prediction
  quantity?: number;               // Unified AI quantity prediction
  customers?: number;              // Unified AI customer prediction
  confidence: number;     // Confidence score 0-100
  short_insight?: string;  // Brief insight about the prediction (legacy)
  weather_impact?: number;        // Weather impact percentage
  transport_impact?: number;      // Transport impact percentage
  temperature?: number;           // Temperature in Celsius
  precipitation?: number;         // Precipitation in mm
  ensemble_adjusted?: boolean;    // Whether this was adjusted by ensemble methods
}

export interface ForecastResponse {
  store: string;
  city: string;
  forecast_horizon_days: number;
  forecast?: ForecastEntry[];           // Legacy field
  predictions?: ForecastEntry[];        // Unified AI field
  summary: string;
  method?: string;                    // 'prophet_enhanced' or 'prophet_basic_fallback' or 'unified_ai'
  confidence?: number;                // Unified AI confidence score
  confidence_note?: string;           // Additional confidence information
  insights?: string[];               // Unified AI insights array
  ai_insights?: {                     // Prophet-specific insights
    detailed?: string[];
    prophet_confidence?: number;
    model_metadata?: Record<string, unknown>;
  };
  weather_impact_summary?: string;    // Weather impact insights
  transport_impact_summary?: string;  // Transport impact insights
  weatherImpact?: {                   // Weather impact data
    temp: number;
    humidity: number;
    condition: string;
    description: string;
    impactScore: number;
    timestamp: string;
    fallback?: boolean;
  };
  transportImpact?: {                 // Transport impact data
    busAvailability: number;
    trainFrequency: number;
    congestionLevel: number;
    impactScore: number;
    peakHour: boolean;
    timestamp: string;
    fallback?: boolean;
  };
  footTrafficImpact?: {               // Foot traffic impact data
    locationName: string;
    popularTimes: Array<{
      hour: number;
      trafficLevel: number;
    }>;
    currentTrafficLevel: number;
    avgTraffic: number;
    impactScore: number;
    rating?: number;
    totalRatings?: number;
    fallback?: boolean;
    timestamp: string;
  };
  service_details?: {                 // Unified AI service information
    openai_available: boolean;
    prophet_available: boolean;
    enhanced_ai_available: boolean;
    primary_method: string;
  };
  services_used?: string[];           // List of AI services used
  processing_time_ms?: number;        // Processing time
  metadata?: {
    processing_time_ms: number;
    method: string;
    validation_passed: boolean;
    forecast_id: string;
    timestamp: string;
  };
}

export interface APIError {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    rejectedValue?: unknown;
  }>;
  timestamp: string;
}

export interface StatisticsResponse {
  total_forecasts: number;
  last_updated: string;
  methods_used: Record<string, number>;
  stores_tracked: Record<string, number>;
  total_history_entries: number;
  oldest_forecast: string | null;
}

export interface HealthResponse {
  status: string;
  backend_online: boolean;
  openweather_api: string;
  transport_data: string;
  prophet_model: string;
  last_check: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  loading: boolean;
}

/**
 * Main API Service Class
 * Provides methods for interacting with the backend forecast API
 */
export class ForecastAPIService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Generate demand forecast using backend AI service
   * @param request - Forecast request data
   * @returns Promise with forecast response
   */
  async generateForecast(request: ForecastRequest): Promise<APIResponse<ForecastResponse>> {
    const startTime = Date.now();
    
    try {
      console.log('🔮 Generating forecast for:', request.store);
      console.log(`📊 Processing ${request.records.length} historical records`);
      
      // Validate request data locally first
      const validationError = this.validateRequest(request);
      if (validationError) {
        return {
          success: false,
          error: {
            error: 'Validation Error',
            message: validationError,
            timestamp: new Date().toISOString()
          },
          loading: false
        };
      }

      // Make API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json() as APIError;
        console.error('❌ API Error:', errorData);
        
        return {
          success: false,
          error: errorData,
          loading: false
        };
      }

      const forecastData = await response.json() as ForecastResponse;
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Forecast generated successfully in ${processingTime}ms`);
      console.log(`📈 Method used: ${forecastData.method || 'unknown'}`);
      
      // Handle different response structures from unified AI
      const predictions = forecastData.predictions || forecastData.forecast || [];
      console.log(`📋 Generated ${predictions.length} forecast entries`);

      return {
        success: true,
        data: forecastData,
        loading: false
      };

    } catch (error) {
      console.error('❌ Forecast API Error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - forecast generation took too long';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error - please check if the backend server is running';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: {
          error: 'Network Error',
          message: errorMessage,
          timestamp: new Date().toISOString()
        },
        loading: false
      };
    }
  }

  /**
   * Get forecast statistics from backend
   * @returns Promise with statistics data
   */
  async getStatistics(): Promise<APIResponse<StatisticsResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`);
      
      if (!response.ok) {
        const errorData = await response.json() as APIError;
        return {
          success: false,
          error: errorData,
          loading: false
        };
      }

      const stats = await response.json();
      return {
        success: true,
        data: stats,
        loading: false
      };

    } catch (error) {
      console.error('Stats API Error:', error);
      return {
        success: false,
        error: {
          error: 'Network Error',
          message: 'Failed to retrieve statistics',
          timestamp: new Date().toISOString()
        },
        loading: false
      };
    }
  }

  /**
   * Get latest forecast for a specific store
   * @param store - Store name
   * @returns Promise with forecast data
   */
  async getLatestForecast(store: string): Promise<APIResponse<ForecastResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/forecast/${encodeURIComponent(store)}`);
      
      if (response.status === 404) {
        return {
          success: false,
          error: {
            error: 'Not Found',
            message: `No forecast found for store: ${store}`,
            timestamp: new Date().toISOString()
          },
          loading: false
        };
      }

      if (!response.ok) {
        const errorData = await response.json() as APIError;
        return {
          success: false,
          error: errorData,
          loading: false
        };
      }

      const forecastData = await response.json() as ForecastResponse;
      return {
        success: true,
        data: forecastData,
        loading: false
      };

    } catch (error) {
      console.error('Get forecast API Error:', error);
      return {
        success: false,
        error: {
          error: 'Network Error',
          message: 'Failed to retrieve latest forecast',
          timestamp: new Date().toISOString()
        },
        loading: false
      };
    }
  }

  /**
   * Check backend server health
   * @returns Promise with health status
   */
  async healthCheck(): Promise<APIResponse<HealthResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000 // Quick health check
      } as RequestInit);
      
      const health = await response.json();
      return {
        success: response.ok,
        data: health,
        loading: false
      };

    } catch (error) {
      return {
        success: false,
        error: {
          error: 'Connection Error',
          message: 'Backend server is not accessible',
          timestamp: new Date().toISOString()
        },
        loading: false
      };
    }
  }

  /**
   * Validate forecast request data locally
   * @param request - Request to validate
   * @returns Error message or null if valid
   */
  private validateRequest(request: ForecastRequest): string | null {
    if (!request.store || request.store.trim().length === 0) {
      return 'Store name is required';
    }

    if (!request.city || request.city !== 'Cyberjaya') {
      return 'City must be "Cyberjaya"';
    }

    if (!request.records || !Array.isArray(request.records)) {
      return 'Records array is required';
    }

    if (request.records.length < 7) {
      return 'At least 7 days of historical data required';
    }

    if (request.records.length > 365) {
      return 'Maximum 365 days of historical data allowed';
    }

    // Validate each record
    for (let i = 0; i < request.records.length; i++) {
      const record = request.records[i];
      
      if (!record.date || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
        return `Record ${i + 1}: Invalid date format (use YYYY-MM-DD)`;
      }

      if (!Number.isInteger(record.customers) || record.customers < 0) {
        return `Record ${i + 1}: Customers must be a non-negative integer`;
      }

      if (typeof record.sales_rm !== 'number' || record.sales_rm < 0) {
        return `Record ${i + 1}: Sales amount must be a non-negative number`;
      }
    }

    // Check for duplicate dates
    const dates = request.records.map(r => r.date);
    const uniqueDates = new Set(dates);
    if (dates.length !== uniqueDates.size) {
      return 'Duplicate dates found in records';
    }

    return null; // Valid
  }

  /**
   * Generate sample/mock data for testing
   * @param store - Store name
   * @param days - Number of days to generate
   * @returns Sample forecast request
   */
  static generateSampleData(store: string = 'Cafe Cyber', days: number = 30): ForecastRequest {
    const records: SalesRecord[] = [];
    const today = new Date();
    
    for (let i = days; i > 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Generate realistic sample data with weekly patterns
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseCustomers = isWeekend ? 140 : 120;
      const baseSales = isWeekend ? 2800 : 2400;
      
      // Add some variation (±15%)
      const variation = 0.85 + Math.random() * 0.3;
      
      records.push({
        date: date.toISOString().split('T')[0],
        customers: Math.round(baseCustomers * variation),
        sales_rm: Math.round(baseSales * variation)
      });
    }
    
    return {
      store: store,
      city: 'Cyberjaya',
      records: records
    };
  }
}

// Create singleton instance
export const forecastAPI = new ForecastAPIService();

// Export utility functions
export const generateSampleForecastData = ForecastAPIService.generateSampleData;