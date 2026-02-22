// scripts/setup-testnet.js
// Creates ALL on-chain resources for the MRV system on Hedera Testnet

const {
  Client, PrivateKey, AccountId,
  TopicCreateTransaction,
  TokenCreateTransaction,
  TokenType, TokenSupplyType,
  Hbar
} = require('@hashgraph/sdk');
require('dotenv').config();

async function setupTestnet() {
  const operatorId  = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  client.setDefaultMaxTransactionFee(new Hbar(100));

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  HEDERA TESTNET SETUP - MRV SYSTEM       ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log(`Operator: ${operatorId}\n`);

  // ─── 1. AUDIT TOPIC (HCS) ─────────────────────────────────────
  console.log('1️⃣  Creating AUDIT TOPIC (HCS)...');
  const auditTx = await new TopicCreateTransaction()
    .setTopicMemo('MRV Audit Trail - Hydropower Telemetry Attestations')
    .setSubmitKey(operatorKey.publicKey)
    .execute(client);
  const auditReceipt = await auditTx.getReceipt(client);
  const auditTopicId = auditReceipt.topicId.toString();
  console.log(`   ✅ AUDIT_TOPIC_ID=${auditTopicId}\n`);

  // ─── 2. DID TOPIC (HCS) ───────────────────────────────────────
  console.log('2️⃣  Creating DID TOPIC (HCS) for Decentralized Identity...');
  const didTx = await new TopicCreateTransaction()
    .setTopicMemo('MRV DID Registry - Plant & Device Identities')
    .setSubmitKey(operatorKey.publicKey)
    .execute(client);
  const didReceipt = await didTx.getReceipt(client);
  const didTopicId = didReceipt.topicId.toString();
  console.log(`   ✅ DID_TOPIC_ID=${didTopicId}\n`);

  // ─── 3. CARBON CREDIT TOKEN (HTS - Fungible) ──────────────────
  console.log('3️⃣  Creating CARBON CREDIT TOKEN (HTS)...');
  const carbonTx = await new TokenCreateTransaction()
    .setTokenName('MRV Carbon Credit')
    .setTokenSymbol('MRVCC')
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(6)
    .setInitialSupply(0)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(operatorKey.publicKey)
    .setTreasuryAccountId(operatorId)
    .setTokenMemo('ACM0002 Verified Carbon Credits - tCO2 equivalent')
    .setAdminKey(operatorKey.publicKey)
    .setFreezeKey(operatorKey.publicKey)
    .setWipeKey(operatorKey.publicKey)
    .execute(client);
  const carbonReceipt = await carbonTx.getReceipt(client);
  const carbonTokenId = carbonReceipt.tokenId.toString();
  console.log(`   ✅ CARBON_TOKEN_ID=${carbonTokenId}\n`);

  // ─── 4. REC TOKEN (HTS - NFT) ─────────────────────────────────
  console.log('4️⃣  Creating REC TOKEN (HTS NFT)...');
  const recTx = await new TokenCreateTransaction()
    .setTokenName('MRV Renewable Energy Certificate')
    .setTokenSymbol('MRVREC')
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Infinite)
    .setSupplyKey(operatorKey.publicKey)
    .setTreasuryAccountId(operatorId)
    .setTokenMemo('Hedera-verified RECs for hydropower generation')
    .setAdminKey(operatorKey.publicKey)
    .setFreezeKey(operatorKey.publicKey)
    .setWipeKey(operatorKey.publicKey)
    .execute(client);
  const recReceipt = await recTx.getReceipt(client);
  const recTokenId = recReceipt.tokenId.toString();
  console.log(`   ✅ REC_TOKEN_ID=${recTokenId}\n`);

  // ─── 5. VERIFICATION LOG TOPIC (HCS) ──────────────────────────
  console.log('5️⃣  Creating VERIFICATION LOG TOPIC (HCS)...');
  const verifyTx = await new TopicCreateTransaction()
    .setTopicMemo('MRV Verification Logs - ML & Physics Check Results')
    .setSubmitKey(operatorKey.publicKey)
    .execute(client);
  const verifyReceipt = await verifyTx.getReceipt(client);
  const verifyTopicId = verifyReceipt.topicId.toString();
  console.log(`   ✅ VERIFY_TOPIC_ID=${verifyTopicId}\n`);

  // ─── SUMMARY ───────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  ALL ON-CHAIN RESOURCES CREATED! ✅      ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log('Add these to your .env file:\n');
  console.log(`AUDIT_TOPIC_ID=${auditTopicId}`);
  console.log(`DID_TOPIC_ID=${didTopicId}`);
  console.log(`CARBON_TOKEN_ID=${carbonTokenId}`);
  console.log(`REC_TOKEN_ID=${recTokenId}`);
  console.log(`VERIFY_TOPIC_ID=${verifyTopicId}`);
  console.log(`\nView on HashScan:`);
  console.log(`  Audit:  https://hashscan.io/testnet/topic/${auditTopicId}`);
  console.log(`  DID:    https://hashscan.io/testnet/topic/${didTopicId}`);
  console.log(`  Carbon: https://hashscan.io/testnet/token/${carbonTokenId}`);
  console.log(`  REC:    https://hashscan.io/testnet/token/${recTokenId}`);
  console.log(`  Verify: https://hashscan.io/testnet/topic/${verifyTopicId}`);

  await client.close();
}

setupTestnet().catch(console.error);
