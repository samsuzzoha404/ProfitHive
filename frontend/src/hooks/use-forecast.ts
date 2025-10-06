/**
 * React Hook for Forecast Data Management
 * Provides state management, loading states, and API integration for forecasting
 * 
 * Features:
 * - Centralized forecast state management
 * - Loading and error state handling  
 * - Sample data generation for testing
 * - Automatic retry on failures
 * - Real-time forecast updates
 */

import { useState, useCallback, useRef } from 'react';
import { 
  forecastAPI, 
  ForecastRequest, 
  ForecastResponse, 
  ForecastEntry,
  APIResponse,
  SalesRecord,
  generateSampleForecastData 
} from '@/services/api-service';

export interface ForecastState {
  data: ForecastResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  processingTime: number | null;
}

export interface ForecastActions {
  runForecast: (request: ForecastRequest) => Promise<boolean>;
  runSampleForecast: (storeName?: string) => Promise<boolean>;
  clearForecast: () => void;
  retry: () => Promise<boolean>;
  loadLatestForecast: (store: string) => Promise<boolean>;
}

export interface UseForecastReturn extends ForecastState, ForecastActions {
  // Computed properties
  hasData: boolean;
  isSuccessful: boolean;
  canRetry: boolean;
  isDemoData: boolean;
  
  // Helper methods
  getChartData: () => {
    salesData: Array<{ date: string; sales: number; customers: number }>;
    insights: string[];
    kpis: {
      totalRevenue: number;
      avgCustomers: number;
      avgConfidence: number;
      peakDay: string;
    };
  };
}

/**
 * Custom hook for forecast data management
 * @returns Forecast state and actions
 */
export const useForecast = (): UseForecastReturn => {
  // State management
  const [state, setState] = useState<ForecastState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    processingTime: null,
  });

  // Store last request for retry functionality
  const lastRequestRef = useRef<ForecastRequest | null>(null);

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<ForecastState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading, error: loading ? null : state.error });
  }, [state.error, updateState]);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    updateState({ error, loading: false });
  }, [updateState]);

  /**
   * Set successful forecast data
   */
  const setForecastData = useCallback((response: ForecastResponse) => {
    updateState({
      data: response,
      loading: false,
      error: null,
      lastUpdated: new Date(),
      processingTime: response.metadata?.processing_time_ms || null,
    });
  }, [updateState]);

  /**
   * Main forecast generation function
   * @param request - Forecast request data
   * @returns Success boolean
   */
  const runForecast = useCallback(async (request: ForecastRequest): Promise<boolean> => {
    console.log('🚀 Starting forecast generation...');
    setLoading(true);
    lastRequestRef.current = request;

    try {
      const response: APIResponse<ForecastResponse> = await forecastAPI.generateForecast(request);

      if (response.success && response.data) {
        console.log('✅ Forecast generated successfully');
        setForecastData(response.data);
        return true;
      } else {
        const errorMessage = response.error?.message || 'Unknown error occurred';
        console.error('❌ Forecast generation failed:', errorMessage);
        setError(errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error('❌ Forecast request failed:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [setLoading, setForecastData, setError]);

  /**
   * Generate forecast using sample data (for testing/demo)
   * @param storeName - Store name for sample data
   * @returns Success boolean
   */
  const runSampleForecast = useCallback(async (storeName: string = 'Cafe Cyber'): Promise<boolean> => {
    console.log('🧪 Generating sample forecast...');
    
    // Generate 30 days of sample data
    const sampleRequest = generateSampleForecastData(storeName, 30);
    
    console.log('📊 Generated sample data:', {
      store: sampleRequest.store,
      records: sampleRequest.records.length,
      dateRange: `${sampleRequest.records[0]?.date} to ${sampleRequest.records[sampleRequest.records.length - 1]?.date}`
    });
    
    return runForecast(sampleRequest);
  }, [runForecast]);

  /**
   * Clear all forecast data and reset state
   */
  const clearForecast = useCallback(() => {
    console.log('🗑️ Clearing forecast data');
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null,
      processingTime: null,
    });
    lastRequestRef.current = null;
  }, []);

  /**
   * Retry last forecast request
   * @returns Success boolean
   */
  const retry = useCallback(async (): Promise<boolean> => {
    if (!lastRequestRef.current) {
      setError('No previous request to retry');
      return false;
    }
    
    console.log('🔄 Retrying last forecast request...');
    return runForecast(lastRequestRef.current);
  }, [runForecast, setError]);

  /**
   * Load latest forecast for a specific store
   * @param store - Store name
   * @returns Success boolean
   */
  const loadLatestForecast = useCallback(async (store: string): Promise<boolean> => {
    console.log(`📂 Loading latest forecast for: ${store}`);
    setLoading(true);

    try {
      const response = await forecastAPI.getLatestForecast(store);

      if (response.success && response.data) {
        console.log('✅ Latest forecast loaded successfully');
        setForecastData(response.data);
        return true;
      } else {
        const errorMessage = response.error?.message || `No forecast found for ${store}`;
        console.log('ℹ️', errorMessage);
        setError(errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load forecast';
      console.error('❌ Load forecast failed:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [setLoading, setForecastData, setError]);

  /**
   * Get formatted chart data from forecast
   * @returns Chart-ready data and insights
   */
  const getChartData = useCallback(() => {
    if (!state.data) {
      return {
        salesData: [],
        insights: [],
        kpis: {
          totalRevenue: 0,
          avgCustomers: 0,
          avgConfidence: 0,
          weatherImpact: 0,
          transportImpact: 0,
          peakDay: 'N/A'
        }
      };
    }

    const { 
      forecast, 
      predictions,
      summary, 
      weather_impact_summary, 
      transport_impact_summary,
      ai_insights 
    } = state.data;

    // Handle both legacy 'forecast' and new 'predictions' field names
    const forecastData = predictions || forecast || [];

    // Helper function to get sales value from forecast entry
    const getSalesValue = (entry: ForecastEntry): number => {
      return entry.predicted_sales || entry.demand || entry.quantity || 0;
    };

    // Helper function to get customer value from forecast entry
    const getCustomersValue = (entry: ForecastEntry): number => {
      return entry.predicted_customers || entry.customers || Math.round(getSalesValue(entry) * 0.2);
    };

    // Format data for charts
    const salesData = forecastData.map(entry => ({
      date: entry.date,
      sales: getSalesValue(entry),
      customers: getCustomersValue(entry)
    }));

    // Enhanced insights with weather and transport correlations
    const baseInsights = forecastData.map(entry => entry.short_insight || 'Forecast generated').filter(Boolean);
    const enhancedInsights: string[] = [];
    
    // Handle different response formats
    if (typeof summary === 'string') {
      enhancedInsights.push(summary);
    } else if (summary && typeof summary === 'object') {
      enhancedInsights.push('Demand forecast completed');
    }

    // Add AI insights if available (Prophet format)
    if (ai_insights && ai_insights.detailed && Array.isArray(ai_insights.detailed)) {
      enhancedInsights.push(...ai_insights.detailed.filter(insight => typeof insight === 'string'));
    }
    
    // Add weather impact insights
    if (weather_impact_summary && weather_impact_summary.trim()) {
      enhancedInsights.push(weather_impact_summary);
    }
    
    // Add transport impact insights  
    if (transport_impact_summary && transport_impact_summary.trim()) {
      enhancedInsights.push(transport_impact_summary);
    }
    
    // Add specific correlation insights
    const weatherImpact = state.data.weatherImpact?.impactScore || 0;
    const transportImpact = state.data.transportImpact?.impactScore || 0;
    
    if (Math.abs(weatherImpact) > 5) {
      if (weatherImpact > 0) {
        enhancedInsights.push(`Weather conditions favor retail activity with +${weatherImpact.toFixed(1)}% positive impact`);
      } else {
        enhancedInsights.push(`Weather challenges expected to reduce sales by ${Math.abs(weatherImpact).toFixed(1)}%`);
      }
    }
    
    if (Math.abs(transportImpact) > 5) {
      if (transportImpact > 0) {
        enhancedInsights.push(`High passenger traffic expected to boost footfall by +${transportImpact.toFixed(1)}%`);
      } else {
        enhancedInsights.push(`Lower transport activity may reduce customer visits by ${Math.abs(transportImpact).toFixed(1)}%`);
      }
    }
    
    // Add best performing days insights
    const topDays = forecastData
      .sort((a, b) => getSalesValue(b) - getSalesValue(a))
      .slice(0, 2)
      .map(entry => {
        const dayName = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
        const sales = getSalesValue(entry);
        return `${dayName} shows peak performance at RM${sales.toFixed(0)}`;
      });
    
    enhancedInsights.push(...topDays);

    // Calculate KPIs
    const totalRevenue = forecastData.reduce((sum, entry) => sum + getSalesValue(entry), 0);
    const avgCustomers = Math.round(forecastData.reduce((sum, entry) => sum + getCustomersValue(entry), 0) / forecastData.length);
    const avgConfidence = Math.round(forecastData.reduce((sum, entry) => sum + entry.confidence, 0) / forecastData.length);
    
    // Calculate impact KPIs from enhanced forecast data - get from root level response
    const avgWeatherImpact = state.data.weatherImpact?.impactScore || 0;
    const avgTransportImpact = state.data.transportImpact?.impactScore || 0;
    
    // Find peak sales day
    const peakEntry = forecastData.length > 0 ? forecastData.reduce((peak, entry) => {
      const peakSales = getSalesValue(peak);
      const entrySales = getSalesValue(entry);
      return entrySales > peakSales ? entry : peak;
    }, forecastData[0]) : null;
    const peakDay = peakEntry?.date ? new Date(peakEntry.date).toLocaleDateString('en-US', { weekday: 'long' }) : 'N/A';

    return {
      salesData,
      insights: enhancedInsights.slice(0, 6), // Top 6 most relevant insights
      kpis: {
        totalRevenue,
        avgCustomers,
        avgConfidence,
        weatherImpact: avgWeatherImpact,
        transportImpact: avgTransportImpact,
        peakDay
      }
    };
  }, [state.data]);

  // Computed properties
  const hasData = state.data !== null;
  const isSuccessful = hasData && !state.error;
  const canRetry = lastRequestRef.current !== null && !state.loading;
  const isDemoData = state.data?.method === 'demo_fallback' || 
                     state.data?.weatherImpact?.fallback === true ||
                     state.data?.service_details?.primary_method === 'demo_fallback';

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    processingTime: state.processingTime,

    // Actions
    runForecast,
    runSampleForecast,
    clearForecast,
    retry,
    loadLatestForecast,

    // Computed properties
    hasData,
    isSuccessful,
    canRetry,
    isDemoData,

    // Helper methods
    getChartData,
  };
};

// Export utility functions for direct use
export const createSampleForecastData = generateSampleForecastData;

/**
 * Utility function to format currency for display
 * @param amount - Amount in RM
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Utility function to format date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Utility function to get confidence level text and color
 * @param confidence - Confidence score (0-100)
 * @returns Object with level text and color class
 */
export const getConfidenceLevel = (confidence: number): { level: string; color: string } => {
  if (confidence >= 85) return { level: 'High', color: 'text-green-600' };
  if (confidence >= 70) return { level: 'Medium', color: 'text-yellow-600' };
  if (confidence >= 50) return { level: 'Low', color: 'text-orange-600' };
  return { level: 'Very Low', color: 'text-red-600' };
};