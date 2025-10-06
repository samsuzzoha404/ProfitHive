/**
 * Prophet API Usage Examples
 * ==========================
 * 
 * Demonstrates how to use the Prophet-integrated forecast API
 * 
 * Usage:
 *   node backend/prophet_api_examples.js
 * 
 * Make sure the server is running or use deployed backend:
 * Local: http://localhost:5000
 * Deployed: https://profithive-backend-mzhe4oa0k-samsuzzoha404s-projects.vercel.app
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://profithive-backend-mzhe4oa0k-samsuzzoha404s-projects.vercel.app';
const TEST_DATA_FILE = './test_prophet_input.json';

/**
 * Helper function to make API requests
 */
async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`📡 ${method} ${endpoint}`);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Request failed (${response.status}):`, data.error || data.message);
      return null;
    }
    
    console.log(`✅ Request successful (${response.status})`);
    return data;
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return null;
  }
}

/**
 * Example 1: Basic Prophet Forecast
 */
async function exampleBasicProphetForecast() {
  console.log('\n🔮 Example 1: Basic Prophet Forecast');
  console.log('=====================================');
  
  // Load test data
  const testData = JSON.parse(await fs.readFile(TEST_DATA_FILE, 'utf8'));
  
  // Convert to API format
  const requestData = {
    store: 'Test Cafe Prophet',
    city: 'Cyberjaya',
    retailerId: 'prophet_demo_001',
    records: testData.history.map(record => ({
      date: record.ds,
      sales_rm: record.y,
      customers: Math.round(record.y * 0.05) // Estimate customers from sales
    })),
    use_prophet: true,
    predict_periods: 14
  };

  const result = await makeRequest('/api/forecast', 'POST', requestData);
  
  if (result) {
    console.log(`📊 Forecast Summary:`);
    console.log(`   Store: ${result.store}`);
    console.log(`   Method: ${result.method}`);
    console.log(`   Forecast Days: ${result.forecast_horizon_days}`);
    console.log(`   Total Predicted Revenue: RM${result.summary?.total_predicted_revenue?.toLocaleString()}`);
    console.log(`   Average Confidence: ${result.summary?.average_confidence}%`);
    console.log(`   Processing Time: ${result.metadata?.processing_time_ms}ms`);
    
    if (result.forecast && result.forecast.length > 0) {
      console.log(`\n📅 Sample Predictions (first 3 days):`);
      result.forecast.slice(0, 3).forEach(day => {
        console.log(`   ${day.date}: RM${day.predicted_sales.toLocaleString()} (${day.confidence}% confidence)`);
      });
    }

    // Check if Prophet was actually used
    if (result.method?.includes('prophet')) {
      console.log(`✅ Prophet forecasting was successfully used`);
    } else {
      console.log(`⚠️  Fallback method used: ${result.method}`);
    }
  }
}

/**
 * Example 2: Prophet Forecast with External Impacts
 */
async function exampleProphetWithExternalImpacts() {
  console.log('\n🌤️ Example 2: Prophet Forecast with External Impacts');
  console.log('====================================================');
  
  // Load test data
  const testData = JSON.parse(await fs.readFile(TEST_DATA_FILE, 'utf8'));
  
  // Prepare request with external impacts
  const requestData = {
    store: 'Tech Mall Cafe',
    city: 'Cyberjaya',
    retailerId: 'prophet_demo_002',
    records: testData.history.map(record => ({
      date: record.ds,
      sales_rm: record.y,
      customers: Math.round(record.y * 0.05)
    })),
    weatherImpact: {
      impact: {
        temperature: 32,
        condition: 'sunny',
        score: 0.85
      },
      summary: 'Hot sunny weather expected'
    },
    transportImpact: {
      impact: {
        accessibility: 90,
        score: 0.90
      },
      summary: 'Excellent transport connectivity'
    },
    footTrafficImpact: {
      impact: {
        level: 85,
        popular_times: [
          { hour: 8, level: 70 },
          { hour: 12, level: 95 },
          { hour: 13, level: 90 },
          { hour: 18, level: 80 }
        ]
      },
      summary: 'High foot traffic area'
    },
    use_prophet: true,
    predict_periods: 7 // One week forecast
  };

  const result = await makeRequest('/api/forecast', 'POST', requestData);
  
  if (result) {
    console.log(`📊 Enhanced Forecast Summary:`);
    console.log(`   Method: ${result.method}`);
    console.log(`   Weather Impact Score: ${result.weatherImpact?.score}`);
    console.log(`   Transport Impact Score: ${result.transportImpact?.score}`);
    console.log(`   Foot Traffic Impact Score: ${result.footTrafficImpact?.score}`);
    
    if (result.weatherImpact?.explanation) {
      console.log(`   Weather: ${result.weatherImpact.explanation}`);
    }
    if (result.transportImpact?.explanation) {
      console.log(`   Transport: ${result.transportImpact.explanation}`);
    }
    if (result.footTrafficImpact?.explanation) {
      console.log(`   Foot Traffic: ${result.footTrafficImpact.explanation}`);
    }
  }
}

/**
 * Example 3: Manual Prophet Model Training
 */
async function exampleProphetModelTraining() {
  console.log('\n🤖 Example 3: Prophet Model Training');
  console.log('====================================');
  
  // Load test data
  const testData = JSON.parse(await fs.readFile(TEST_DATA_FILE, 'utf8'));
  
  // Prepare training request
  const trainingData = {
    retailerId: 'prophet_demo_training_001',
    history: testData.history.map(record => ({
      date: record.ds,
      sales_rm: record.y,
      customers: Math.round(record.y * 0.05)
    }))
  };

  const result = await makeRequest('/api/prophet/train', 'POST', trainingData);
  
  if (result) {
    console.log(`✅ Model Training Successful:`);
    console.log(`   Retailer ID: ${result.retailer_id}`);
    console.log(`   Training Data Points: ${result.training_data_points}`);
    console.log(`   Status: ${result.result?.status}`);
    console.log(`   Data Points Used: ${result.result?.data_points}`);
    if (result.result?.model_path) {
      console.log(`   Model Path: ${result.result.model_path}`);
    }
  }
}

/**
 * Example 4: Prophet Cache Management
 */
async function exampleCacheManagement() {
  console.log('\n🗄️ Example 4: Prophet Cache Management');
  console.log('======================================');
  
  // Get cache stats
  console.log('\n📈 Current Cache Stats:');
  const stats = await makeRequest('/api/prophet/cache/stats');
  if (stats) {
    console.log(`   Valid Entries: ${stats.cache_stats.validEntries}`);
    console.log(`   Expired Entries: ${stats.cache_stats.expiredEntries}`);
    console.log(`   Total Entries: ${stats.cache_stats.totalEntries}`);
  }

  // Clear cache
  console.log('\n🧹 Clearing Cache:');
  const clearResult = await makeRequest('/api/prophet/cache', 'DELETE');
  if (clearResult) {
    console.log(`✅ Cache cleared successfully`);
    console.log(`   Entries before: ${clearResult.before.totalEntries}`);
    console.log(`   Entries after: ${clearResult.after.totalEntries}`);
  }
}

/**
 * Example 5: Performance Comparison
 */
async function examplePerformanceComparison() {
  console.log('\n⚡ Example 5: Performance Comparison');
  console.log('====================================');
  
  // Load test data
  const testData = JSON.parse(await fs.readFile(TEST_DATA_FILE, 'utf8'));
  
  const baseRequest = {
    store: 'Performance Test Cafe',
    city: 'Cyberjaya',
    retailerId: 'performance_test_001',
    records: testData.history.map(record => ({
      date: record.ds,
      sales_rm: record.y,
      customers: Math.round(record.y * 0.05)
    })),
    predict_periods: 14
  };

  // Test Enhanced AI (without Prophet)
  console.log('\n📊 Testing Enhanced AI Forecast:');
  const enhancedStart = Date.now();
  const enhancedResult = await makeRequest('/api/forecast', 'POST', {
    ...baseRequest,
    use_prophet: false
  });
  const enhancedTime = Date.now() - enhancedStart;

  // Test Prophet Forecast
  console.log('\n🔮 Testing Prophet Forecast:');
  const prophetStart = Date.now();
  const prophetResult = await makeRequest('/api/forecast', 'POST', {
    ...baseRequest,
    use_prophet: true
  });
  const prophetTime = Date.now() - prophetStart;

  // Compare results
  if (enhancedResult && prophetResult) {
    console.log('\n⚖️  Performance Comparison:');
    console.log(`   Enhanced AI Time: ${enhancedTime}ms`);
    console.log(`   Prophet Time: ${prophetTime}ms`);
    console.log(`   Speed Ratio: ${(prophetTime / enhancedTime).toFixed(2)}x`);
    
    console.log('\n📈 Accuracy Comparison:');
    console.log(`   Enhanced AI Confidence: ${enhancedResult.summary?.average_confidence || 'N/A'}%`);
    console.log(`   Prophet Confidence: ${prophetResult.summary?.average_confidence || 'N/A'}%`);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Prophet API Usage Examples');
  console.log('==============================');
  console.log(`Server URL: ${BASE_URL}`);
  
  try {
    // Check if server is running
    const health = await makeRequest('/health');
    if (!health) {
      console.error('❌ Server is not running. Please start the server first with: npm start');
      process.exit(1);
    }
    
    console.log('✅ Server is running');
    
    // Run examples
    await exampleBasicProphetForecast();
    await exampleProphetWithExternalImpacts();
    await exampleProphetModelTraining();
    await exampleCacheManagement();
    await examplePerformanceComparison();
    
    console.log('\n🎉 All examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Example execution failed:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Check if we have node-fetch available
try {
  await import('node-fetch');
} catch (error) {
  console.error('❌ node-fetch is required. Install it with: npm install node-fetch');
  process.exit(1);
}

// Run examples
main();