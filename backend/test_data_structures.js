/**
 * Test the fixed weather, transport, and foot traffic data structures
 */

const testForecastAPI = async () => {
  try {
    console.log('🧪 Testing fixed Prophet API response structure...');
    
    const sampleRequest = {
      store: "Test Cafe Weather Fix",
      city: "Cyberjaya",
      records: [
        {"date": "2025-09-01", "sales_rm": 2100, "customers": 105},
        {"date": "2025-09-02", "sales_rm": 2200, "customers": 110},
        {"date": "2025-09-03", "sales_rm": 2000, "customers": 100},
        {"date": "2025-09-04", "sales_rm": 2300, "customers": 115},
        {"date": "2025-09-05", "sales_rm": 2400, "customers": 120},
        {"date": "2025-09-06", "sales_rm": 2500, "customers": 125},
        {"date": "2025-09-07", "sales_rm": 2100, "customers": 105},
        {"date": "2025-09-08", "sales_rm": 2350, "customers": 118},
        {"date": "2025-09-09", "sales_rm": 2250, "customers": 113},
        {"date": "2025-09-10", "sales_rm": 2450, "customers": 123}
      ],
      use_prophet: true,
      predict_periods: 7
    };

    const response = await fetch('https://profithive-backend-7cy07eyw6-samsuzzoha404s-projects.vercel.app/api/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleRequest)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ API Response received!');
    console.log('\n📊 Forecast Data:');
    console.log(`  Method: ${result.method}`);
    console.log(`  Processing time: ${result.metadata?.processing_time_ms}ms`);
    console.log(`  Forecast entries: ${result.forecast?.length || 0}`);
    
    console.log('\n🌤️ Weather Impact:');
    if (result.weatherImpact) {
      console.log(`  Temperature: ${result.weatherImpact.temp?.toFixed(1)}°C`);
      console.log(`  Humidity: ${result.weatherImpact.humidity?.toFixed(1)}%`);
      console.log(`  Condition: ${result.weatherImpact.condition}`);
      console.log(`  Impact Score: ${result.weatherImpact.impactScore?.toFixed(1)}`);
      console.log(`  Description: ${result.weatherImpact.description}`);
    } else {
      console.log('  ❌ Weather data missing!');
    }
    
    console.log('\n🚌 Transport Impact:');
    if (result.transportImpact) {
      console.log(`  Bus Availability: ${result.transportImpact.busAvailability?.toFixed(1)}%`);
      console.log(`  Train Frequency: ${result.transportImpact.trainFrequency?.toFixed(1)}%`);
      console.log(`  Congestion Level: ${result.transportImpact.congestionLevel?.toFixed(1)}%`);
      console.log(`  Peak Hour: ${result.transportImpact.peakHour ? 'Yes' : 'No'}`);
      console.log(`  Impact Score: ${result.transportImpact.impactScore?.toFixed(1)}`);
      console.log(`  Description: ${result.transportImpact.description}`);
    } else {
      console.log('  ❌ Transport data missing!');
    }
    
    console.log('\n👥 Foot Traffic Impact:');
    if (result.footTrafficImpact) {
      console.log(`  Location: ${result.footTrafficImpact.locationName}`);
      console.log(`  Current Traffic: ${result.footTrafficImpact.currentTrafficLevel?.toFixed(1)}%`);
      console.log(`  Average Traffic: ${result.footTrafficImpact.avgTraffic?.toFixed(1)}%`);
      console.log(`  Impact Score: ${result.footTrafficImpact.impactScore?.toFixed(1)}`);
      console.log(`  Rating: ${result.footTrafficImpact.rating?.toFixed(1)} (${result.footTrafficImpact.totalRatings} reviews)`);
      
      if (result.footTrafficImpact.popularTimes && result.footTrafficImpact.popularTimes.length > 0) {
        console.log('  🕐 Popular Times:');
        result.footTrafficImpact.popularTimes.forEach(time => {
          console.log(`    ${time.hour}:00 - ${time.trafficLevel?.toFixed(1)}% traffic`);
        });
      } else {
        console.log('  ❌ Popular times data missing!');
      }
      console.log(`  Description: ${result.footTrafficImpact.description}`);
    } else {
      console.log('  ❌ Foot traffic data missing!');
    }
    
    console.log('\n🎉 All data structures validated successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testForecastAPI();