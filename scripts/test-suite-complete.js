#!/usr/bin/env node
/**
 * HEDERA HYDROPOWER dMRV - COMPLETE 6-TEST SUITE
 * Node.js version with pretty formatting matching PowerShell output
 * 
 * Run: node scripts/test-suite-complete.js
 * 
 * Prerequisites:
 * - API server running on http://localhost:3000
 * - Valid Hedera credentials in .env
 * - Environment: HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY, AUDIT_TOPIC_ID
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1/telemetry';
const API_KEY = 'demokey001';

const testResults = [];

function addTestResult(name, result) {
  testResults.push({ test: name, result });
}

function getEpochMs() {
  return Date.now();
}

function randomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  HEDERA HYDROPOWER dMRV - COMPLETE TEST SUITE        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // ========== TEST 1: Valid APPROVED Telemetry ==========
  console.log('[TEST 1] Valid APPROVED Telemetry');
  try {
    const resp = await axios.post(API_URL, {
      plant_id: 'PLANT-ALPHA',
      device_id: `TURBINE-TEST-${randomId()}`,
      readings: {
        timestamp: getEpochMs(),
        flowRate: 2.5,
        head: 45,
        generatedKwh: 900,
        pH: 7.2,
        turbidity: 10,
        temperature: 18,
        efficiency: 0.85
      }
    }, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });

    const { status, trust_score, reading_id, verification_details, carbon_credits, hedera } = resp.data;

    console.log(`  Status: ${status}`);
    console.log(`  Trust Score: ${trust_score}`);
    console.log(`  Reading ID: ${reading_id}`);
    console.log(`  Physics Check: ${verification_details.physics_check}`);
    console.log(`  Environmental Check: ${verification_details.environmental_check}`);
    console.log(`  Carbon Credits: ${carbon_credits.amount_tco2e} tCO2e`);
    console.log(`  Transaction: ${hedera.transaction_id}`);
    console.log(`  HashScan: ${hedera.hashscan_url}\n`);

    if (status === 'APPROVED' && trust_score > 0.9) {
      console.log('  TEST 1 PASSED\n');
      addTestResult('TEST 1', 'PASSED');
    } else {
      console.log('  TEST 1 FAILED\n');
      addTestResult('TEST 1', 'FAILED');
    }
  } catch (err) {
    console.log(`  [ERROR] TEST 1 ERROR: ${err.message}\n`);
    addTestResult('TEST 1', 'ERROR');
  }

  // ========== TEST 2: Fraud Detection ==========
  console.log('[TEST 2] Fraud Detection - Inflated Power (45000 kWh)');
  try {
    const resp = await axios.post(API_URL, {
      plant_id: 'PLANT-ALPHA',
      device_id: `TURBINE-FRAUD-${randomId()}`,
      readings: {
        timestamp: getEpochMs(),
        flowRate: 2.5,
        head: 45,
        generatedKwh: 45000,
        efficiency: 0.85
      }
    }, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });

    const { status, trust_score, verification_details, hedera } = resp.data;

    console.log(`  Status: ${status}`);
    console.log(`  Trust Score: ${trust_score}`);
    console.log(`  Physics Check: ${verification_details.physics_check}`);
    console.log(`  Flags: ${verification_details.flags.join(', ')}`);
    console.log(`  Transaction: ${hedera.transaction_id}\n`);

    if (status === 'FLAGGED' && trust_score < 0.7) {
      console.log('  TEST 2 PASSED - Fraud detected\n');
      addTestResult('TEST 2', 'PASSED');
    } else {
      console.log('  TEST 2 FAILED - Fraud not detected\n');
      addTestResult('TEST 2', 'FAILED');
    }
  } catch (err) {
    console.log(`  [ERROR] TEST 2 ERROR: ${err.message}\n`);
    addTestResult('TEST 2', 'ERROR');
  }

  // ========== TEST 3: Environmental Violation ==========
  console.log('[TEST 3] Environmental Violation Detection');
  try {
    const resp = await axios.post(API_URL, {
      plant_id: 'PLANT-ALPHA',
      device_id: `TURBINE-ENV-${randomId()}`,
      readings: {
        timestamp: getEpochMs(),
        flowRate: 2.5,
        head: 45,
        generatedKwh: 900,
        pH: 4.5,
        turbidity: 180,
        temperature: 35,
        efficiency: 0.85
      }
    }, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });

    const { status, trust_score, verification_details } = resp.data;

    console.log(`  Status: ${status}`);
    console.log(`  Trust Score: ${trust_score}`);
    console.log(`  Environmental Check: ${verification_details.environmental_check}`);
    console.log(`  Flags: ${verification_details.flags.join(', ')}\n`);

    if (status === 'FLAGGED' && verification_details.environmental_check === 'FAIL') {
      console.log('  TEST 3 PASSED - Environmental violation detected\n');
      addTestResult('TEST 3', 'PASSED');
    } else {
      console.log('  TEST 3 FAILED - Environmental violation not detected\n');
      addTestResult('TEST 3', 'FAILED');
    }
  } catch (err) {
    console.log(`  [ERROR] TEST 3 ERROR: ${err.message}\n`);
    addTestResult('TEST 3', 'ERROR');
  }

  // ========== TEST 4: Zero-Flow Fraud ==========
  console.log('[TEST 4] Zero-Flow Fraud Detection');
  try {
    const resp = await axios.post(API_URL, {
      plant_id: 'PLANT-ALPHA',
      device_id: `TURBINE-ZEROFLOW-${randomId()}`,
      readings: {
        timestamp: getEpochMs(),
        flowRate: 0,
        head: 45,
        generatedKwh: 500,
        pH: 7.1,
        turbidity: 12,
        temperature: 18,
        efficiency: 0.85
      }
    }, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });

    const { status, trust_score, verification_details } = resp.data;

    console.log(`  Status: ${status}`);
    console.log(`  Trust Score: ${trust_score}`);
    console.log(`  Physics Check: ${verification_details.physics_check}`);
    console.log(`  Flags: ${verification_details.flags.join(', ')}\n`);

    if (status === 'REJECTED' || trust_score < 0.5) {
      console.log('  TEST 4 PASSED - Zero-flow fraud rejected\n');
      addTestResult('TEST 4', 'PASSED');
    } else {
      console.log('  TEST 4 FAILED - Zero-flow fraud not rejected\n');
      addTestResult('TEST 4', 'FAILED');
    }
  } catch (err) {
    console.log(`  API Response: ${err.message}\n`);
    if (err.response && err.response.status === 400) {
      console.log('  TEST 4 PASSED - Zero-flow fraud blocked\n');
      addTestResult('TEST 4', 'PASSED');
    } else {
      console.log('  TEST 4 ERROR - Unexpected error\n');
      addTestResult('TEST 4', 'ERROR');
    }
  }

  // ========== TEST 5: Multi-Plant Isolation ==========
  console.log('[TEST 5] Multi-Plant Isolation');
  try {
    const alphaResp = await axios.post(API_URL, {
      plant_id: 'PLANT-ALPHA',
      device_id: `TURBINE-ALPHA-${randomId()}`,
      readings: {
        timestamp: getEpochMs(),
        flowRate: 2.0,
        head: 40,
        generatedKwh: 700,
        pH: 7.0,
        turbidity: 15,
        temperature: 19,
        efficiency: 0.85
      }
    }, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });

    const betaResp = await axios.post(API_URL, {
      plant_id: 'PLANT-BETA',
      device_id: `TURBINE-BETA-${randomId()}`,
      readings: {
        timestamp: getEpochMs(),
        flowRate: 3.0,
        head: 35,
        generatedKwh: 800,
        pH: 7.3,
        turbidity: 20,
        temperature: 20,
        efficiency: 0.86
      }
    }, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });

    const alphaTx = alphaResp.data.hedera.transaction_id;
    const betaTx = betaResp.data.hedera.transaction_id;

    console.log(`  PLANT-ALPHA TX: ${alphaTx}`);
    console.log(`  PLANT-BETA TX:  ${betaTx}\n`);

    if (alphaTx !== betaTx) {
      console.log('  TEST 5 PASSED - Multi-plant isolation verified\n');
      addTestResult('TEST 5', 'PASSED');
    } else {
      console.log('  TEST 5 FAILED - Transaction IDs should differ\n');
      addTestResult('TEST 5', 'FAILED');
    }
  } catch (err) {
    console.log(`  [ERROR] TEST 5 ERROR: ${err.message}\n`);
    addTestResult('TEST 5', 'ERROR');
  }

  // ========== TEST 6: Replay Protection ==========
  console.log('[TEST 6] Replay Attack Prevention');
  const fixedTs = getEpochMs();

  const replayPayload = {
    plant_id: 'PLANT-ALPHA',
    device_id: 'TURBINE-REPLAY-001',
    readings: {
      timestamp: fixedTs,
      flowRate: 2.5,
      head: 45,
      generatedKwh: 900,
      pH: 7.2,
      turbidity: 10,
      temperature: 18,
      efficiency: 0.85
    }
  };

  try {
    const first = await axios.post(API_URL, replayPayload, {
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });
    console.log(`  First submission: ${first.data.status}`);

    // Wait 100ms then replay
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const second = await axios.post(API_URL, replayPayload, {
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
      });
      console.log('  Second submission: Unexpectedly succeeded\n');
      console.log('  TEST 6 FAILED - Replay attack not blocked\n');
      addTestResult('TEST 6', 'FAILED');
    } catch (replayErr) {
      console.log('  Second submission: Blocked (expected)\n');
      console.log('  TEST 6 PASSED - Replay protection working\n');
      addTestResult('TEST 6', 'PASSED');
    }
  } catch (err) {
    console.log(`  [ERROR] TEST 6 ERROR on first submit: ${err.message}\n`);
    addTestResult('TEST 6', 'ERROR');
  }

  // ========== SUMMARY ==========
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║              TESTING COMPLETE                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const passedCount = testResults.filter(r => r.result === 'PASSED').length;
  const totalTests = testResults.length;

  console.log('Test Results:');
  testResults.forEach(r => {
    const icon = r.result === 'PASSED' ? '✓' : r.result === 'FAILED' ? '✗' : '⚠';
    console.log(`  ${icon} ${r.test}: ${r.result}`);
  });

  console.log(`\nSummary: ${passedCount}/${totalTests} tests passed\n`);

  if (passedCount === totalTests && totalTests > 0) {
    console.log('✓ ALL TESTS PASSED - PRODUCTION READY!\n');
    process.exit(0);
  } else if (totalTests === 0) {
    console.log('⚠ NO TESTS RUN - CHECK API SERVER\n');
    process.exit(1);
  } else {
    console.log('✗ SOME TESTS FAILED - REVIEW RESULTS ABOVE\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('\n[FATAL ERROR]', err.message);
  process.exit(1);
});
