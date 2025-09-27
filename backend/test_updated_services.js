import ExternalDataService from './services/external-data-service.js';

console.log('🧪 Testing Updated Weather API and Transport Impact...\n');

async function testUpdatedServices() {
  const externalDataService = new ExternalDataService();
  
  try {
    console.log('1️⃣ Testing Updated Weather Impact (New API Key):');
    const weatherImpact = await externalDataService.getWeatherImpact();
    console.log('Weather Impact Result:', JSON.stringify(weatherImpact, null, 2));
    
    console.log('\n2️⃣ Testing Transportation Impact (Kaggle Integration):');
    const transportImpact = await externalDataService.getTransportImpact();
    console.log('Transport Impact Result:', JSON.stringify(transportImpact, null, 2));
    
    console.log('\n✅ External Data Service tests completed!');
    
    // Check weather API
    if (weatherImpact.fallback) {
      console.log('\n⚠️  WARNING: Weather API using fallback data');
    } else {
      console.log('\n🌤️  SUCCESS: Weather API with new key is working!');
      console.log(`   🌡️  Temperature: ${weatherImpact.temp}°C`);
      console.log(`   ☁️  Condition: ${weatherImpact.condition}`);
      console.log(`   💯 Impact Score: ${weatherImpact.impactScore}/100`);
    }
    
    // Check transport impact
    if (transportImpact.dataSource && transportImpact.dataSource.provider === 'kaggle_api') {
      console.log('\n🚌 SUCCESS: Transport Impact with Kaggle data is working!');
      console.log(`   📊 Dataset: ${transportImpact.dataSource.dataset}`);
      console.log(`   🚌 Bus Availability: ${transportImpact.busAvailability}%`);
      console.log(`   🚗 Congestion Level: ${transportImpact.congestionLevel}%`);
      console.log(`   💯 Impact Score: ${transportImpact.impactScore}/100`);
      console.log(`   📈 Records: ${transportImpact.dataSource.recordsProcessed.kumpool_records} ridership records`);
    } else {
      console.log('\n⚠️  WARNING: Transport Impact not using Kaggle data');
      console.log(`   Data source: ${transportImpact.dataSource?.provider || 'unknown'}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing services:', error);
  }
}

testUpdatedServices();