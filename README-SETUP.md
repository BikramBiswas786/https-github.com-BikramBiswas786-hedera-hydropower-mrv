# 🚀 Hedera Production Setup Guide

## Quick Start (3 minutes)

### 1. Get Hedera Testnet Account

**Go to:** https://portal.hedera.com/register

1. Create free account
2. Navigate to **"Testnet"** tab
3. Copy your:
   - **Account ID** (format: `0.0.1234567`)
   - **Private Key** (hex string starting with `302e...`)

### 2. Run Setup Script

```bash
node scripts/setup-hedera-testnet.js
```

**This will:**
- ✅ Connect to Hedera testnet
- ✅ Create HCS audit topic
- ✅ Generate `.env` file
- ✅ Display topic URL on HashScan explorer

### 3. Run E2E Test with Evidence

```bash
node scripts/run-with-evidence.js
```

**This will:**
- ✅ Submit real transactions to Hedera blockchain
- ✅ Save all transaction receipts to `evidence/` folder
- ✅ Generate audit trail with HashScan URLs
- ✅ Prove APPROVED/REJECTED verification works

---

## What You Get

### Transaction Evidence

Every run creates `evidence/evidence-<timestamp>.json`:

```json
{
  "timestamp": "2026-02-18T01:45:00.000Z",
  "projectId": "HYDRO-PROJECT-001",
  "deviceId": "TURBINE-ALPHA",
  "transactions": [
    {
      "step": "DID_DEPLOYMENT",
      "transactionId": "0.0.1234567@1739836800.123456789",
      "explorerUrl": "https://hashscan.io/testnet/transaction/..."
    },
    {
      "step": "VALID_TELEMETRY",
      "transactionId": "0.0.1234567@1739836900.234567890",
      "verificationStatus": "APPROVED",
      "trustScore": 0.9750
    }
  ]
}
```

### HashScan Explorer Links

Every transaction gets a public URL:
- Topic: `https://hashscan.io/testnet/topic/0.0.123456`
- Transaction: `https://hashscan.io/testnet/transaction/0.0.123@456.789`

---

## Manual Testing

Run individual components:

```bash
# Initialize workflow
node -e "const W=require('./src/workflow'); new W().initialize('P1','D1',0.8).then(console.log)"

# Submit telemetry via CLI
node src/engine/v1/engine-v1.js submit TURBINE-1 2.5 45 938 7.2

# Run full test suite
npm test
```

---

## Troubleshooting

### "Hedera credentials missing"

**Solution:** Run `node scripts/setup-hedera-testnet.js`

### "BadKeyError: private key cannot be decoded"

**Solution:** Check `.env` has valid `HEDERA_OPERATOR_KEY` (hex format)

### "Insufficient balance"

**Solution:** Go to https://portal.hedera.com and fund your testnet account

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    E2E Workflow                         │
└─────────────────────────────────────────────────────────┘
         │
         ├─ 1. Initialize Project + Device
         ├─ 2. Deploy DID → HCS Topic
         ├─ 3. Create REC Token → HTS
         ├─ 4. Submit Telemetry → EngineV1 Validation
         │    ├─ Physics Check (±30% tolerance)
         │    ├─ Temporal Consistency
         │    ├─ Environmental Bounds
         │    ├─ Statistical Outlier (Z-score)
         │    └─ Device Profile Limits
         ├─ 5. Trust Score → APPROVED/FLAGGED/REJECTED
         ├─ 6. Attestation → HCS Topic Message
         └─ 7. Evidence → JSON + HashScan URLs
```

---

## Production Deployment

### Switch to Mainnet

1. Change `Client.forTestnet()` → `Client.forMainnet()` in:
   - `src/engine/v1/engine-v1.js`
   - `src/workflow.js`

2. Use mainnet credentials in `.env`

3. Increase `setDefaultMaxTransactionFee(new Hbar(10))`

### Security

- ⚠️ **NEVER commit `.env` to Git**
- ✅ Use environment variables in production
- ✅ Store private keys in AWS Secrets Manager / HashiCorp Vault

---

## Support

**Hedera Docs:** https://docs.hedera.com  
**HashScan Explorer:** https://hashscan.io/testnet  
**Portal:** https://portal.hedera.com
