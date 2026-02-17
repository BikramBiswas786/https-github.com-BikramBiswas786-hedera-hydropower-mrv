/**
 * Hedera Testnet Setup Script
 * Creates account, topic, and generates .env file
 */

const { Client, AccountCreateTransaction, TopicCreateTransaction, PrivateKey, Hbar } = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');

async function setupHederaTestnet() {
  console.log('\n🚀 HEDERA TESTNET SETUP\n');
  console.log('This will create:');
  console.log('  1. Hedera testnet account (using Portal faucet)');
  console.log('  2. HCS audit topic');
  console.log('  3. .env file with credentials\n');

  // Step 1: Guide user to get testnet account
  console.log('═══════════════════════════════════════════════');
  console.log('STEP 1: Get Hedera Testnet Account');
  console.log('═══════════════════════════════════════════════\n');
  console.log('Go to: https://portal.hedera.com/register');
  console.log('1. Create free account');
  console.log('2. Go to "Testnet" tab');
  console.log('3. Copy your Account ID (e.g., 0.0.1234567)');
  console.log('4. Copy your Private Key (starts with 302e...)');
  console.log('\nPaste your credentials below:\n');

  // Read from stdin
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => {
    readline.question(prompt, resolve);
  });

  const accountId = await question('Enter Account ID (0.0.xxxxx): ');
  const privateKey = await question('Enter Private Key (hex): ');

  readline.close();

  if (!accountId || !privateKey) {
    console.error('\n❌ Account ID and Private Key required!');
    process.exit(1);
  }

  console.log('\n✅ Credentials received\n');

  // Step 2: Initialize client
  console.log('═══════════════════════════════════════════════');
  console.log('STEP 2: Connect to Hedera Testnet');
  console.log('═══════════════════════════════════════════════\n');

  let client, operatorKey;
  try {
    operatorKey = PrivateKey.fromString(privateKey);
    client = Client.forTestnet();
    client.setOperator(accountId, operatorKey);
    client.setDefaultMaxTransactionFee(new Hbar(2));
    console.log('✅ Connected to Hedera testnet');
    console.log(`   Account: ${accountId}\n`);
  } catch (error) {
    console.error('\n❌ Failed to connect:', error.message);
    process.exit(1);
  }

  // Step 3: Create audit topic
  console.log('═══════════════════════════════════════════════');
  console.log('STEP 3: Create HCS Audit Topic');
  console.log('═══════════════════════════════════════════════\n');

  let auditTopicId;
  try {
    const topicTx = await new TopicCreateTransaction()
      .setTopicMemo('Hydropower MRV Audit Trail - Production')
      .setSubmitKey(operatorKey)
      .execute(client);

    const receipt = await topicTx.getReceipt(client);
    auditTopicId = receipt.topicId.toString();

    console.log('✅ HCS Topic created');
    console.log(`   Topic ID: ${auditTopicId}`);
    console.log(`   Transaction: ${topicTx.transactionId.toString()}`);
    console.log(`   Explorer: https://hashscan.io/testnet/topic/${auditTopicId}\n`);
  } catch (error) {
    console.error('\n❌ Topic creation failed:', error.message);
    await client.close();
    process.exit(1);
  }

  // Step 4: Generate .env file
  console.log('═══════════════════════════════════════════════');
  console.log('STEP 4: Generate .env File');
  console.log('═══════════════════════════════════════════════\n');

  const envContent = `# Hedera Testnet Credentials - Generated ${new Date().toISOString()}
HEDERA_OPERATOR_ID=${accountId}
HEDERA_OPERATOR_KEY=${privateKey}
AUDIT_TOPIC_ID=${auditTopicId}
REC_TOKEN_ID=
EF_GRID=0.8
`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('✅ .env file created');
  console.log(`   Location: ${envPath}\n`);

  // Close client
  await client.close();

  // Summary
  console.log('═══════════════════════════════════════════════');
  console.log('🎉 SETUP COMPLETE!');
  console.log('═══════════════════════════════════════════════\n');
  console.log('Your Hedera testnet environment:');
  console.log(`  Account ID:    ${accountId}`);
  console.log(`  Audit Topic:   ${auditTopicId}`);
  console.log(`  Topic URL:     https://hashscan.io/testnet/topic/${auditTopicId}`);
  console.log('\nNext steps:');
  console.log('  1. npm test tests/e2e-production.test.js');
  console.log('  2. node scripts/run-with-evidence.js');
  console.log('\n');
}

if (require.main === module) {
  setupHederaTestnet().catch(console.error);
}

module.exports = { setupHederaTestnet };
