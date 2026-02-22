// scripts/test-onchain-full.js
// Full A-Z on-chain integration test

const {
  Client, PrivateKey, AccountId, TopicId, TokenId,
  TopicMessageSubmitTransaction,
  TokenMintTransaction,
  TopicMessageQuery,
  Hbar
} = require('@hashgraph/sdk');
const { EngineV1 } = require('../src/engine/v1/engine-v1');
require('dotenv').config();

async function fullOnChainTest() {
  const operatorId  = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);
  const client      = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  client.setDefaultMaxTransactionFee(new Hbar(10));

  const results = {};

  console.log('\n🔗 ═══ FULL ON-CHAIN TESTNET AUDIT ═══\n');

  // ── TEST 1: HCS Audit Attestation ────────────────────────────
  console.log('1️⃣  TELEMETRY ATTESTATION (HCS)...');
  const engine = new EngineV1();
  const telemetry = {
    deviceId: 'TURBINE-TEST-001',
    timestamp: new Date().toISOString(),
    readings: {
      flowRate_m3_per_s: 2.5,
      headHeight_m: 45,
      generatedKwh: 156,
      pH: 7.2,
      turbidity_ntu: 12,
      temperature_celsius: 18
    }
  };
  const result1 = await engine.verifyAndPublish(telemetry);
  console.log(`   Status:    ${result1.attestation.verificationStatus}`);
  console.log(`   Trust:     ${(result1.attestation.trustScore * 100).toFixed(1)}%`);
  console.log(`   TX:        ${result1.transactionId}`);
  console.log(`   HCS:       ${result1.status}`);
  results.attestation = result1;

  // ── TEST 2: DID Registration (HCS) ──────────────────────────
  console.log('\n2️⃣  DID REGISTRATION (HCS)...');
  const didDoc = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: `did:hedera:testnet:${operatorId}_${Date.now()}`,
    controller: operatorId.toString(),
    verificationMethod: [{
      id: '#key-1',
      type: 'Ed25519VerificationKey2018',
      publicKeyBase58: operatorKey.publicKey.toStringRaw()
    }],
    service: [{
      id: '#mrv-plant',
      type: 'MRVHydropowerPlant',
      serviceEndpoint: 'https://hydropower-mrv-19feb26.vercel.app'
    }]
  };
  const didTopicId = process.env.DID_TOPIC_ID;
  if (didTopicId) {
    const didTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(didTopicId))
      .setMessage(Buffer.from(JSON.stringify(didDoc)))
      .freezeWith(client)
      .sign(operatorKey);
    const didResp = await didTx.execute(client);
    const didReceipt = await didResp.getReceipt(client);
    console.log(`   DID:       ${didDoc.id}`);
    console.log(`   TX:        ${didResp.transactionId.toString()}`);
    console.log(`   Status:    ${didReceipt.status.toString()}`);
    results.did = { id: didDoc.id, tx: didResp.transactionId.toString() };
  } else {
    console.log('   ⚠️  DID_TOPIC_ID not set, skipping');
  }

  // ── TEST 3: Carbon Credit Token Mint (HTS) ──────────────────
  console.log('\n3️⃣  CARBON CREDIT MINTING (HTS)...');
  const carbonTokenId = process.env.CARBON_TOKEN_ID;
  if (carbonTokenId) {
    const erTCO2 = result1.attestation.calculations.ER_tCO2;
    const mintAmount = Math.round(erTCO2 * 1_000_000); // 6 decimals
    const mintTx = await new TokenMintTransaction()
      .setTokenId(TokenId.fromString(carbonTokenId))
      .setAmount(mintAmount)
      .freezeWith(client)
      .sign(operatorKey);
    const mintResp = await mintTx.execute(client);
    const mintReceipt = await mintResp.getReceipt(client);
    console.log(`   Amount:    ${erTCO2} tCO2 (${mintAmount} micro-units)`);
    console.log(`   Token:     ${carbonTokenId}`);
    console.log(`   TX:        ${mintResp.transactionId.toString()}`);
    console.log(`   Status:    ${mintReceipt.status.toString()}`);
    results.carbonMint = { amount: erTCO2, tx: mintResp.transactionId.toString() };
  } else {
    console.log('   ⚠️  CARBON_TOKEN_ID not set, skipping');
  }

  // ── TEST 4: REC NFT Mint (HTS) ──────────────────────────────
  console.log('\n4️⃣  REC NFT MINTING (HTS)...');
  const recTokenId = process.env.REC_TOKEN_ID;
  if (recTokenId) {
    const recMetadata = JSON.stringify({
      type: 'RenewableEnergyCertificate',
      plant: 'HYDRO-PLANT-001',
      period: new Date().toISOString().slice(0, 10),
      generatedMWh: (telemetry.readings.generatedKwh / 1000).toFixed(6),
      verificationTx: result1.transactionId,
      trustScore: result1.attestation.trustScore,
      standard: 'ACM0002'
    });
    const recMintTx = await new TokenMintTransaction()
      .setTokenId(TokenId.fromString(recTokenId))
      .addMetadata(Buffer.from(recMetadata))
      .freezeWith(client)
      .sign(operatorKey);
    const recResp = await recMintTx.execute(client);
    const recReceipt = await recResp.getReceipt(client);
    console.log(`   NFT Serial: #${recReceipt.serials[0].toString()}`);
    console.log(`   Token:      ${recTokenId}`);
    console.log(`   TX:         ${recResp.transactionId.toString()}`);
    console.log(`   Status:     ${recReceipt.status.toString()}`);
    results.recMint = { serial: recReceipt.serials[0].toString(), tx: recResp.transactionId.toString() };
  } else {
    console.log('   ⚠️  REC_TOKEN_ID not set, skipping');
  }

  // ── TEST 5: Verification Log (HCS) ──────────────────────────
  console.log('\n5️⃣  VERIFICATION LOG (HCS)...');
  const verifyTopicId = process.env.VERIFY_TOPIC_ID;
  if (verifyTopicId) {
    const verifyLog = {
      type: 'VERIFICATION_COMPLETE',
      timestamp: new Date().toISOString(),
      device: telemetry.deviceId,
      trustScore: result1.attestation.trustScore,
      decision: result1.attestation.verificationStatus,
      mlAlgorithm: 'IsolationForest',
      checks: {
        physics: result1.attestation.checks.physics.status,
        temporal: result1.attestation.checks.temporal.status,
        environmental: result1.attestation.checks.environmental.status,
        statistical: result1.attestation.checks.statistical.status,
        consistency: result1.attestation.checks.consistency.status
      },
      attestationTx: result1.transactionId,
      carbonTx: results.carbonMint?.tx || null,
      recTx: results.recMint?.tx || null
    };
    const verifyTx = await new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(verifyTopicId))
      .setMessage(Buffer.from(JSON.stringify(verifyLog)))
      .freezeWith(client)
      .sign(operatorKey);
    const verifyResp = await verifyTx.execute(client);
    const verifyReceipt = await verifyResp.getReceipt(client);
    console.log(`   TX:        ${verifyResp.transactionId.toString()}`);
    console.log(`   Status:    ${verifyReceipt.status.toString()}`);
    results.verificationLog = { tx: verifyResp.transactionId.toString() };
  }

  // ── FINAL SUMMARY ────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  🎉 ON-CHAIN TESTNET AUDIT COMPLETE!         ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log('All Transaction IDs (verify on HashScan):');
  console.log(`  1. Attestation: ${results.attestation?.transactionId}`);
  console.log(`  2. DID:         ${results.did?.tx || 'skipped'}`);
  console.log(`  3. Carbon Mint: ${results.carbonMint?.tx || 'skipped'}`);
  console.log(`  4. REC NFT:     ${results.recMint?.tx || 'skipped'}`);
  console.log(`  5. Verify Log:  ${results.verificationLog?.tx || 'skipped'}`);
  console.log(`\nHashScan: https://hashscan.io/testnet/account/${operatorId}`);

  await client.close();
}

fullOnChainTest().catch(console.error);
