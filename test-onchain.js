// test-onchain.js - Complete On-Chain Production Test
require('dotenv').config();
const Workflow = require('./src/workflow');

async function runOnChainTest() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║  🚀 HEDERA TESTNET - FULL ON-CHAIN PRODUCTION TEST      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const workflow = new Workflow({
    autoApproveThreshold: 0.85,
    manualReviewThreshold: 0.50,
    deviceProfile: {
      capacity: 10000,
      maxFlow: 20,
      maxHead: 500,
      minEfficiency: 0.70
    }
  });

  try {
    // Step 1: Initialize
    console.log('📋 Step 1: Initializing project on Hedera Testnet...');
    await workflow.initialize('ONCHAIN-PROD-001', 'TURBINE-PROD-001', 0.82);
    console.log('✅ Project initialized\n');

    // Step 2: Submit 5 readings with varying data
    console.log('📊 Step 2: Submitting 5 telemetry readings...');
    
    const readings = [
      { flow: 10.0, head: 45, kwh: 3500, ph: 7.1, turbidity: 8 },
      { flow: 12.0, head: 50, kwh: 5000, ph: 7.0, turbidity: 10 },
      { flow: 8.0, head: 40, kwh: 2500, ph: 7.2, turbidity: 12 },
      { flow: 11.0, head: 48, kwh: 4200, ph: 6.9, turbidity: 9 },
      { flow: 9.5, head: 46, kwh: 3800, ph: 7.1, turbidity: 11 }
    ];

    const results = [];
    for (let i = 0; i < readings.length; i++) {
      const r = readings[i];
      console.log(`  Reading ${i + 1}/5: ${r.kwh} kWh (flow: ${r.flow} m³/s, head: ${r.head}m)`);
      
      const result = await workflow.submitReading({
        timestamp: new Date(Date.now() + i * 60000).toISOString(),
        flowRate_m3_per_s: r.flow,
        headHeight_m: r.head,
        generatedKwh: r.kwh,
        pH: r.ph,
        turbidity_ntu: r.turbidity,
        temperature_celsius: 18
      });

      results.push(result);
      console.log(`    ✅ Status: ${result.verificationStatus} | Trust: ${result.trustScore.toFixed(2)} | Credits: ${result.carbonCredits?.amount || 0} tCO2e`);
    }
    console.log('');

    // Step 3: Generate monitoring report
    console.log('📄 Step 3: Generating ACM0002 monitoring report...');
    const report = await workflow.generateMonitoringReport();
    console.log('✅ Report generated\n');

    // Step 4: Display summary
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  📊 FINAL SUMMARY                                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    const approved = results.filter(r => r.verificationStatus === 'APPROVED').length;
    const totalCredits = results.reduce((sum, r) => sum + (r.carbonCredits?.amount || 0), 0);
    const totalGeneration = readings.reduce((sum, r) => sum + r.kwh, 0);

    console.log(`  Readings Submitted:    ${results.length}`);
    console.log(`  Approved:              ${approved}`);
    console.log(`  Total Generation:      ${(totalGeneration / 1000).toFixed(2)} MWh`);
    console.log(`  Total Carbon Credits:  ${totalCredits.toFixed(3)} tCO2e`);
    console.log(`  ACM0002 Compliant:     ${report.acm0002Report.verified ? 'YES ✅' : 'NO ❌'}`);
    console.log(`  Methodology:           ${report.acm0002Report.methodology}`);
    console.log(`  Certification Ready:   ${report.acm0002Report.certificationReady ? 'YES ✅' : 'NO ❌'}\n`);

    console.log('🔗 Hedera Testnet Links:');
    console.log(`  Account:      https://hashscan.io/testnet/account/${process.env.HEDERA_ACCOUNT_ID}`);
    console.log(`  Audit Topic:  https://hashscan.io/testnet/topic/${process.env.AUDIT_TOPIC_ID}`);
    console.log(`  DID Topic:    https://hashscan.io/testnet/topic/${process.env.DID_TOPIC_ID}`);
    console.log(`  Carbon Token: https://hashscan.io/testnet/token/${process.env.CARBON_TOKEN_ID}\n`);

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ON-CHAIN TEST COMPLETED SUCCESSFULLY                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    await workflow.cleanup();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    await workflow.cleanup();
    process.exit(1);
  }
}

runOnChainTest();

