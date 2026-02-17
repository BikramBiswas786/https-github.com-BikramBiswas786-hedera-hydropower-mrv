/**
 * Run E2E Test with Evidence Collection
 * Saves all transaction receipts and attestations
 */

const Workflow = require('../src/workflow');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, '..', 'evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

class EvidenceCollector {
  constructor() {
    this.evidence = {
      timestamp: new Date().toISOString(),
      projectId: 'HYDRO-PROJECT-001',
      deviceId: 'TURBINE-ALPHA',
      transactions: [],
      attestations: [],
      summary: {}
    };
  }

  addTransaction(step, txId, details) {
    this.evidence.transactions.push({
      step,
      transactionId: txId,
      timestamp: new Date().toISOString(),
      explorerUrl: `https://hashscan.io/testnet/transaction/${txId}`,
      ...details
    });
  }

  addAttestation(attestation) {
    this.evidence.attestations.push(attestation);
  }

  save() {
    const filename = `evidence-${Date.now()}.json`;
    const filepath = path.join(EVIDENCE_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(this.evidence, null, 2));
    console.log(`\n📄 Evidence saved: ${filepath}`);
    return filepath;
  }

  printSummary() {
    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 EVIDENCE SUMMARY');
    console.log('═══════════════════════════════════════════════\n');
    console.log(`Project: ${this.evidence.projectId}`);
    console.log(`Device:  ${this.evidence.deviceId}`);
    console.log(`Time:    ${this.evidence.timestamp}\n`);
    console.log('Transactions recorded:');
    this.evidence.transactions.forEach((tx, i) => {
      console.log(`  ${i + 1}. ${tx.step}`);
      console.log(`     TX: ${tx.transactionId}`);
      console.log(`     URL: ${tx.explorerUrl}`);
    });
    console.log(`\nTotal attestations: ${this.evidence.attestations.length}`);
    console.log(`Approved: ${this.evidence.attestations.filter(a => a.verificationStatus === 'APPROVED').length}`);
    console.log(`Rejected: ${this.evidence.attestations.filter(a => a.verificationStatus === 'REJECTED').length}`);
    console.log(`Flagged: ${this.evidence.attestations.filter(a => a.verificationStatus === 'FLAGGED').length}`);
  }
}

async function runWithEvidence() {
  console.log('\n🚀 RUNNING E2E TEST WITH REAL HEDERA BLOCKCHAIN\n');

  const collector = new EvidenceCollector();
  const workflow = new Workflow();

  try {
    // STEP 1: Initialize
    console.log('═══════════════════════════════════════════════');
    console.log('STEP 1: Initialize Workflow');
    console.log('═══════════════════════════════════════════════\n');

    const initResult = await workflow.initialize(
      collector.evidence.projectId,
      collector.evidence.deviceId,
      0.8
    );

    console.log('✅ Workflow initialized');
    console.log(`   Hedera connected: ${initResult.hederaConnected}`);
    if (initResult.auditTopicId) {
      console.log(`   Audit Topic: ${initResult.auditTopicId}`);
      console.log(`   Topic URL: https://hashscan.io/testnet/topic/${initResult.auditTopicId}\n`);
    }

    if (!initResult.hederaConnected) {
      console.warn('\n⚠️  Hedera not connected. Running in mock mode.');
      console.warn('   Run: node scripts/setup-hedera-testnet.js\n');
    }

    // STEP 2: Deploy DID
    console.log('═══════════════════════════════════════════════');
    console.log('STEP 2: Deploy Device DID');
    console.log('═══════════════════════════════════════════════\n');

    const didResult = await workflow.deployDeviceDID(collector.evidence.deviceId);
    console.log('✅ DID deployed');
    console.log(`   DID: ${didResult.did}`);
    console.log(`   Topic: ${didResult.topicId}\n`);

    if (didResult.topicId.startsWith('0.0.')) {
      collector.addTransaction('DID_DEPLOYMENT', didResult.topicId, {
        did: didResult.did,
        deviceId: collector.evidence.deviceId
      });
    }

    // STEP 3: Create REC Token
    console.log('═══════════════════════════════════════════════');
    console.log('STEP 3: Create REC Token');
    console.log('═══════════════════════════════════════════════\n');

    const tokenResult = await workflow.createRECToken(
      'Hydropower Renewable Energy Certificate',
      'HREC'
    );
    console.log('✅ Token created');
    console.log(`   Token ID: ${tokenResult.tokenId}`);
    console.log(`   Symbol: ${tokenResult.symbol}\n`);

    if (tokenResult.tokenId.startsWith('0.0.')) {
      collector.addTransaction('TOKEN_CREATION', tokenResult.tokenId, {
        name: tokenResult.name,
        symbol: tokenResult.symbol
      });
    }

    // STEP 4: Submit VALID telemetry
    console.log('═══════════════════════════════════════════════');
    console.log('STEP 4: Submit VALID Telemetry (APPROVED)');
    console.log('═══════════════════════════════════════════════\n');

    const validTelemetry = {
      deviceId: collector.evidence.deviceId,
      timestamp: new Date().toISOString(),
      readings: {
        flowRate_m3_per_s: 2.5,
        headHeight_m: 45,
        generatedKwh: 938.08,
        pH: 7.2,
        turbidity_ntu: 10,
        temperature_celsius: 18,
        efficiency: 0.85
      }
    };

    const validResult = await workflow.submitReading(validTelemetry);
    console.log('✅ Valid telemetry submitted');
    console.log(`   Status: ${validResult.verificationStatus}`);
    console.log(`   Trust Score: ${(validResult.trustScore * 100).toFixed(1)}%`);
    console.log(`   Attestation ID: ${validResult.attestation.id}`);
    console.log(`   Transaction: ${validResult.transactionId}\n`);

    collector.addTransaction('VALID_TELEMETRY', validResult.transactionId, {
      verificationStatus: validResult.verificationStatus,
      trustScore: validResult.trustScore,
      attestationId: validResult.attestation.id
    });
    collector.addAttestation(validResult.attestation);

    // STEP 5: Submit INVALID telemetry (physics violation)
    console.log('═══════════════════════════════════════════════');
    console.log('STEP 5: Submit INVALID Telemetry (REJECTED)');
    console.log('═══════════════════════════════════════════════\n');

    const invalidTelemetry = {
      deviceId: collector.evidence.deviceId,
      timestamp: new Date().toISOString(),
      readings: {
        flowRate_m3_per_s: 2.5,
        headHeight_m: 45,
        generatedKwh: 999999, // Physically impossible
        pH: 7.2,
        turbidity_ntu: 10,
        temperature_celsius: 18,
        efficiency: 0.85
      }
    };

    const invalidResult = await workflow.submitReading(invalidTelemetry);
    console.log('✅ Invalid telemetry submitted');
    console.log(`   Status: ${invalidResult.verificationStatus}`);
    console.log(`   Trust Score: ${(invalidResult.trustScore * 100).toFixed(1)}%`);
    console.log(`   Attestation ID: ${invalidResult.attestation.id}`);
    console.log(`   Transaction: ${invalidResult.transactionId}\n`);

    collector.addTransaction('INVALID_TELEMETRY', invalidResult.transactionId, {
      verificationStatus: invalidResult.verificationStatus,
      trustScore: invalidResult.trustScore,
      attestationId: invalidResult.attestation.id
    });
    collector.addAttestation(invalidResult.attestation);

    // STEP 6: Batch processing (10 readings)
    console.log('═══════════════════════════════════════════════');
    console.log('STEP 6: Batch Processing (10 readings)');
    console.log('═══════════════════════════════════════════════\n');

    const batchReadings = Array.from({ length: 10 }, (_, i) => ({
      deviceId: collector.evidence.deviceId,
      timestamp: new Date(Date.now() + i * 1000).toISOString(),
      readings: {
        flowRate_m3_per_s: 2.5 + (i % 3) * 0.1,
        headHeight_m: 45,
        generatedKwh: 900 + i * 5,
        pH: 7.2,
        turbidity_ntu: 10,
        temperature_celsius: 18,
        efficiency: 0.85
      }
    }));

    console.log(`Processing ${batchReadings.length} readings...\n`);

    for (const reading of batchReadings) {
      const result = await workflow.submitReading(reading);
      collector.addAttestation(result.attestation);
      collector.addTransaction(`BATCH_${batchReadings.indexOf(reading) + 1}`, result.transactionId, {
        verificationStatus: result.verificationStatus,
        trustScore: result.trustScore
      });
    }

    console.log(`✅ Batch complete: ${batchReadings.length} readings processed\n`);

    // STEP 7: Monitoring Report
    console.log('═══════════════════════════════════════════════');
    console.log('STEP 7: Generate Monitoring Report');
    console.log('═══════════════════════════════════════════════\n');

    const report = await workflow.generateMonitoringReport({
      period: {
        start: new Date(Date.now() - 86400000).toISOString(),
        end: new Date().toISOString()
      }
    });

    console.log('✅ Report generated');
    console.log(`   Total Readings: ${report.totalReadings}`);
    console.log(`   Approved: ${report.approvedReadings}`);
    console.log(`   Rejected: ${report.rejectedReadings}`);
    console.log(`   Flagged: ${report.flaggedReadings}`);
    console.log(`   Avg Trust Score: ${(report.averageTrustScore * 100).toFixed(1)}%\n`);

    collector.evidence.summary = report;

    // Print and save evidence
    collector.printSummary();
    const evidencePath = collector.save();

    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 E2E TEST COMPLETE!');
    console.log('═══════════════════════════════════════════════\n');
    console.log('Evidence file:', evidencePath);
    console.log('\nView transactions on Hedera Explorer:');
    collector.evidence.transactions.forEach(tx => {
      console.log(`  ${tx.explorerUrl}`);
    });
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await workflow.cleanup();
  }
}

if (require.main === module) {
  runWithEvidence().catch(console.error);
}

module.exports = { runWithEvidence };
