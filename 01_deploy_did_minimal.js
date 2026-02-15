const {
  Client,
  TopicCreateTransaction,
  PrivateKey,
  Hbar,
  AccountBalanceQuery
} = require('@hashgraph/sdk');
require('dotenv').config();

const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID;
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;

if (!HEDERA_ACCOUNT_ID || !HEDERA_PRIVATE_KEY) {
  console.error("Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env");
  process.exit(1);
}

async function main() {
  console.log("\n=== MINIMAL DID TOPIC DEPLOY ===\n");

  const operatorPrivateKey = PrivateKey.fromString(HEDERA_PRIVATE_KEY);
  const client = Client.forTestnet();
  client.setOperator(HEDERA_ACCOUNT_ID, operatorPrivateKey);
  client.setDefaultMaxTransactionFee(new Hbar(2));

  try {
    // 1. Balance sanity check
    console.log("Step 1: Balance check...");
    const balance = await new AccountBalanceQuery()
      .setAccountId(HEDERA_ACCOUNT_ID)
      .execute(client);

    console.log("✓ Balance OK:", balance.hbars.toString(), "HBAR");

    // 2. Build + freeze + sign + execute topic create
    console.log("\nStep 2: TopicCreateTransaction (manual sign)...");

    let tx = new TopicCreateTransaction()
      .setTopicMemo("Hydropower Minimal DID Topic")
      .setAdminKey(operatorPrivateKey.publicKey)
      .setSubmitKey(operatorPrivateKey.publicKey);

    // Freeze with client (locks node + fee)
    tx = await tx.freezeWith(client);

    // Manually sign with operator key
    const signedTx = await tx.sign(operatorPrivateKey);

    console.log("Transaction ID (before execute):", signedTx.transactionId.toString());
    console.log("Signed transaction (toString):", signedTx.toString());

    // Execute against network
    const response = await signedTx.execute(client);
    console.log("Node account ID used:", response.nodeId.toString());

    const receipt = await response.getReceipt(client);
    const topicId = receipt.topicId;

    console.log("\n✅ SUCCESS: Topic created");
    console.log("Topic ID:", topicId.toString());
    console.log(
      "HashScan:",
      `https://hashscan.io/testnet/topic/${topicId.toString()}/messages`
    );
  } catch (err) {
    console.error("\n❌ MINIMAL SCRIPT ERROR:", err.message);
    if (err.transactionId) {
      console.error("Transaction ID:", err.transactionId.toString());
    }
    console.error("Full error object:", err);
  } finally {
    client.close();
  }
}

main();
