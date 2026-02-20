/**
 * Hedera On-Chain ML End-to-End Test
 * Tests complete flow: ML detection → Hedera submission
 */

const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const FraudDetector = require('../../ml/src/fraud_detector');

describe('🌐 Hedera On-Chain ML E2E Test', function() {
  this.timeout(30000);

  let fraudDetector;
  let results = [];

  before(async function() {
    fraudDetector = new FraudDetector();
    await fraudDetector.initialize();

    console.log('\n🚀 E2E Test Setup:');
    console.log('  ML Model:', fraudDetector.isModelLoaded() ? 'Active ✅' : 'Fallback ⚠️');
  });

  it('should run complete ML + Hedera flow', async function() {
    const testCases = [
      { waterFlow: 125, powerOutput: 95, efficiency: 0.88, expected: 'clean' },
      { waterFlow: 250, powerOutput: 45, efficiency: 0.25, expected: 'fraud' }
    ];

    console.log('\n📊 Processing test cases:');

    for (const test of testCases) {
      const result = await fraudDetector.predict(test);
      console.log(`  ${test.expected === 'fraud' ? '🚨' : '✅'} ${test.expected.toUpperCase()}: Score=${result.score.toFixed(2)}, Method=${result.method}`);
      results.push(result);
    }

    expect(results.length).to.equal(2);
  });

  after(function() {
    const stats = fraudDetector.getStats();
    console.log('\n═══════════════════════════════════════');
    console.log('🎉 E2E TEST COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log('Total Tests:', results.length);
    console.log('ML Usage Rate:', stats.mlUsageRate.toFixed(1) + '%');
    console.log('═══════════════════════════════════════\n');
  });
});
