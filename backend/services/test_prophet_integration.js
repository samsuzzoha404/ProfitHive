/**
 * Prophet Integration Test Suite
 * ==============================
 * 
 * Tests the complete Prophet forecasting pipeline:
 * 1. Node.js wrapper calling Python Prophet service
 * 2. Enhanced AI service integration
 * 3. Express API endpoint validation
 * 
 * Usage:
 *   node backend/services/test_prophet_integration.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our services
import { callProphetPredict, trainProphetModel, getCacheStats } from './prophet-wrapper.js';
import EnhancedAIForecastService from './enhanced-ai-service.js';

/**
 * Test configuration
 */
const TEST_CONFIG = {
  testDataFile: path.join(__dirname, '..', 'test_prophet_input.json'),
  retailerId: 'test_retailer_integration_001',
  predictPeriods: 14,
  minAccuracy: 0.5, // Minimum acceptable confidence score
  timeoutMs: 60000   // 1 minute timeout for tests
};

/**
 * Test utilities
 */
class TestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runTest(testName, testFunction) {
    const testStart = Date.now();
    console.log(`\n🧪 Running test: ${testName}`);
    
    try {
      await testFunction();
      const duration = Date.now() - testStart;
      console.log(`✅ Test passed: ${testName} (${duration}ms)`);
      
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration: duration,
        error: null
      });
      
    } catch (error) {
      const duration = Date.now() - testStart;
      console.error(`❌ Test failed: ${testName} (${duration}ms)`);
      console.error(`   Error: ${error.message}`);
      
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        duration: duration,
        error: error.message
      });
    }
  }

  printSummary() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.testResults.filter(t => t.status === 'PASSED').length;
    const failed = this.testResults.filter(t => t.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log(`\n📊 Test Summary`);
    console.log(`================`);
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success rate: ${Math.round((passed / total) * 100)}%`);
    console.log(`Total time: ${totalTime}ms`);
    
    if (failed > 0) {
      console.log(`\nFailed tests:`);
      this.testResults
        .filter(t => t.status === 'FAILED')
        .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
    }

    return failed === 0;
  }
}

/**
 * Load test data
 */
async function loadTestData() {
  try {
    const data = await fs.readFile(TEST_CONFIG.testDataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to load test data: ${error.message}`);
  }
}

/**
 * Test 1: Basic Prophet Wrapper Call
 */
async function testProphetWrapperBasic() {
  const testData = await loadTestData();
  
  // Prepare history data for Prophet
  const historyArray = testData.history.map(record => ({
    ds: record.ds,
    y: record.y,
    weather_score: record.weather_score || 0.5,
    transport_score: record.transport_score || 0.5,
    foot_traffic_score: record.foot_traffic_score || 0.5
  }));

  // Call Prophet predict
  const result = await callProphetPredict(
    historyArray,
    TEST_CONFIG.predictPeriods,
    'D',
    TEST_CONFIG.retailerId
  );

  // Validate result structure
  assert(result, 'Prophet result should not be null');
  assert(result.predictions, 'Result should contain predictions array');
  assert(Array.isArray(result.predictions), 'Predictions should be an array');
  assert(result.predictions.length === TEST_CONFIG.predictPeriods, 
    `Should return ${TEST_CONFIG.predictPeriods} predictions`);
  assert(result.confidence, 'Result should contain confidence score');
  assert(result.model_meta, 'Result should contain model metadata');

  // Validate prediction structure
  const firstPrediction = result.predictions[0];
  assert(firstPrediction.ds, 'Prediction should have date (ds)');
  assert(typeof firstPrediction.yhat === 'number', 'Prediction should have numeric yhat');
  assert(firstPrediction.yhat_lower !== undefined, 'Prediction should have yhat_lower');
  assert(firstPrediction.yhat_upper !== undefined, 'Prediction should have yhat_upper');

  console.log(`   Generated ${result.predictions.length} predictions with confidence: ${result.confidence}`);
}

/**
 * Test 2: Enhanced AI Service Integration
 */
async function testEnhancedAIServiceIntegration() {
  const testData = await loadTestData();
  
  // Convert test data to sales history format
  const salesHistory = testData.history.map(record => ({
    date: record.ds,
    sales_rm: record.y,
    customers: Math.round(record.y * 0.05) // Estimate customers from sales
  }));

  // Mock external impacts
  const weatherImpact = {
    impact: {
      temperature: 28,
      condition: 'sunny',
      score: 0.8
    }
  };

  const transportImpact = {
    impact: {
      accessibility: 85,
      score: 0.85
    }
  };

  const footTrafficImpact = {
    impact: {
      level: 78,
      popular_times: [
        { hour: 12, level: 90 },
        { hour: 13, level: 85 },
        { hour: 18, level: 80 }
      ]
    }
  };

  // Call Prophet forecast through Enhanced AI service
  const result = await EnhancedAIForecastService.getProphetForecast({
    salesHistory,
    weatherImpact,
    transportImpact,
    footTrafficImpact,
    predictPeriods: TEST_CONFIG.predictPeriods,
    retailerId: TEST_CONFIG.retailerId
  });

  // Validate result structure
  assert(result, 'Enhanced AI result should not be null');
  assert(result.predictedSales, 'Result should contain predictedSales');
  assert(result.customerTraffic, 'Result should contain customerTraffic');
  assert(result.confidence, 'Result should contain confidence');
  assert(result.impacts, 'Result should contain impacts');
  assert(result.model_meta, 'Result should contain model_meta');

  // Validate predicted sales structure
  const predictedSales = result.predictedSales;
  assert(predictedSales.total > 0, 'Total predicted sales should be positive');
  assert(Array.isArray(predictedSales.daily), 'Daily predictions should be an array');
  assert(predictedSales.daily.length === TEST_CONFIG.predictPeriods, 
    `Should contain ${TEST_CONFIG.predictPeriods} daily predictions`);

  // Validate impacts
  const impacts = result.impacts;
  assert(impacts.weatherImpact, 'Should contain weather impact');
  assert(impacts.transportImpact, 'Should contain transport impact');
  assert(impacts.footTrafficImpact, 'Should contain foot traffic impact');

  console.log(`   Predicted total sales: RM${predictedSales.total.toLocaleString()}`);
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
}

/**
 * Test 3: Model Training
 */
async function testModelTraining() {
  const testData = await loadTestData();
  
  // Prepare training data
  const trainingData = testData.history.map(record => ({
    ds: record.ds,
    y: record.y,
    weather_score: record.weather_score || 0.5,
    transport_score: record.transport_score || 0.5,
    foot_traffic_score: record.foot_traffic_score || 0.5
  }));

  // Train model
  const result = await trainProphetModel(trainingData, TEST_CONFIG.retailerId);

  // Validate training result
  assert(result, 'Training result should not be null');
  assert(result.status === 'success', 'Training should be successful');
  assert(result.data_points, 'Result should contain data points count');
  assert(result.model_path, 'Result should contain model path');

  console.log(`   Trained model with ${result.data_points} data points`);
  console.log(`   Model saved to: ${result.model_path}`);
}

/**
 * Test 4: Cache Management
 */
async function testCacheManagement() {
  // Get initial cache stats
  const initialStats = getCacheStats();
  assert(typeof initialStats === 'object', 'Cache stats should be an object');
  assert(typeof initialStats.validEntries === 'number', 'Should contain validEntries count');

  console.log(`   Cache entries: ${initialStats.validEntries} valid, ${initialStats.expiredEntries} expired`);
}

/**
 * Test 5: Error Handling
 */
async function testErrorHandling() {
  // Test with insufficient data
  try {
    await callProphetPredict([], 14, 'D', 'test');
    assert(false, 'Should have thrown error for empty history');
  } catch (error) {
    assert(error.message.includes('non-empty'), 'Should mention non-empty requirement');
  }

  // Test with invalid predict periods
  try {
    await callProphetPredict([{ds: '2025-01-01', y: 100}], 0, 'D', 'test');
    assert(false, 'Should have thrown error for invalid predict periods');
  } catch (error) {
    assert(error.message.includes('between 1 and'), 'Should mention valid range');
  }

  console.log('   Error handling tests passed');
}

/**
 * Test 6: Performance Test
 */
async function testPerformance() {
  const testData = await loadTestData();
  
  const historyArray = testData.history.map(record => ({
    ds: record.ds,
    y: record.y,
    weather_score: record.weather_score || 0.5,
    transport_score: record.transport_score || 0.5,
    foot_traffic_score: record.foot_traffic_score || 0.5
  }));

  const startTime = Date.now();
  
  // Make multiple concurrent calls to test caching
  const promises = [];
  for (let i = 0; i < 3; i++) {
    promises.push(callProphetPredict(
      historyArray,
      TEST_CONFIG.predictPeriods,
      'D',
      `${TEST_CONFIG.retailerId}_perf_${i}`
    ));
  }

  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  // Validate all results
  results.forEach((result, index) => {
    assert(result.predictions.length === TEST_CONFIG.predictPeriods, 
      `Result ${index} should have correct prediction count`);
  });

  console.log(`   Processed 3 concurrent forecasts in ${totalTime}ms`);
  console.log(`   Average time per forecast: ${Math.round(totalTime / 3)}ms`);
}

/**
 * Main test execution
 */
async function main() {
  console.log('🚀 Starting Prophet Integration Tests');
  console.log('=====================================');
  
  const runner = new TestRunner();

  // Run all tests
  await runner.runTest('Prophet Wrapper Basic Call', testProphetWrapperBasic);
  await runner.runTest('Enhanced AI Service Integration', testEnhancedAIServiceIntegration);
  await runner.runTest('Model Training', testModelTraining);
  await runner.runTest('Cache Management', testCacheManagement);
  await runner.runTest('Error Handling', testErrorHandling);
  await runner.runTest('Performance Test', testPerformance);

  // Print summary
  const success = runner.printSummary();
  
  if (success) {
    console.log('\n🎉 All tests passed! Prophet integration is working correctly.');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Set timeout for the entire test suite
setTimeout(() => {
  console.error('Test suite timeout! Exiting...');
  process.exit(1);
}, TEST_CONFIG.timeoutMs);

// Run tests
main().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});