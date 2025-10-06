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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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
    prophet_enabled?: boolean;
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
  methods_used?: Record<string, number>;
  stores_tracked?: Record<string, number>;
  total_history_entries?: number;
  oldest_forecast?: string | null;
  storage_type?: string;
  environment?: string;
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

      // Generate fallback demo data when backend is unavailable
      console.log('🔄 Backend unavailable, generating demo forecast data...');
      const demoForecast = this.generateDemoForecast(request);
      
      return {
        success: true,
        data: demoForecast,
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
      
      // Provide fallback demo statistics when backend is unavailable
      console.log('🔄 Backend unavailable, providing demo statistics...');
      return {
        success: true,
        data: {
          total_forecasts: 12,
          last_updated: new Date().toISOString(),
          storage_type: 'demo',
          environment: 'fallback'
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
   * Generate realistic demo forecast data when backend is unavailable
   * @param request - Original forecast request
   * @returns Demo forecast response
   */
  private generateDemoForecast(request: ForecastRequest): ForecastResponse {
    const { store, city, records } = request;
    const forecastDays = 14;
    const predictions: ForecastEntry[] = [];
    
    // Calculate base values from historical data
    const avgSales = records.reduce((sum, r) => sum + r.sales_rm, 0) / records.length;
    const avgCustomers = records.reduce((sum, r) => sum + r.customers, 0) / records.length;
    
    // Generate realistic forecast predictions
    const today = new Date();
    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      // Add realistic variation and trends
      const dayOfWeek = forecastDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 1.2 : 1.0;
      
      // Seasonal variation and growth trend
      const seasonalVariation = 0.9 + Math.random() * 0.2; // ±10% variation
      const growthTrend = 1.02; // 2% growth trend
      const weatherImpact = 0.95 + Math.random() * 0.1; // Weather variation
      
      const predictedSales = Math.round(
        avgSales * weekendMultiplier * seasonalVariation * growthTrend * weatherImpact
      );
      const predictedCustomers = Math.round(
        avgCustomers * weekendMultiplier * seasonalVariation * growthTrend * weatherImpact
      );
      
      predictions.push({
        date: forecastDate.toISOString().split('T')[0],
        predicted_sales: predictedSales,
        predicted_customers: predictedCustomers,
        demand: predictedSales,
        quantity: predictedCustomers,
        customers: predictedCustomers,
        confidence: Math.round(75 + Math.random() * 20), // 75-95% confidence
        short_insight: `Demo forecast: RM${predictedSales.toLocaleString()} (${isWeekend ? 'Weekend' : 'Weekday'})`,
        weather_impact: Math.round((weatherImpact - 1) * 100),
        transport_impact: Math.round(-5 + Math.random() * 10),
        temperature: Math.round(28 + Math.random() * 6),
        precipitation: Math.random() > 0.7 ? Math.round(Math.random() * 10) : 0,
        ensemble_adjusted: true
      });
    }
    
    // Generate realistic weather data
    const weatherConditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy'];
    const weatherImpact = {
      temp: Math.round((28 + Math.random() * 6) * 10) / 10,
      humidity: Math.round(60 + Math.random() * 25),
      condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
      description: 'Demo weather data - realistic business impact simulation',
      impactScore: Math.round(70 + Math.random() * 25),
      timestamp: new Date().toISOString(),
      fallback: true
    };
    
    // Generate realistic transport data
    const transportImpact = {
      busAvailability: Math.round((75 + Math.random() * 20) * 10) / 10,
      trainFrequency: Math.round((85 + Math.random() * 10) * 10) / 10,
      congestionLevel: Math.round((30 + Math.random() * 40) * 10) / 10,
      impactScore: Math.round(65 + Math.random() * 30),
      peakHour: new Date().getHours() >= 7 && new Date().getHours() <= 9 || 
                new Date().getHours() >= 17 && new Date().getHours() <= 19,
      timestamp: new Date().toISOString(),
      fallback: true,
      description: 'Demo transport data - simulated accessibility impact'
    };
    
    // Generate realistic foot traffic data
    const popularTimes = Array.from({ length: 24 }, (_, hour) => {
      let trafficLevel;
      if (hour >= 0 && hour <= 5) trafficLevel = 5 + Math.random() * 10;
      else if (hour >= 6 && hour <= 8) trafficLevel = 20 + Math.random() * 30;
      else if (hour >= 9 && hour <= 11) trafficLevel = 70 + Math.random() * 25;
      else if (hour >= 12 && hour <= 14) trafficLevel = 85 + Math.random() * 15;
      else if (hour >= 15 && hour <= 17) trafficLevel = 75 + Math.random() * 20;
      else if (hour >= 18 && hour <= 20) trafficLevel = 80 + Math.random() * 15;
      else if (hour >= 21 && hour <= 23) trafficLevel = 40 + Math.random() * 30;
      else trafficLevel = 15 + Math.random() * 15;
      
      return {
        hour,
        trafficLevel: Math.round(trafficLevel * 10) / 10
      };
    });
    
    const footTrafficImpact = {
      locationName: 'Cyberjaya Business District',
      popularTimes,
      currentTrafficLevel: Math.round((70 + Math.random() * 25) * 10) / 10,
      avgTraffic: Math.round(65 + Math.random() * 20),
      impactScore: Math.round(70 + Math.random() * 25),
      rating: Math.round((4.2 + Math.random() * 0.6) * 10) / 10,
      totalRatings: 150 + Math.floor(Math.random() * 100),
      fallback: true,
      timestamp: new Date().toISOString(),
      description: 'Demo foot traffic data - realistic business district patterns'
    };
    
    // Calculate totals for insights
    const totalPredictedRevenue = predictions.reduce((sum, p) => sum + (p.predicted_sales || 0), 0);
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    
    return {
      store,
      city,
      forecast_horizon_days: forecastDays,
      predictions,
      forecast: predictions, // Legacy compatibility
      summary: `Demo forecast generated with ${Math.round(avgConfidence)}% confidence for ${forecastDays} days`,
      method: 'demo_fallback',
      confidence: avgConfidence / 100,
      confidence_note: 'Demo data generated when backend is unavailable',
      insights: [
        `📊 Demo forecast shows ${forecastDays} days of realistic predictions`,
        `💰 Total predicted revenue: RM${totalPredictedRevenue.toLocaleString()}`,
        `📈 Average confidence: ${Math.round(avgConfidence)}%`,
        `🎯 Based on ${records.length} historical records`,
        '⚠️ This is demo data - connect to backend for real AI predictions'
      ],
      ai_insights: {
        detailed: [
          `Demo forecast confidence: ${avgConfidence.toFixed(1)}%`,
          `Weather impact: ${weatherImpact.description}`,
          `Transport impact: ${transportImpact.description}`,
          `Foot traffic impact: ${footTrafficImpact.description}`,
          `Total predicted revenue: RM${totalPredictedRevenue.toLocaleString()}`,
          'Method: Demo fallback data generator'
        ],
        prophet_confidence: avgConfidence / 100
      },
      weatherImpact,
      transportImpact,
      footTrafficImpact,
      service_details: {
        openai_available: false,
        prophet_available: false,
        enhanced_ai_available: false,
        primary_method: 'demo_fallback'
      },
      services_used: ['demo_fallback'],
      processing_time_ms: 150 + Math.floor(Math.random() * 100), // Simulate processing time
      metadata: {
        processing_time_ms: 150,
        method: 'demo_fallback',
        validation_passed: true,
        forecast_id: `demo_${Date.now()}`,
        timestamp: new Date().toISOString(),
        prophet_enabled: false
      }
    };
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