/**
 * Vercel-Compatible External Data Service
 * Provides mock external data for serverless environments
 * In Vercel: Uses generated mock data only
 * In development: Uses real API calls when available
 */

class VercelExternalDataService {
  constructor() {
    this.isVercel = !!process.env.VERCEL;
    console.log(`🌐 External Data Service initialized for ${this.isVercel ? 'Vercel serverless' : 'local development'}`);
  }

  /**
   * Get weather impact data - mock for Vercel
   */
  async getWeatherImpact() {
    if (this.isVercel) {
      return this.generateMockWeatherData();
    } else {
      try {
        // Try to use real service in development
        const { default: ExternalDataService } = await import('./external-data-service.js');
        const service = new ExternalDataService();
        return await service.getWeatherImpact();
      } catch (error) {
        console.warn('Real weather service failed, using mock data:', error.message);
        return this.generateMockWeatherData();
      }
    }
  }

  /**
   * Get transport impact data - mock for Vercel
   */
  async getTransportImpact() {
    if (this.isVercel) {
      return this.generateMockTransportData();
    } else {
      try {
        // Try to use real service in development
        const { default: ExternalDataService } = await import('./external-data-service.js');
        const service = new ExternalDataService();
        return await service.getTransportImpact();
      } catch (error) {
        console.warn('Real transport service failed, using mock data:', error.message);
        return this.generateMockTransportData();
      }
    }
  }

  /**
   * Generate mock weather data
   */
  generateMockWeatherData() {
    const conditions = ['sunny', 'cloudy', 'partly-cloudy', 'rainy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    let impactScore;
    switch (condition) {
      case 'sunny': impactScore = 0.8 + Math.random() * 0.2; break;
      case 'partly-cloudy': impactScore = 0.6 + Math.random() * 0.3; break;
      case 'cloudy': impactScore = 0.4 + Math.random() * 0.4; break;
      case 'rainy': impactScore = 0.2 + Math.random() * 0.3; break;
      default: impactScore = 0.6;
    }

    return {
      temp: Math.round((26 + Math.random() * 8) * 10) / 10, // 26-34°C
      humidity: Math.round(55 + Math.random() * 30), // 55-85%
      condition: condition,
      description: `${condition} weather conditions in Cyberjaya`,
      impactScore: Math.round(impactScore * 100),
      timestamp: new Date().toISOString(),
      fallback: this.isVercel,
      source: this.isVercel ? 'vercel_mock' : 'fallback_mock'
    };
  }

  /**
   * Generate mock transport data
   */
  generateMockTransportData() {
    const currentHour = new Date().getHours();
    const isPeakHour = (currentHour >= 7 && currentHour <= 9) || 
                      (currentHour >= 17 && currentHour <= 19);
    
    // Adjust availability based on peak hours
    const busAvailability = isPeakHour ? 
      Math.round((60 + Math.random() * 25) * 10) / 10 : 
      Math.round((80 + Math.random() * 15) * 10) / 10;
    
    const congestionLevel = isPeakHour ? 
      Math.round((60 + Math.random() * 30) * 10) / 10 : 
      Math.round((20 + Math.random() * 30) * 10) / 10;
    
    const impactScore = isPeakHour ? 0.4 + Math.random() * 0.3 : 0.7 + Math.random() * 0.2;

    return {
      busAvailability: busAvailability,
      trainFrequency: Math.round((85 + Math.random() * 10) * 10) / 10,
      congestionLevel: congestionLevel,
      impactScore: Math.round(impactScore * 100),
      peakHour: isPeakHour,
      timestamp: new Date().toISOString(),
      fallback: this.isVercel,
      source: this.isVercel ? 'vercel_mock' : 'fallback_mock',
      description: `Transport conditions in Cyberjaya - ${isPeakHour ? 'Peak Hour' : 'Normal'}`
    };
  }

  /**
   * Get foot traffic data - mock for Vercel
   */
  async getFootTrafficImpact() {
    return this.generateMockFootTrafficData();
  }

  /**
   * Generate mock foot traffic data
   */
  generateMockFootTrafficData() {
    const currentHour = new Date().getHours();
    const popularTimes = [];
    
    // Generate 24-hour foot traffic pattern
    for (let hour = 0; hour < 24; hour++) {
      let trafficLevel;
      
      if (hour >= 8 && hour <= 18) {
        // Business hours - higher traffic
        trafficLevel = Math.round((70 + Math.random() * 25) * 10) / 10;
      } else if (hour >= 19 && hour <= 22) {
        // Evening dining/entertainment
        trafficLevel = Math.round((60 + Math.random() * 30) * 10) / 10;
      } else {
        // Late night/early morning
        trafficLevel = Math.round((10 + Math.random() * 20) * 10) / 10;
      }
      
      popularTimes.push({ hour, trafficLevel });
    }

    const currentTrafficLevel = popularTimes[currentHour].trafficLevel;
    const avgTraffic = Math.round(popularTimes.reduce((sum, item) => sum + item.trafficLevel, 0) / 24);
    
    return {
      locationName: 'Cyberjaya Business District',
      popularTimes: popularTimes,
      currentTrafficLevel: currentTrafficLevel,
      avgTraffic: avgTraffic,
      impactScore: Math.round((0.6 + Math.random() * 0.3) * 100),
      rating: Math.round((4.2 + Math.random() * 0.6) * 10) / 10,
      totalRatings: 150 + Math.floor(Math.random() * 100),
      fallback: this.isVercel,
      timestamp: new Date().toISOString(),
      source: this.isVercel ? 'vercel_mock' : 'fallback_mock',
      description: 'Foot traffic patterns in Cyberjaya business area'
    };
  }
}

export default VercelExternalDataService;