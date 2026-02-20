/**
 * Hedera On-Chain ML Integration Test
 */
const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const FraudDetector = require('../../ml/src/fraud_detector');
describe('🔗 Hedera ML Integration Test', function() {
  this.timeout(30000);
  let fraudDetector;
  let testResults = [];
  before(async function() {
    fraudDetector = new FraudDetector();
    await fraudDetector.initialize();
    console.log('\n📊 Test Setup:');
    console.log('  ML Model:', fraudDetector.isModelLoaded() ? 'Loaded ✅' : 'Fallback ⚠️');
  });
  it('should detect normal reading as NOT FRAUD', async function() {
    const reading = {
      plantId: 'PLANT_001',
      waterFlow: 125.0,
      powerOutput: 95.0,
      efficiency: 0.88
    };
    const result = await fraudDetector.predict(reading);
    console.log('\n🧪 Normal Reading:');
    console.log('  Fraud:', result.isFraud);
    console.log('  Score:', result.score.toFixed(2));
    console.log('  Method:', result.method);
    expect(result.isFraud).to.be.false;
    expect(result.method).to.equal('ML_ISOLATION_FOREST');
    testResults.push({ reading, result, expected: 'normal' });
  });
  it('should detect fraud reading as FRAUD', async function() {
    const reading = {
      plantId: 'PLANT_001',
      waterFlow: 250.0,
      powerOutput: 45.0,
      efficiency: 0.25
    };
    const result = await fraudDetector.predict(reading);
    console.log('\n🚨 Fraud Reading:');
    console.log('  Fraud:', result.isFraud);
    console.log('  Score:', result.score.toFixed(2));
    console.log('  Method:', result.method);
    expect(result.isFraud).to.be.true;
    expect(result.method).to.equal('ML_ISOLATION_FOREST');
    testResults.push({ reading, result, expected: 'fraud' });
  });
  it('should process batch of readings', async function() {
    const readings = [
      { waterFlow: 130, powerOutput: 98, efficiency: 0.91 },
      { waterFlow: 220, powerOutput: 50, efficiency: 0.30 },
      { waterFlow: 125, powerOutput: 95, efficiency: 0.88 }
    ];
    console.log('\n📊 Batch Processing:');
    for (let i = 0; i < readings.length; i++) {
      const result = await fraudDetector.predict(readings[i]);
      console.log('  ' + (i+1) + '. ' + (result.isFraud ? '🚨 FRAUD' : '✅ CLEAN') + ' (score: ' + result.score.toFixed(2) + ')');
      testResults.push({ reading: readings[i], result });
    }
    expect(testResults.length).to.be.greaterThan(0);
  });
  after(function() {
    const stats = fraudDetector.getStats();
    console.log('\n═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('ML Model Status:', stats.modelLoaded ? 'Active ✅' : 'Fallback ⚠️');
    console.log('Total Predictions:', stats.totalPredictions);
    console.log('ML Usage Rate:', stats.mlUsageRate.toFixed(1) + '%');
    console.log('Tests Processed:', testResults.length);
    console.log('═══════════════════════════════════════\n');
  });
});
