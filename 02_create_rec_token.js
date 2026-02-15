/**
 * Create REC Token on Hedera HTS
 * Creates fungible token for Renewable Energy Certificates
 * 
 * Usage: node 02_create_rec_token.js
 */

const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  Hbar
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;

async function createRECToken() {
  console.log('\n========================================');
  console.log('Creating REC Token on Hedera HTS');
  console.log('========================================\n');

  let client;

  try {
    // Initialize client
    console.log('Step 1: Initializing Hedera Client...');
    client = Client.forTestnet();
    client.setOperator(HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY);
    client.setDefaultMaxTransactionFee(new Hbar(50));
    console.log(`✓ Connected to Hedera Testnet\n`);

    // Create REC token
    console.log('Step 2: Creating REC Token...');
    const operatorPrivateKey = PrivateKey.fromString(HEDERA_PRIVATE_KEY);
    
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName('Hydropower REC')
      .setTokenSymbol('H-REC')
      .setDecimals(2)
      .setInitialSupply(0)
      .setTokenType(TokenType.FUNGIBLE_COMMON)
      .setSupplyType(TokenSupplyType.INFINITE)
      .setTreasuryAccountId(HEDERA_ACCOUNT_ID)
      .setAdminKey(operatorPrivateKey)
      .setSupplyKey(operatorPrivateKey)
      .setFreezeKey(operatorPrivateKey)
      .setWipeKey(operatorPrivateKey)
      .setKycKey(operatorPrivateKey)
      .setTokenMemo('Renewable Energy Certificates for Hydropower Projects')
      .execute(client);

    const tokenReceipt = await tokenCreateTx.getReceipt(client);
    const tokenId = tokenReceipt.tokenId;
    
    console.log(`✓ REC Token Created: ${tokenId}`);
    console.log(`✓ Token Name: Hydropower REC`);
    console.log(`✓ Token Symbol: H-REC`);
    console.log(`✓ Decimals: 2`);
    console.log(`✓ Supply Type: INFINITE`);
    console.log(`✓ HashScan: https://hashscan.io/testnet/token/${tokenId}\n`);

    // Display summary
    console.log('========================================');
    console.log('REC Token Creation Summary');
    console.log('========================================\n');

    const summary = {
      'Token ID': tokenId.toString(),
      'Token Name': 'Hydropower REC',
      'Token Symbol': 'H-REC',
      'Decimals': 2,
      'Supply Type': 'INFINITE',
      'Treasury Account': HEDERA_ACCOUNT_ID,
      'Network': 'Testnet',
      'Creation Date': new Date().toISOString(),
      'Status': 'Active'
    };

    Object.entries(summary).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    console.log('\n========================================');
    console.log('Token Creation Successful!');
    console.log('========================================\n');

    // Save token details
    const tokenDetails = {
      ...summary,
      'transactionId': tokenCreateTx.transactionId.toString(),
      'hashscanUrl': `https://hashscan.io/testnet/token/${tokenId}`
    };

    const outputDir = path.join(__dirname, '../../evidence');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'rec-token.json'),
      JSON.stringify(tokenDetails, null, 2)
    );

    console.log('✓ Token details saved to: evidence/rec-token.json\n');

    return {
      success: true,
      tokenId: tokenId.toString(),
      tokenDetails
    };
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.close();
    }
  }
}

createRECToken()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });
