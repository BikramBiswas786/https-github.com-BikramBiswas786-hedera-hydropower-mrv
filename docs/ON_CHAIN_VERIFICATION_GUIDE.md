# ON-CHAIN VERIFICATION GUIDE

**Focus:** Real Hedera transactions, not theory  
**Platform:** HashScan Testnet Explorer  
**Goal:** Prove everything works with blockchain evidence

---

## WHAT TO VERIFY ON-CHAIN

### 1. HCS Audit Topic - Complete Attestations
### 2. HTS Token - HREC Carbon Credits
### 3. DID Documents - Device Identity
### 4. Transaction Costs - Fee Evidence
### 5. End-to-End Workflow - Full Trace

---

## 1. HCS AUDIT TOPIC VERIFICATION

### Topic Details

**Topic ID:** `0.0.7462776`  
**Direct Link:** https://hashscan.io/testnet/topic/0.0.7462776  
**Purpose:** Immutable audit log of all telemetry readings and verifications

### What to Check

1. **Open the topic link above**
2. **Look for recent messages** (scroll down)
3. **Each message = One telemetry reading + verification results**

### Message Structure to Verify

**Click any message, then click "View Message" to see JSON content.**

Look for these fields:

```json
{
  "reading_id": "RDG-PLANT-ALPHA-XXXXXXXX",
  "plant_id": "PLANT-ALPHA",
  "device_id": "TURBINE-ALPHA-2026",
  "timestamp": 1772736655860,
  
  "status": "APPROVED",  // or "FLAGGED" or "REJECTED"
  "trust_score": 0.985,   // 0-1 scale
  
  "readings": {
    "flowRate": 2.5,
    "head": 45.0,
    "generatedKwh": 900,
    "pH": 7.2,
    "turbidity": 10,
    "temperature": 18.5
  },
  
  "verification": {
    "physics_check": "PERFECT",
    "environmental_check": "PASS",
    "flags": []  // Empty if no issues
  },
  
  "carbon_credits": {
    "methodology": "ACM0002",
    "ER_tCO2": 0.72,
    "EF_grid_tCO2_per_MWh": 0.8,
    "EG_MWh": 0.9
  },
  
  "hedera": {
    "transaction_id": "0.0.6255927@1772736655.860259721",
    "topic_id": "0.0.7462776",
    "consensus_timestamp": "2026-03-05T18:44:15.860Z"
  }
}
```

### Find These Transaction Types

#### A. APPROVED Reading (Valid Telemetry)

**What to verify:**
- ✅ `status: "APPROVED"`
- ✅ `trust_score >= 0.9`
- ✅ `physics_check: "PERFECT"` or `"PASS"`
- ✅ `environmental_check: "PASS"`
- ✅ `carbon_credits` object exists with `ER_tCO2` value
- ✅ `flags: []` (empty array)

**Example Transaction:**  
Search topic for messages with `"status":"APPROVED"` in content

---

#### B. FLAGGED/REJECTED Reading (Fraud Detection)

**What to verify:**
- ✅ `status: "FLAGGED"` or `"REJECTED"`
- ✅ `trust_score < 0.7`
- ✅ `physics_check: "FAIL"` (if power inflated)
- ✅ `flags` array contains reasons like:
  - `"PHYSICS_VIOLATION"`
  - `"ENVIRONMENTAL_ANOMALY"`
  - `"TEMPORAL_ANOMALY"`
- ✅ **NO `carbon_credits` object** (no credits issued)

**Example Transaction:**  
Search topic for messages with `"status":"FLAGGED"` in content

---

#### C. Environmental Violation

**What to verify:**
- ✅ `status: "FLAGGED"`
- ✅ `environmental_check: "FAIL"`
- ✅ Out-of-range parameters:
  - pH < 6.5 or > 8.5
  - turbidity > 100
  - temperature < 10 or > 25
- ✅ `flags` contains `"ENVIRONMENTAL_ANOMALY"`

---

## 2. HTS TOKEN VERIFICATION

### Token Details

**Token ID:** `0.0.7964264`  
**Direct Link:** https://hashscan.io/testnet/token/0.0.7964264  
**Name:** Hedera Renewable Energy Credit (HREC)

### What to Check

1. **Token Properties**
   - Name: "Hedera Renewable Energy Credit"
   - Symbol: "HREC"
   - Type: Fungible Common
   - Decimals: 2
   - Treasury: 0.0.6255927

2. **Recent Transactions**
   - Click "Transactions" tab
   - Look for "Token Mint" transactions
   - Each mint = Carbon credits for one approved reading

3. **Verify Mint Amount**
   - Find an APPROVED HCS message with `ER_tCO2` value
   - Find corresponding HTS mint transaction (timestamp close)
   - **Mint amount = ER_tCO2 × 100** (for 2 decimals)
   - Example: 0.72 tCO₂ → 72 HREC tokens minted

### Example Correlation

**Step 1:** Find HCS attestation
```
HCS TX: 0.0.6255927@1772736655.860259721
Status: APPROVED
ER_tCO2: 0.72
```

**Step 2:** Find HTS mint (same or next few seconds)
```
HTS TX: 0.0.6255927@1772736656.123456789
Type: Token Mint
Token: 0.0.7964264
Amount: 72 HREC (= 0.72 × 100)
```

**Verification:** ✅ Amounts match, timestamps align

---

## 3. TRANSACTION COST VERIFICATION

### Check Real Fees on HashScan

**Account:** 0.0.6255927  
**Link:** https://hashscan.io/testnet/account/0.0.6255927

### How to Find Fees

1. **Click any HCS transaction** (type: ConsensusSubmitMessage)
2. **Look for "Transaction Fee" field**
3. **Typical cost:** ~$0.0001 USD per message

### Example Fee Verification

**HCS Message Fee:**
```
Transaction Type: ConsensusSubmitMessage
Transaction Fee: 0.0001 USD (or ~0.001 HBAR)
Topic: 0.0.7462776
```

**HTS Mint Fee:**
```
Transaction Type: Token Mint
Transaction Fee: 0.001 - 0.01 USD
Token: 0.0.7964264
```

### Annual Cost Calculation

**For 6MW plant generating 105,120 readings/year:**

```
HCS Cost = 105,120 readings × $0.0001 = $10.51
HTS Cost = 15,000 mints × $0.001 = $15.00
Total On-Chain = $25.51/year
```

**Compare to traditional MRV:** $203,000/year

---

## 4. END-TO-END WORKFLOW VERIFICATION

### Complete Transaction Chain

Verify this sequence exists on-chain:

```
1. DID Document Created
   └─> HCS message with W3C DID structure

2. Valid Telemetry Submitted
   └─> HCS attestation: status=APPROVED, trust_score=0.985
       └─> Carbon credits calculated: ER_tCO2=0.72
           └─> HTS mint: 72 HREC tokens

3. Fraud Telemetry Submitted
   └─> HCS attestation: status=FLAGGED, trust_score=0.605
       └─> NO carbon credits
       └─> NO HTS mint
       └─> Fraud evidence preserved on-chain

4. Environmental Violation
   └─> HCS attestation: status=FLAGGED, environmental_check=FAIL
       └─> NO carbon credits
       └─> NO HTS mint
```

### How to Trace

1. **Go to HCS topic:** https://hashscan.io/testnet/topic/0.0.7462776
2. **Find a cluster of messages** from same demo run (close timestamps)
3. **Verify sequence:**
   - One APPROVED → Check for corresponding HTS mint
   - One FLAGGED → Verify NO corresponding mint
   - Compare trust scores (APPROVED ≈ 0.9-1.0, FLAGGED ≈ 0.5-0.7)

---

## 5. VERIFICATION CHECKLIST

### For Judges/Auditors

Use this checklist when reviewing the project:

#### HCS Topic (0.0.7462776)

- [ ] Topic exists and is public
- [ ] Messages contain complete attestation structure
- [ ] APPROVED messages have `carbon_credits` object
- [ ] FLAGGED messages have `flags` array with reasons
- [ ] All readings logged (valid AND fraud)

#### HREC Token (0.0.7964264)

- [ ] Token exists with correct properties
- [ ] Name: "Hedera Renewable Energy Credit"
- [ ] Symbol: "HREC", Decimals: 2
- [ ] Mint transactions visible
- [ ] Mint amounts correlate to HCS attestations

#### Transaction Costs

- [ ] HCS fees visible on HashScan (≈$0.0001)
- [ ] HTS mint fees visible (≈$0.001-0.01)
- [ ] Total on-chain cost < $50/year (for 6MW plant)

#### ACM0002 Compliance

- [ ] `carbon_credits.methodology: "ACM0002"`
- [ ] Formula applied: `ER = EG_MWh × EF_grid`
- [ ] Grid emission factor: 0.8 tCO₂/MWh (India)
- [ ] Calculation verifiable from HCS data

#### dMRV Protocol

- [ ] **Monitoring:** Sensor data in `readings` object
- [ ] **Reporting:** Structured HCS attestations
- [ ] **Verification:** 5-layer results in `verification` object
- [ ] **Auditability:** Immutable on-chain logs

---

## 6. QUICK VERIFICATION COMMANDS

### Using PowerShell

```powershell
# Stop any running server
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Navigate to project
cd C:\Users\USER\Hedera-hydropower-dMRV-with-5-layer-verification-

# Run demo (creates on-chain transactions)
npm run demo

# Run test suite (creates test transactions)
# Start API first:
npm run start   # Window 1

# In Window 2:
.\RUN_TESTS.ps1

# Copy transaction IDs from output
# Verify each one on HashScan
```

### Verify Transaction URLs

**Pattern:**
```
https://hashscan.io/testnet/transaction/{transaction_id}
```

**Example:**
```
https://hashscan.io/testnet/transaction/0.0.6255927@1772736655.860259721
```

---

## 7. COMMON VERIFICATION MISTAKES

### ❌ Don't Do This

1. **Looking for off-chain data**
   - The demo outputs terminal logs, but PROOF is on HashScan

2. **Skipping fraud transactions**
   - Fraud detection is a key feature - verify FLAGGED messages exist

3. **Ignoring timestamps**
   - HCS and HTS transactions should be seconds apart

4. **Not checking fees**
   - Cost reduction claim requires verifying actual fees

### ✅ Do This Instead

1. **Start with HashScan topic**
   - See ALL messages in one place

2. **Find APPROVED and FLAGGED examples**
   - Compare their structures side-by-side

3. **Trace HCS → HTS correlation**
   - One approved attestation → One mint

4. **Calculate fees from real transactions**
   - Don't trust claimed numbers, verify on-chain

---

## 8. EXAMPLE VERIFICATION SESSION

### Step-by-Step Walkthrough

**Step 1: Open HCS Topic**
```
URL: https://hashscan.io/testnet/topic/0.0.7462776
```

**Step 2: Click Latest Message**
- Click message row
- Click "View Message" button
- See JSON content

**Step 3: Check Fields**
```json
{
  "status": "APPROVED",        ✅ Expected for valid reading
  "trust_score": 0.985,        ✅ High score (>0.9)
  "carbon_credits": { ... },   ✅ Credits calculated
  "hedera": {
    "transaction_id": "...",    ✅ Copy this
  }
}
```

**Step 4: Copy Transaction ID**
```
0.0.6255927@1772736655.860259721
```

**Step 5: Verify on HashScan**
```
Full URL: https://hashscan.io/testnet/transaction/0.0.6255927@1772736655.860259721
```

**Step 6: Check Fee**
- Transaction Fee: ~0.0001 USD
- This is the REAL cost

**Step 7: Find Corresponding HTS Mint**
- Go to token page: https://hashscan.io/testnet/token/0.0.7964264
- Click "Transactions"
- Find mint around same timestamp
- Verify amount matches ER_tCO2 × 100

---

## 9. VERIFICATION EVIDENCE TABLE

### Build This Table for Your Audit

| HCS TX ID | Status | Trust | ER_tCO2 | HTS Mint TX | HREC Amount | Fee |
|-----------|--------|-------|---------|-------------|-------------|-----|
| 0.0.xxx@... | APPROVED | 0.985 | 0.72 | 0.0.yyy@... | 72 | $0.0001 |
| 0.0.xxx@... | FLAGGED | 0.605 | N/A | N/A | 0 | $0.0001 |
| ... | ... | ... | ... | ... | ... | ... |

**To fill this:**
1. Run `npm run demo` or `RUN_TESTS.ps1`
2. Copy each transaction ID from output
3. Look up on HashScan
4. Fill in the table
5. Attach to your audit report

---

## 10. FINAL VERIFICATION STATEMENT

### For Audit Reports

After completing this guide, you can state:

> "I independently verified the Hedera Hydropower dMRV system on Hedera testnet:
> 
> - HCS Topic 0.0.7462776 contains [X] attestations with complete MRV data
> - APPROVED readings have trust scores ≥0.9 and carbon credits calculated per ACM0002
> - FLAGGED readings have trust scores <0.7 with documented fraud reasons
> - HREC token 0.0.7964264 has [Y] mints correlating to APPROVED attestations
> - HCS transaction fees verified at $0.0001 per message on HashScan
> - HTS mint fees verified at $0.001-0.01 per transaction on HashScan
> - All claims are verifiable using public blockchain explorer"

---

## KEY LINKS

**Primary Verification URLs:**

- HCS Topic: https://hashscan.io/testnet/topic/0.0.7462776
- HREC Token: https://hashscan.io/testnet/token/0.0.7964264
- Operator Account: https://hashscan.io/testnet/account/0.0.6255927
- GitHub Repo: https://github.com/BikramBiswas786/Hedera-hydropower-dMRV-with-5-layer-verification-

**Documentation:**

- Ultimate Auditor Guide: `docs/ULTIMATE_AUDITOR_GUIDE.md`
- API Reference: `docs/API.md`
- Live Demo Results: `LIVE_DEMO_RESULTS.md`

---

**Document Version:** 1.0  
**Focus:** On-chain evidence only  
**Last Updated:** March 6, 2026  
**Purpose:** Blockchain verification for judges/auditors
