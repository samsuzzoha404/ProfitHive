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
    this.weatherApiKey = 'e0c1e33b4fd3829c32efac10c80642c3';
    this.weatherApiUrl = 'https://weatherstack.com/dashboard';
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
          q: 'Cyberjaya,my',
          appid: this.weatherApiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      const weatherData = response.data;
      const temp = weatherData.main.temp;
      const humidity = weatherData.main.humidity;
      const condition = weatherData.weather[0].main;
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
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Transportation data analysis failed:', error.message);
      
      // Return fallback transport data
      return this.getFallbackTransportData();
    }
  }

  /**
   * Load or simulate Cyberjaya transportation data
   * @returns {Object} Transportation patterns and data
   */
  async loadCyberjayanTransportData() {
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
      techWorkerPatterns: true // Cyberjaya-specific tech worker commute patterns
    };
  }

  /**
   * Calculate bus availability percentage based on time and patterns
   */
  calculateBusAvailability(hour, day, transportData) {
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
   * Calculate train frequency percentage
   */
  calculateTrainFrequency(hour, day, transportData) {
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
   * Calculate traffic congestion level
   */
  calculateCongestionLevel(hour, day, transportData) {
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