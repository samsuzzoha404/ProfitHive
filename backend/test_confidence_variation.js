import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testMultipleRequests() {
  console.log('🔍 Testing confidence variation with multiple requests...\n');
  
  const testData = {
    store: "Test Cafe",
    city: "Cyberjaya", 
    records: [
      {"date": "2025-08-01", "customers": 153, "sales_rm": 3060},
      {"date": "2025-08-02", "customers": 193, "sales_rm": 3860},
      {"date": "2025-08-03", "customers": 137, "sales_rm": 2740},
      {"date": "2025-08-04", "customers": 194, "sales_rm": 3880},
      {"date": "2025-08-05", "customers": 201, "sales_rm": 4020},
      {"date": "2025-08-06", "customers": 168, "sales_rm": 3360},
      {"date": "2025-08-07", "customers": 186, "sales_rm": 3720},
      {"date": "2025-08-08", "customers": 159, "sales_rm": 3180},
      {"date": "2025-08-09", "customers": 175, "sales_rm": 3500},
      {"date": "2025-08-10", "customers": 142, "sales_rm": 2840}
    ]
  };

  try {
    // Start server
    console.log('Starting server...');
    const serverProcess = exec('npm start', { cwd: '.' });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const confidenceValues = [];
    
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch('http://localhost:5000/api/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        const overallConfidence = result.ai_insights?.detailed?.find(insight => 
          insight.includes('Prophet model confidence:')
        );
        
        const dailyConfidences = result.forecast?.map(day => day.confidence) || [];
        const avgDailyConfidence = dailyConfidences.reduce((a, b) => a + b, 0) / dailyConfidences.length;
        
        console.log(`Request ${i + 1}:`);
        console.log(`  Overall: ${overallConfidence || 'N/A'}`);
        console.log(`  Avg Daily: ${avgDailyConfidence?.toFixed(1)}%`);
        console.log(`  Range: ${Math.min(...dailyConfidences)}% - ${Math.max(...dailyConfidences)}%`);
        
        confidenceValues.push({
          overall: overallConfidence,
          avgDaily: avgDailyConfidence,
          range: `${Math.min(...dailyConfidences)}% - ${Math.max(...dailyConfidences)}%`
        });
        
      } catch (error) {
        console.log(`Request ${i + 1}: Failed - ${error.message}`);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Summary:');
    console.log('Confidence values should now show variation instead of always being 95%');
    
    // Kill server
    serverProcess.kill();
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testMultipleRequests();