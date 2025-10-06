import fs from 'fs';

async function testForecastAPI() {
  try {
    const testData = JSON.parse(fs.readFileSync('./test_request.json', 'utf8'));
    
    const response = await fetch('https://profithive-backend-cdv8hvbta-samsuzzoha404s-projects.vercel.app/api/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('=== API Response ===');
    console.log('Status:', response.status);
    
    if (result.footTrafficImpact) {
      console.log('\n📊 Foot Traffic Impact Data:');
      console.log('Location:', result.footTrafficImpact.locationName);
      console.log('Current Traffic Level:', result.footTrafficImpact.currentTrafficLevel);
      console.log('Average Traffic:', result.footTrafficImpact.avgTraffic);
      console.log('Impact Score:', result.footTrafficImpact.impactScore);
      console.log('Popular Times Length:', result.footTrafficImpact.popularTimes?.length);
      
      if (result.footTrafficImpact.popularTimes) {
        console.log('\n🕐 Popular Times Data (first 5):');
        result.footTrafficImpact.popularTimes.slice(0, 5).forEach((time, index) => {
          console.log(`  ${time.hour}:00 - ${time.trafficLevel}% traffic`);
        });
      }
    } else {
      console.log('❌ No foot traffic data in response');
    }
    
    // Save full response for inspection
    fs.writeFileSync('./forecast_response.json', JSON.stringify(result, null, 2));
    console.log('\n💾 Full response saved to forecast_response.json');
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

testForecastAPI();