/**
 * Google Maps Foot Traffic Service
 * Fetches popular times and foot traffic data from Google Maps Places API
 * 
 * Author: Cyberjaya Team
 * Features: Real-time foot traffic, popular times data
 */

import axios from 'axios';

class FootTrafficService {
  
  constructor() {
    this.googleMapsApiKey = 'AIzaSyAzI03sJax4sxCLYTLm2Drle85k1cpN9r8';
    this.cyberjayanPlaceId = 'ChIJG_yUGCIjzTERhJgdAYGpilg'; // Example place ID for Cyberjaya
    this.placesApiUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
  }

  /**
   * Get foot traffic impact data for Cyberjaya retail location
   * @param {string} placeId - Optional custom place ID
   * @returns {Object} Foot traffic impact data with popular times and current traffic
   */
  async getFootTrafficImpact(placeId = this.cyberjayanPlaceId) {
    try {
      console.log('👥 Fetching foot traffic data from Google Maps Places API...');
      
      const response = await axios.get(this.placesApiUrl, {
        params: {
          place_id: placeId,
          fields: 'name,popular_times,rating,user_ratings_total,current_opening_hours',
          key: this.googleMapsApiKey
        },
        timeout: 10000
      });

      const placeData = response.data.result;
      
      if (!placeData) {
        throw new Error('No place data found for the specified location');
      }

      // Extract popular times data
      const popularTimes = this.parsePopularTimes(placeData.popular_times);
      
      // Calculate current traffic level based on current time
      const currentHour = new Date().getHours();
      const currentTrafficLevel = this.getCurrentTrafficLevel(popularTimes, currentHour);
      
      // Calculate average traffic for impact scoring
      const avgTraffic = this.calculateAverageTraffic(popularTimes);
      
      // Calculate impact score (0-100)
      const impactScore = this.calculateFootTrafficImpactScore(currentTrafficLevel, avgTraffic, placeData.rating);

      console.log(`✅ Foot traffic data retrieved: Current ${currentTrafficLevel}%, Avg ${avgTraffic}%, Impact: ${impactScore}`);

      return {
        locationName: placeData.name || 'Cyberjaya Retail Location',
        popularTimes: popularTimes,
        currentTrafficLevel: currentTrafficLevel,
        avgTraffic: avgTraffic,
        impactScore: impactScore,
        rating: placeData.rating || 4.0,
        totalRatings: placeData.user_ratings_total || 100,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Google Maps Places API failed:', error.message);
      
      // Return fallback foot traffic data
      return this.getFallbackFootTrafficData();
    }
  }

  /**
   * Parse popular times data from Google Places API
   * @param {Array} popularTimesData - Raw popular times data from API
   * @returns {Array} Formatted popular times array with hour and traffic level
   */
  parsePopularTimes(popularTimesData) {
    if (!popularTimesData || !Array.isArray(popularTimesData)) {
      return this.generateDefaultPopularTimes();
    }

    // Get today's popular times (0 = Monday, 6 = Sunday in Google's format)
    const today = new Date().getDay();
    const todayData = popularTimesData.find(day => day.day === (today === 0 ? 6 : today - 1));
    
    if (!todayData || !todayData.data) {
      return this.generateDefaultPopularTimes();
    }

    // Convert Google's format to our format
    const popularTimes = [];
    for (let hour = 0; hour < 24; hour++) {
      const trafficLevel = todayData.data[hour] || 0; // Google provides 0-100 scale
      popularTimes.push({
        hour: hour,
        trafficLevel: trafficLevel
      });
    }

    return popularTimes;
  }

  /**
   * Generate default popular times data for fallback
   * @returns {Array} Default popular times with typical retail patterns
   */
  generateDefaultPopularTimes() {
    const defaultPattern = [
      10, 15, 20, 25, 30, 35, 40, 45, // 12AM-8AM (low traffic)
      60, 75, 85, 90, 95, 85, 80, 75, // 8AM-4PM (business hours peak)
      85, 90, 95, 88, 75, 65, 50, 35  // 4PM-12AM (evening peak)
    ];

    return defaultPattern.map((trafficLevel, hour) => ({
      hour: hour,
      trafficLevel: trafficLevel
    }));
  }

  /**
   * Get current traffic level based on hour
   * @param {Array} popularTimes - Popular times data
   * @param {number} currentHour - Current hour (0-23)
   * @returns {number} Current traffic level (0-100)
   */
  getCurrentTrafficLevel(popularTimes, currentHour) {
    const currentHourData = popularTimes.find(data => data.hour === currentHour);
    return currentHourData ? currentHourData.trafficLevel : 50;
  }

  /**
   * Calculate average traffic across all hours
   * @param {Array} popularTimes - Popular times data
   * @returns {number} Average traffic level
   */
  calculateAverageTraffic(popularTimes) {
    if (!popularTimes || popularTimes.length === 0) {
      return 50;
    }

    const totalTraffic = popularTimes.reduce((sum, data) => sum + data.trafficLevel, 0);
    return Math.round(totalTraffic / popularTimes.length);
  }

  /**
   * Calculate foot traffic impact score
   * @param {number} currentTrafficLevel - Current traffic level
   * @param {number} avgTraffic - Average traffic level
   * @param {number} rating - Place rating (1-5)
   * @returns {number} Impact score (0-100)
   */
  calculateFootTrafficImpactScore(currentTrafficLevel, avgTraffic, rating = 4.0) {
    let score = 50; // Base score

    // Current traffic impact
    if (currentTrafficLevel > 80) {
      score += 25; // High current traffic
    } else if (currentTrafficLevel > 60) {
      score += 15; // Moderate traffic
    } else if (currentTrafficLevel < 30) {
      score -= 15; // Low traffic
    }

    // Average traffic impact
    if (avgTraffic > 70) {
      score += 15; // Generally busy location
    } else if (avgTraffic < 40) {
      score -= 10; // Generally quiet location
    }

    // Place rating impact
    if (rating >= 4.5) {
      score += 10; // High-rated location
    } else if (rating >= 4.0) {
      score += 5; // Good rating
    } else if (rating < 3.0) {
      score -= 10; // Poor rating
    }

    // Time-based adjustments for Cyberjaya retail patterns
    const currentHour = new Date().getHours();
    if (currentHour >= 12 && currentHour <= 14) {
      score += 10; // Lunch time boost
    } else if (currentHour >= 18 && currentHour <= 21) {
      score += 15; // Evening peak
    } else if (currentHour < 8 || currentHour > 22) {
      score -= 20; // Off-peak hours
    }

    // Weekend boost (Cyberjaya has more weekend shoppers)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      score += 10;
    }

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get fallback foot traffic data when API fails
   * @returns {Object} Fallback foot traffic data
   */
  getFallbackFootTrafficData() {
    console.log('🔄 Using fallback foot traffic data...');
    
    const currentHour = new Date().getHours();
    const popularTimes = this.generateDefaultPopularTimes();
    const currentTrafficLevel = this.getCurrentTrafficLevel(popularTimes, currentHour);
    const avgTraffic = this.calculateAverageTraffic(popularTimes);

    return {
      locationName: 'Cyberjaya Retail Location (Fallback)',
      popularTimes: popularTimes,
      currentTrafficLevel: currentTrafficLevel,
      avgTraffic: avgTraffic,
      impactScore: this.calculateFootTrafficImpactScore(currentTrafficLevel, avgTraffic),
      rating: 4.0,
      totalRatings: 100,
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }
}

export default FootTrafficService;