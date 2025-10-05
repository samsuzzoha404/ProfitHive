import ExternalDataService from './services/external-data-service.js';

console.log('🧪 Testing External Data Service with Kaggle Integration...\n');

async function testExternalDataService() {
  const externalDataService = new ExternalDataService();
  
  try {
    console.log('1️⃣ Testing Transportation Impact (Kaggle Integration):');
    const transportImpact = await externalDataService.getTransportImpact();
    console.log('Transport Impact Result:', JSON.stringify(transportImpact, null, 2));
    
    console.log('\n2️⃣ Testing Weather Impact:');
    const weatherImpact = await externalDataService.getWeatherImpact();
    console.log('Weather Impact Result:', JSON.stringify(weatherImpact, null, 2));
    
    console.log('\n3️⃣ Testing Transport Impact Details:');
    console.log('Transport Impact with full details:', JSON.stringify(transportImpact, null, 2));
    
    console.log('\n✅ External Data Service test completed successfully!');
    
    // Check if Kaggle data is being used
    if (transportImpact.dataSource && transportImpact.dataSource.provider === 'kaggle_api') {
      console.log('\n🎉 SUCCESS: Kaggle API integration is working!');
      console.log(`   📊 Dataset: ${transportImpact.dataSource.dataset}`);
      console.log(`   🚌 Bus Availability: ${transportImpact.busAvailability}%`);
      console.log(`   🚗 Congestion Level: ${transportImpact.congestionLevel}%`);
      console.log(`   💯 Impact Score: ${transportImpact.impactScore}/100`);
    } else {
      console.log('\n⚠️  WARNING: Kaggle integration not working, using fallback data');
      console.log(`   Data source: ${transportImpact.dataSource?.provider || 'unknown'}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing external data service:', error);
  }
}

testExternalDataService();