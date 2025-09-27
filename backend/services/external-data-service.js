/**
 * External Data Integration Service
 * Handles weather and transportation data fetching for AI forecasting
 * 
 * Author: Cyberjaya Team
 * Features: OpenWeather API, Transportation Data Analysis
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

class ExternalDataService {
  
  constructor() {
    // Switch to OpenWeatherMap API
    this.weatherApiKey = process.env.WEATHER_API_KEY || '1efecea6037395ce7bd137b9113cbe3a';
    this.weatherApiUrl = 'http://api.openweathermap.org/data/2.5/weather';
    this.cyberjayanTransportData = null; // Cache for transport data
  }

  /**
   * Get weather impact data for Cyberjaya
   * @returns {Object} Weather impact data with temp, humidity, condition, impactScore
   */
  async getWeatherImpact() {
    try {
      console.log('🌤️ Fetching weather data for Cyberjaya...');
      
      const response = await axios.get(this.weatherApiUrl, {
        params: {
          q: 'Cyberjaya,Malaysia',
          appid: this.weatherApiKey,
          units: 'metric' // Get temperature in Celsius
        },
        timeout: 5000
      });

      const weatherData = response.data;
      const temp = Math.round(weatherData.main.temp);
      const humidity = weatherData.main.humidity;
      const condition = weatherData.weather[0].description;
      const description = weatherData.weather[0].description;

      // Calculate weather impact score (0-100)
      const impactScore = this.calculateWeatherImpactScore(temp, humidity, condition);

      console.log(`✅ Weather data retrieved: ${temp}°C, ${condition}, Impact: ${impactScore}`);

      return {
        temp: Math.round(temp),
        humidity: humidity,
        condition: condition,
        description: description,
        impactScore: impactScore,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Weather API failed:', error.message);
      
      // Return fallback weather data
      return this.getFallbackWeatherData();
    }
  }

  /**
   * Calculate weather impact score based on temperature, humidity, and conditions
   * @param {number} temp - Temperature in Celsius
   * @param {number} humidity - Humidity percentage
   * @param {string} condition - Weather condition
   * @returns {number} Impact score (0-100)
   */
  calculateWeatherImpactScore(temp, humidity, condition) {
    let score = 50; // Base score

    // Temperature impact (ideal range: 24-28°C for Cyberjaya)
    if (temp >= 24 && temp <= 28) {
      score += 20; // Ideal temperature
    } else if (temp < 20 || temp > 35) {
      score -= 30; // Extreme temperatures reduce foot traffic
    } else {
      score -= 10; // Slightly uncomfortable
    }

    // Humidity impact (ideal range: 60-80% for Malaysia)
    if (humidity >= 60 && humidity <= 80) {
      score += 10; // Good humidity
    } else if (humidity > 90) {
      score -= 15; // Too humid
    }

    // Weather condition impact
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        score += 25;
        break;
      case 'clouds':
      case 'partly cloudy':
        score += 10;
        break;
      case 'rain':
      case 'drizzle':
        score -= 25; // Rain reduces foot traffic in Malaysia
        break;
      case 'thunderstorm':
        score -= 40; // Heavy impact on retail
        break;
      case 'mist':
      case 'haze':
        score -= 15; // Common in Malaysia, moderate impact
        break;
      default:
        score -= 5;
    }

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get transportation impact data for Cyberjaya
   * @returns {Object} Transport impact data with availability, frequency, congestion, impactScore
   */
  async getTransportImpact() {
    try {
      console.log('🚌 Analyzing transportation data for Cyberjaya...');

      // Load or generate transportation data
      const transportData = await this.loadCyberjayanTransportData();
      
      // Analyze current time period for transport patterns
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
      
      // Calculate transport metrics based on time and historical patterns
      const busAvailability = this.calculateBusAvailability(currentHour, currentDay, transportData);
      const trainFrequency = this.calculateTrainFrequency(currentHour, currentDay, transportData);
      const congestionLevel = this.calculateCongestionLevel(currentHour, currentDay, transportData);
      
      // Calculate overall transport impact score
      const impactScore = this.calculateTransportImpactScore(busAvailability, trainFrequency, congestionLevel);

      console.log(`✅ Transport data analyzed: Bus ${busAvailability}%, Train ${trainFrequency}%, Congestion ${congestionLevel}%, Impact: ${impactScore}`);

      return {
        busAvailability: busAvailability,
        trainFrequency: trainFrequency,
        congestionLevel: congestionLevel,
        impactScore: impactScore,
        peakHour: this.isPeakHour(currentHour),
        timestamp: new Date().toISOString(),
        // Include data source information from Kaggle integration
        dataSource: transportData.dataSource || { provider: 'simulated', isRealData: false },
        // Include enhanced data for Prophet integration
        realTimeMetrics: transportData.realTimeMetrics || null,
        busRoutes: transportData.busRoutes || []
      };

    } catch (error) {
      console.error('❌ Transportation data analysis failed:', error.message);
      
      // Return fallback transport data
      return this.getFallbackTransportData();
    }
  }

  /**
   * Load real Cyberjaya transportation data from Kaggle API
   * @returns {Object} Real transportation patterns and data
   */
  async loadCyberjayanTransportData() {
    try {
      console.log('⚡ Fetching real transportation data from Kaggle API...');
      
      // Call the Python Kaggle service
      const { exec } = await import('child_process');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const pythonServicePath = path.join(__dirname, '..', 'python', 'kaggle_transport_service.py');
      
      return new Promise((resolve, reject) => {
        exec(`python "${pythonServicePath}" --action=fetch --format=json`, {
          cwd: path.join(__dirname, '..', 'python'),
          timeout: 30000 // 30 second timeout
        }, (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Kaggle transport service error:', error.message);
            console.error('stderr:', stderr);
            // Fallback to simulated data if Kaggle fails
            resolve(this.getSimulatedTransportData());
            return;
          }
          
          try {
            const kaggleData = JSON.parse(stdout);
            console.log('✅ Successfully loaded Kaggle transportation data');
            console.log(`   📊 Data Summary: Bus ${kaggleData.bus_availability}%, Congestion ${kaggleData.congestion_level}%`);
            
            // Convert Kaggle data format to ProfitHive format
            const transformedData = this.transformKaggleData(kaggleData);
            resolve(transformedData);
            
          } catch (parseError) {
            console.error('❌ Failed to parse Kaggle service output:', parseError.message);
            console.error('Raw output:', stdout);
            resolve(this.getSimulatedTransportData());
          }
        });
      });
      
    } catch (error) {
      console.error('❌ Error loading Kaggle transportation data:', error.message);
      return this.getSimulatedTransportData();
    }
  }
  
  /**
   * Transform Kaggle API data to ProfitHive format
   * @param {Object} kaggleData - Raw data from Kaggle service
   * @returns {Object} Transformed data in ProfitHive format
   */
  transformKaggleData(kaggleData) {
    try {
      const currentHour = new Date().getHours();
      
      return {
        busRoutes: kaggleData.bus_routes || [],
        busAvailability: kaggleData.bus_availability || 75,
        trainServices: kaggleData.ride_sharing_stats || {},
        congestionLevel: kaggleData.congestion_level || 35,
        impactScore: kaggleData.impact_score || 75,
        isPeakHour: kaggleData.peak_hour || false,
        peakHours: kaggleData.peak_patterns?.all_peaks || [7, 8, 9, 12, 13, 17, 18, 19],
        realTimeMetrics: {
          busServiceLevel: kaggleData.bus_availability,
          rideServiceLevel: kaggleData.train_frequency, // Using ride-sharing as proxy
          congestionIndex: kaggleData.congestion_level,
          overallScore: kaggleData.impact_score
        },
        dataSource: {
          provider: 'kaggle_api',
          dataset: kaggleData.dataset || 'shahmirvarqha/transportation-in-cyberjaya-malaysia',
          isRealData: kaggleData.real_data || false,
          timestamp: kaggleData.timestamp,
          recordsProcessed: kaggleData.data_summary || {}
        },
        // Legacy format for backward compatibility
        trainLines: [
          { line: 'KLIA_Ekspres', frequency: 20, reliability: 95 },
          { line: 'KLIA_Transit', frequency: 30, reliability: 92 }
        ],
        peakHours: {
          morning: { start: 7, end: 9, congestionMultiplier: 1.8 },
          evening: { start: 17, end: 19, congestionMultiplier: 1.6 },
          lunch: { start: 12, end: 14, congestionMultiplier: 1.3 }
        },
        weekendReduction: 0.7,
        techWorkerPatterns: true
      };
      
    } catch (error) {
      console.error('❌ Error transforming Kaggle data:', error.message);
      return this.getSimulatedTransportData();
    }
  }
  
  /**
   * Fallback simulated transportation data (used when Kaggle API fails)
   * @returns {Object} Simulated transportation patterns and data
   */
  getSimulatedTransportData() {
    // Since we can't access the Kaggle dataset directly, we'll simulate
    // realistic Cyberjaya transportation patterns based on known characteristics
    
    return {
      busRoutes: [
        { route: 'T101', frequency: 15, reliability: 85 },
        { route: 'T102', frequency: 20, reliability: 80 },
        { route: 'T103', frequency: 30, reliability: 90 }
      ],
      trainLines: [
        { line: 'KLIA_Ekspres', frequency: 20, reliability: 95 },
        { line: 'KLIA_Transit', frequency: 30, reliability: 92 }
      ],
      peakHours: {
        morning: { start: 7, end: 9, congestionMultiplier: 1.8 },
        evening: { start: 17, end: 19, congestionMultiplier: 1.6 },
        lunch: { start: 12, end: 14, congestionMultiplier: 1.3 }
      },
      weekendReduction: 0.7, // 30% less traffic on weekends
      techWorkerPatterns: true, // Cyberjaya-specific tech worker commute patterns
      dataSource: {
        provider: 'simulated',
        isRealData: false,
        note: 'Using fallback simulated data'
      }
    };
  }

  /**
   * Calculate bus availability percentage based on time and patterns (Enhanced for Kaggle data)
   */
  calculateBusAvailability(hour, day, transportData) {
    // If we have real Kaggle data, use it directly
    if (transportData.busAvailability !== undefined) {
      console.log(`🚌 Using real Kaggle bus availability data: ${transportData.busAvailability}%`);
      return Math.round(transportData.busAvailability);
    }
    
    // Fallback to calculated method for simulated data
    let baseAvailability = 75; // Base availability percentage
    
    // Peak hour adjustments
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      baseAvailability += 20; // More buses during peak hours
    } else if (hour >= 22 || hour <= 6) {
      baseAvailability -= 30; // Reduced service at night
    }
    
    // Weekend adjustments
    if (day === 0 || day === 6) {
      baseAvailability *= transportData.weekendReduction;
    }
    
    return Math.max(0, Math.min(100, Math.round(baseAvailability)));
  }

  /**
   * Calculate train frequency percentage (Enhanced for Kaggle data)
   */
  calculateTrainFrequency(hour, day, transportData) {
    // If we have real Kaggle data, use the ride-sharing service level as proxy for train frequency
    if (transportData.realTimeMetrics && transportData.realTimeMetrics.rideServiceLevel !== undefined) {
      console.log(`🚊 Using real Kaggle ride service data as train proxy: ${transportData.realTimeMetrics.rideServiceLevel}%`);
      return Math.round(transportData.realTimeMetrics.rideServiceLevel);
    }
    
    // Fallback to calculated method for simulated data
    let baseFrequency = 80; // Base frequency percentage
    
    // Peak hour adjustments
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      baseFrequency += 15; // Higher frequency during peak
    } else if (hour >= 23 || hour <= 5) {
      baseFrequency -= 40; // Reduced service very early/late
    }
    
    // Weekend adjustments
    if (day === 0 || day === 6) {
      baseFrequency *= 0.8; // Slightly reduced weekend service
    }
    
    return Math.max(0, Math.min(100, Math.round(baseFrequency)));
  }

  /**
   * Calculate traffic congestion level (Enhanced for Kaggle data)
   */
  calculateCongestionLevel(hour, day, transportData) {
    // If we have real Kaggle data, use it directly
    if (transportData.congestionLevel !== undefined) {
      console.log(`🚗 Using real Kaggle congestion data: ${transportData.congestionLevel}%`);
      return Math.round(transportData.congestionLevel);
    }
    
    // Fallback to calculated method for simulated data
    let baseCongestion = 30; // Base congestion level
    
    // Peak hour impacts
    if (hour >= 7 && hour <= 9) {
      baseCongestion *= transportData.peakHours.morning.congestionMultiplier;
    } else if (hour >= 17 && hour <= 19) {
      baseCongestion *= transportData.peakHours.evening.congestionMultiplier;
    } else if (hour >= 12 && hour <= 14) {
      baseCongestion *= transportData.peakHours.lunch.congestionMultiplier;
    }
    
    // Weekend adjustments (less congestion)
    if (day === 0 || day === 6) {
      baseCongestion *= 0.6;
    }
    
    return Math.max(0, Math.min(100, Math.round(baseCongestion)));
  }

  /**
   * Calculate overall transportation impact score
   */
  calculateTransportImpactScore(busAvailability, trainFrequency, congestionLevel) {
    // Higher availability and frequency = positive impact
    // Higher congestion = negative impact
    const positiveImpact = (busAvailability + trainFrequency) / 2;
    const negativeImpact = congestionLevel;
    
    // Calculate weighted score (70% positive factors, 30% negative factors)
    const score = (positiveImpact * 0.7) + ((100 - negativeImpact) * 0.3);
    
    return Math.round(score);
  }

  /**
   * Check if current hour is peak hour
   */
  isPeakHour(hour) {
    return (hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 19);
  }

  /**
   * Fallback weather data when API fails
   */
  getFallbackWeatherData() {
    console.log('🔄 Using fallback weather data');
    return {
      temp: 28, // Typical Cyberjaya temperature
      humidity: 75, // Typical humidity
      condition: 'Partly Cloudy',
      description: 'partly cloudy',
      impactScore: 65, // Moderate impact
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Fallback transport data when analysis fails
   */
  getFallbackTransportData() {
    console.log('🔄 Using fallback transport data');
    const currentHour = new Date().getHours();
    
    return {
      busAvailability: this.isPeakHour(currentHour) ? 85 : 70,
      trainFrequency: this.isPeakHour(currentHour) ? 90 : 75,
      congestionLevel: this.isPeakHour(currentHour) ? 60 : 35,
      impactScore: this.isPeakHour(currentHour) ? 70 : 80,
      peakHour: this.isPeakHour(currentHour),
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Get combined external data impact
   * @returns {Object} Combined weather and transport data
   */
  async getCombinedImpact() {
    try {
      console.log('🔄 Fetching combined external data impact...');
      
      const [weatherImpact, transportImpact] = await Promise.all([
        this.getWeatherImpact(),
        this.getTransportImpact()
      ]);

      console.log('✅ Combined external data retrieved successfully');

      return {
        weather: weatherImpact,
        transport: transportImpact,
        combinedScore: Math.round((weatherImpact.impactScore + transportImpact.impactScore) / 2),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Combined impact analysis failed:', error.message);
      throw error;
    }
  }
}

export default ExternalDataService;