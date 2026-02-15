// scripts/mint-recs.js
// Mint REC tokens based on verified attestations

const {
  Client,
  TokenMintTransaction,
  PrivateKey,
  AccountId,
  Hbar
} = require('@hashgraph/sdk');
const fs = require('fs');
require('dotenv').config();

const OPERATOR_ID = process.env.HEDERA_OPERATOR_ID;
const OPERATOR_KEY_STR = process.env.HEDERA_OPERATOR_KEY;
const REC_TOKEN_ID = process.env.REC_TOKEN_ID;

if (!OPERATOR_ID || !OPERATOR_KEY_STR || !REC_TOKEN_ID) {
  throw new Error("Missing required env vars: HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY, REC_TOKEN_ID");
}

const operatorKey = PrivateKey.fromString(OPERATOR_KEY_STR);
const client = Client.forTestnet();
client.setOperator(AccountId.fromString(OPERATOR_ID), operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(10));

function loadVerifiedAttestations(filename) {
  if (!fs.existsSync(filename)) {
    throw new Error(`File not found: ${filename}`);
  }

  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  return data.results || [];
}

function calculateMintAmount(results) {
  const approved = results.filter(r => r.attestation.verificationStatus === 'APPROVED');

  let totalRECs = 0;
  const mintDetails = [];

  for (const result of approved) {
    const recs = result.attestation.calculations.RECs_issued;
    totalRECs += recs;

    mintDetails.push({
      deviceId: result.attestation.deviceId,
      timestamp: result.attestation.timestamp,
      recsIssued: recs,
      transactionId: result.transactionId,
      trustScore: result.attestation.trustScore
    });
  }

  // Convert tCO2 to token units (6 decimals)
  const tokenAmount = Math.floor(totalRECs * 1_000_000);

  return { tokenAmount, totalRECs, mintDetails };
}

async function mintRECs(tokenAmount, mintDetails) {
  console.log(`\n=== Minting ${tokenAmount} REC tokens ===`);
  console.log(`(Equivalent to ${(tokenAmount / 1_000_000).toFixed(6)} tCO2)\n`);

  const tokenMintTx = await new TokenMintTransaction()
    .setTokenId(REC_TOKEN_ID)
    .setAmount(tokenAmount)
    .freezeWith(client);

  const tokenMintSign = await tokenMintTx.sign(operatorKey);
  const tokenMintSubmit = await tokenMintSign.execute(client);
  const tokenMintReceipt = await tokenMintSubmit.getReceipt(client);

  console.log(`✓ RECs minted successfully!`);
  console.log(`  Transaction ID: ${tokenMintSubmit.transactionId.toString()}`);
  console.log(`  Status: ${tokenMintReceipt.status.toString()}`);
  console.log(`  New Total Supply: ${tokenMintReceipt.totalSupply.toString()}`);

  return {
    transactionId: tokenMintSubmit.transactionId.toString(),
    status: tokenMintReceipt.status.toString(),
    totalSupply: tokenMintReceipt.totalSupply.toString(),
    mintDetails
  };
}

async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0];

  if (!inputFile) {
    console.log("\n🪙 HEDERA HYDROPOWER MRV - REC MINTING");
    console.log("======================================");
    console.log("\nUsage:");
    console.log("  node scripts/mint-recs.js <telemetry-results-file.json>");
    console.log("\nExample:");
    console.log("  node scripts/mint-recs.js telemetry-results-TURBINE-1-2026-02-16.json");
    process.exit(0);
  }

  console.log("\n🪙 HEDERA HYDROPOWER MRV - REC MINTING");
  console.log("======================================");

  try {
    // Load verified attestations
    console.log(`\nLoading: ${inputFile}`);
    const results = loadVerifiedAttestations(inputFile);
    console.log(`✓ Loaded ${results.length} attestations`);

    // Calculate mint amount
    const { tokenAmount, totalRECs, mintDetails } = calculateMintAmount(results);

    if (tokenAmount === 0) {
      console.log("\n⚠ No approved attestations found. Nothing to mint.");
      process.exit(0);
    }

    console.log(`\n=== Mint Summary ===`);
    console.log(`Approved Attestations: ${mintDetails.length}`);
    console.log(`Total RECs: ${totalRECs.toFixed(6)} tCO2`);
    console.log(`Token Amount: ${tokenAmount} (${(tokenAmount / 1_000_000).toFixed(6)} tokens)`);

    // Mint RECs
    const mintResult = await mintRECs(tokenAmount, mintDetails);

    // Save mint record
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const recordFile = `mint-record-${timestamp}.json`;
    fs.writeFileSync(recordFile, JSON.stringify(mintResult, null, 2));

    console.log(`\n✓ Mint record saved to: ${recordFile}`);
    console.log("\n✓ REC Minting Complete!");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }

  await client.close();
}

main();
