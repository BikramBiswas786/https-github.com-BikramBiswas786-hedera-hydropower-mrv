const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  Hbar
} = require('@hashgraph/sdk');

// YOUR HARDCODED VALUES
const OPERATOR_ID = "0.0.6255927";
const OPERATOR_KEY_STR = "3030020100300706052b8104000a04220420398637ba54e6311afdc8a2f1a2f1838834dc30ce2d1fec22cb2cddd6ca28fbde";
const DID_TOPIC_ID = "0.0.7941871";

async function createRecToken() {
  console.log('\n========================================');
  console.log('Creating REC Token (FIXED FEE)');
  console.log('========================================\n');

  const operatorKey = PrivateKey.fromString(OPERATOR_KEY_STR);
  const client = Client.forTestnet();
  client.setOperator(OPERATOR_ID, operatorKey);
  
  // INCREASED FEE FOR TOKEN CREATION (0.5 HBAR vs 0.1 HBAR for DID)
  client.setDefaultMaxTransactionFee(new Hbar(5));  // 5 HBAR max

  console.log('Step 1: Initializing Hedera Client...');
  console.log(`✓ Connected to Hedera Testnet`);
  console.log(`✓ Operator Account: ${OPERATOR_ID}`);
  console.log(`✓ Max Fee: 5 HBAR (for token creation)`);
  console.log(`✓ DID Topic: ${DID_TOPIC_ID}\n`);

  try {
    console.log('Step 2: Creating REC Token (freeze + manual sign)...');

    let tx = new TokenCreateTransaction()
      .setTokenName("Hydropower REC")
      .setTokenSymbol("HREC")
      .setDecimals(0)
      .setInitialSupply(1000000)
      .setTreasuryAccountId(OPERATOR_ID)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1000000000)
      .setAdminKey(operatorKey.publicKey)
      .setSupplyKey(operatorKey.publicKey)
      .setFreezeDefault(false);

    // Freeze with client
    tx = await tx.freezeWith(client);

    // Manual sign (proven pattern)
    const signedTx = await tx.sign(operatorKey);

    console.log("Transaction ID:", signedTx.transactionId.toString());

    // Execute
    const response = await signedTx.execute(client);
    console.log("Node used:", response.nodeId.toString());

    const receipt = await response.getReceipt(client);
    const tokenId = receipt.tokenId;

    console.log('\n✅ REC Token Created: ' + tokenId.toString());
    console.log('✅ HashScan: https://hashscan.io/testnet/token/' + tokenId.toString());
    
    console.log('\n🎉 FULL PRODUCTION STACK!');
    console.log('DID: https://hashscan.io/testnet/topic/' + DID_TOPIC_ID);
    console.log('REC: https://hashscan.io/testnet/token/' + tokenId.toString());
    console.log('Account: https://hashscan.io/testnet/account/' + OPERATOR_ID);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.nodeId) console.error('Node ID:', error.nodeId.toString());
    if (error.transactionId) console.error('Transaction ID:', error.transactionId.toString());
  } finally {
    await client.close();
  }
}

createRecToken();
