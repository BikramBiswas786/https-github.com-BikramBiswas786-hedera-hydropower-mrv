#!/usr/bin/env node
/**
 * Test ML Inference - Quick Verification Script
 * 
 * Run this to verify ML integration is working
 */

const MLDetector = require('../src/ml-detector');
const fs = require('fs');

async function main() {
  console.log('=== ML Inference Test ===\n');

  const detector = new MLDetector();
  const stats = detector.getStats();

  console.log('📊 Initial Stats:');
  console.log(`  Model loaded: ${stats.modelLoaded}`);
  console.log(`  Model path: ${stats.modelPath}`);
  console.log('');

  // Test 1: Normal reading
  console.log('🧪 Testing NORMAL reading...');
  const normalReading = {
    flowRate: 2.5,
    head: 45,
    generatedKwh: 900,
    pH: 7.2,
    turbidity: 10,
    temperature: 18
  };

  const normalHistory = [
    { generatedKwh: 850 },
    { generatedKwh: 870 },
    { generatedKwh: 890 },
    { generatedKwh: 910 },
    { generatedKwh: 880 }
  ];

  const normalResult = await detector.predict(normalReading, normalHistory);
  console.log(`  Result: ${normalResult.isAnomaly ? '❌ FRAUD' : '✅ NOT FRAUD'}`);
  console.log(`  Score: ${normalResult.score.toFixed(2)}`);
  console.log(`  Confidence: ${normalResult.confidence.toFixed(2)}`);
  console.log(`  Method: ${normalResult.method}`);
  console.log('');

  // Test 2: Fraud reading
  console.log('🚨 Testing FRAUD reading...');
  const fraudReading = {
    flowRate: 2.5,
    head: 45,
    generatedKwh: 50000,  // Obviously fraudulent
    pH: 7.2,
    turbidity: 10,
    temperature: 18
  };

  const fraudResult = await detector.predict(fraudReading, normalHistory);
  console.log(`  Result: ${fraudResult.isAnomaly ? '✅ FRAUD DETECTED' : '❌ MISSED'}`);
  console.log(`  Score: ${fraudResult.score.toFixed(2)}`);
  console.log(`  Confidence: ${fraudResult.confidence.toFixed(2)}`);
  console.log(`  Method: ${fraudResult.method}`);
  console.log('');

  // Final stats
  const finalStats = detector.getStats();
  console.log('📊 Final Stats:');
  console.log(`  Total predictions: ${finalStats.totalPredictions}`);
  console.log(`  ML predictions: ${finalStats.mlPredictions}`);
  console.log(`  Fallback predictions: ${finalStats.fallbackPredictions}`);
  console.log(`  ML usage rate: ${finalStats.mlUsageRate}`);
  console.log('');

  // Verdict
  if (normalResult.isAnomaly === false && fraudResult.isAnomaly === true) {
    console.log('✅ ML INTEGRATION WORKING CORRECTLY');
  } else {
    console.log('⚠️ ML RESULTS UNEXPECTED');
    console.log('   This is OK if using rule-based fallback');
    console.log('   Train the model first: python3 ml/scripts/train.py');
  }
}

main().catch(console.error);
