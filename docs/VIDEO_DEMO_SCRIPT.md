# 🎬 HEDERA HYDROPOWER dMRV - VIDEO DEMO SCRIPT

**Version:** 3.1 - Production Ready  
**Duration:** 12-15 minutes  
**Format:** Screen recording with voice-over  
**Target:** Judges, Technical Reviewers, Investors

---

## 📋 PRE-RECORDING CHECKLIST

### ✅ Environment Setup

```powershell
# Navigate to working directory
cd C:\Users\USER

# Clean slate (optional)
Remove-Item -Recurse -Force Hedera-hydropower-dMRV-with-5-layer-verification- -ErrorAction SilentlyContinue

# Clear screen
cls

# Verify tools
node --version
npm --version
git --version
```

### 🌐 Browser Tabs to Open

1. **HashScan Account:** https://hashscan.io/testnet/account/0.0.6255927
2. **HashScan Topic:** https://hashscan.io/testnet/topic/0.0.7462776
3. **HashScan Token:** https://hashscan.io/testnet/token/0.0.7964264
4. **GitHub Repo:** https://github.com/BikramBiswas786/Hedera-hydropower-dMRV-with-5-layer-verification-
5. **This Script** (for reference)

### 🎥 Recording Settings

- Resolution: **1920×1080 (1080p)**
- Frame rate: **30 fps**
- Audio: **Microphone ON**
- Cursor: **Highlighting enabled**

---

## 📽️ VIDEO TIMELINE

| Section | Duration | Content |
|---------|----------|----------|
| Introduction | 0:00 - 0:30 | Project overview |
| Setup | 0:30 - 2:30 | Clone, install, verify |
| Live Demo | 2:30 - 6:30 | Full workflow with narration |
| Test Suite | 6:30 - 9:30 | 6 production tests |
| On-Chain Verification | 9:30 - 12:30 | HashScan deep dive |
| Cost Analysis | 12:30 - 14:00 | Cost model |
| Conclusion | 14:00 - 15:00 | Summary & call-to-action |

---

# 🎬 START RECORDING

---

## 🎯 SECTION 1: INTRODUCTION
**[0:00 - 0:30] | 30 seconds**

### 📺 ON SCREEN
```
Clean PowerShell window
C:\Users\USER>
```

### 🎤 NARRATION

> "Hi, I'm demonstrating the Hedera Hydropower Digital MRV system - a production-grade solution that **reduces carbon credit verification costs by 97.59%** while maintaining full ACM0002 compliance."

> "In the next 15 minutes, I'll show you **live Hedera transactions, fraud detection, and complete audit trails** - all reproducible and verifiable on testnet."

### 💬 SUBTITLE (optional on-screen text)
```
Hedera Hydropower dMRV
✅ 97.59% Cost Reduction
✅ ACM0002 Compliant  
✅ Production Ready
```

---

## ⚙️ SECTION 2: PROJECT SETUP
**[0:30 - 2:30] | 2 minutes**

---

### 📺 Step 2.1: Clone Repository
**[0:30 - 0:50] | 20 seconds**

#### COMMAND
```powershell
git clone https://github.com/BikramBiswas786/Hedera-hydropower-dMRV-with-5-layer-verification-.git
```

#### 🎤 NARRATION (while cloning)

> "First, I'll clone the repository from GitHub. This contains the complete MRV engine with 5-layer verification, Hedera integration, and production test suite."

#### 💬 SUBTITLE
```
Cloning repository...
Contains: MRV Engine | Hedera SDK | Test Suite
```

---

### 📺 Step 2.2: Navigate & Install
**[0:50 - 1:45] | 55 seconds**

#### COMMANDS
```powershell
cd Hedera-hydropower-dMRV-with-5-layer-verification-

npm install
```

#### 🎤 NARRATION (during npm install)

> "Installing dependencies. This includes the Hedera SDK version 2.54 for HCS and HTS integration, along with Express for the API server and production-grade security libraries."

*[Pause while npm installs - 30 seconds]*

> "Installation complete."

#### 💬 SUBTITLE
```
Installing dependencies...
📦 @hashgraph/sdk v2.54
📦 Express API server  
📦 Security libraries
```

---

### 📺 Step 2.3: Verify Environment
**[1:45 - 2:30] | 45 seconds**

#### COMMANDS
```powershell
cat .env | Select-String "HEDERA"

Write-Host "`nSystem Configuration:" -ForegroundColor Cyan
Write-Host "  Hedera Account:  0.0.6255927" -ForegroundColor White
Write-Host "  HCS Audit Topic: 0.0.7462776" -ForegroundColor White  
Write-Host "  HREC Token:      0.0.7964264" -ForegroundColor White
Write-Host "  Network:         Hedera Testnet" -ForegroundColor White
Write-Host ""
```

#### 🎤 NARRATION

> "Let me verify the environment configuration."

*[Show environment variables]*

> "You can see our testnet credentials. Operator account is **0.0.6255927**, HCS audit topic is **0.0.7462776**, and HREC token is **0.0.7964264**. Everything connects to Hedera testnet."

#### 💬 SUBTITLE
```
✅ Hedera Account: 0.0.6255927
✅ HCS Topic: 0.0.7462776 (Audit Log)
✅ HREC Token: 0.0.7964264 (Carbon Credits)
✅ Network: Testnet
```

*[Pause 3 seconds to let viewers read]*

---

## 🚀 SECTION 3: LIVE DEMO - FULL WORKFLOW
**[2:30 - 6:30] | 4 minutes**

---

### 📺 Step 3.1: Run Demo
**[2:30 - 2:45] | 15 seconds**

#### COMMAND
```powershell
npm run demo
```

#### 🎤 NARRATION

> "Now I'll run the complete live demo. This will show **device DID registration, valid telemetry, fraud detection, and carbon credit calculation** - all with real Hedera transactions."

#### 💬 SUBTITLE
```
Running live demo...
Connecting to Hedera Testnet
```

---

### 📺 Step 3.2: DID Registration
**[2:45 - 3:15] | 30 seconds**

#### ON SCREEN (Demo Output)
```
╔========================================================╗
║  Hedera Hydropower MRV — Live Demo                   ║
║  Apex Hackathon 2026 — Sustainability Track           ║
╚========================================================╝
  ✅ Live mode — Account: 0.0.6255927
────────────────────────────────────────────────────────────
  ✅ Connected to Hedera Testnet

STEP 1: Device DID Registration (W3C DID on Hedera)
  ✅ Device ID : TURBINE-APEX-2026-001
  ✅ DID       : did:hedera:testnet:z6Mk...
```

#### 🎤 NARRATION

> "Step 1: Creating a **W3C-compliant decentralized identity** for the turbine. This DID is anchored on Hedera HCS and follows the did:hedera method specification."

*[Point to DID output with cursor]*

> "You can see the DID here - it starts with **'did:hedera:testnet'** and contains the device identifier. This establishes cryptographically verifiable identity for the sensor."

#### 💬 SUBTITLE
```
STEP 1: Device Identity (DID)
✅ W3C Compliant
✅ HCS Anchored
✅ did:hedera:testnet:z6Mk...
```

---

### 📺 Step 3.3: HREC Token
**[3:15 - 3:45] | 30 seconds**

#### ON SCREEN
```
STEP 2: HREC Token (Hedera Token Service)
  ✅ Token ID  : 0.0.7964264
  ✅ Token Name: HREC (1 token = 1 verified MWh)
  ℹ  HashScan  : https://hashscan.io/testnet/token/0.0.7964264
```

#### 🎤 NARRATION

> "Step 2: This is the **HREC token** - a Hedera Token Service fungible token representing verified renewable energy credits."

*[Point to token ID]*

> "Token ID is **0.0.7964264** on testnet. Each token equals **one verified megawatt-hour** of hydropower generation. We'll verify this on HashScan shortly."

#### 💬 SUBTITLE
```
STEP 2: Carbon Credit Token
📊 Token ID: 0.0.7964264
📊 Symbol: HREC
📊 1 HREC = 1 MWh verified
```

---

### 📺 Step 3.4: Valid Telemetry
**[3:45 - 4:45] | 60 seconds**

#### ON SCREEN
```
STEP 3: Telemetry #1 — NORMAL reading
  Flow 12.5 m³/s | Head 45.2 m | Eff 0.88
  Expected: 4.878 MW | Reported: 4.87 MW
  Trust Score: 100% → APPROVED
  ✅ TX: 0.0.6255927@1772733584.348234779
  ℹ  HashScan: https://hashscan.io/testnet/transaction/...
  ✅ Reading anchored to Hedera HCS
```

#### 🎤 NARRATION

> "Step 3: Submitting a **valid sensor reading**. Flow rate **12.5 cubic meters per second**, head **45.2 meters**, efficiency **88%**."

*[Point to physics calculation]*

> "The system calculates theoretical maximum power using the hydropower formula: efficiency times density times gravity times flow times head. That's **4.878 megawatts**."

*[Point to reported value]*

> "The reported value is **4.87 megawatts** - well within acceptable range, less than 1% deviation."

*[Point to Trust Score]*

> "**Trust score: 100%** - this reading passes all five verification layers: physics, temporal, environmental, statistical, and consistency checks."

*[Point to APPROVED status]*

> "**Status: APPROVED.** The system will calculate carbon credits using ACM0002 methodology and log this to Hedera HCS."

*[Point to transaction ID]*

> "Here's the **Hedera transaction ID**. Every reading gets a permanent, immutable record on the blockchain. This is **0.0.6255927@1772733584.348234779** - verifiable on HashScan right now."

#### 💬 SUBTITLE
```
STEP 3: Valid Reading
✅ Flow: 12.5 m³/s | Head: 45.2m
✅ Theoretical: 4.878 MW | Reported: 4.87 MW
✅ Trust Score: 100% → APPROVED
✅ HCS TX: 0.0.6255927@1772733584.348234779
```

---

### 📺 Step 3.5: Fraud Detection
**[4:45 - 5:45] | 60 seconds**

#### ON SCREEN
```
STEP 4: Telemetry #2 — FRAUD ATTEMPT
  Flow 12.5 m³/s | Head 45.2 m | Eff 0.88
  Expected: 4.878 MW | Reported: 9.5 MW  ← INFLATED
  Trust Score: 60% → REJECTED
  ✅ TX: 0.0.6255927@1772733585.901458595
  ✅ Fraud REJECTED — evidence preserved on-chain
```

#### 🎤 NARRATION

> "Step 4: Now I'm submitting **fraudulent data** - same flow and head, but reported power is **9.5 megawatts** instead of 4.87."

*[Point to comparison]*

> "That's **nearly double the theoretical maximum** - a clear physics violation."

*[Point to Trust Score]*

> "**Trust score drops to 60%** - below our approval threshold of 70%. The physics verification layer detected this immediately."

*[Point to REJECTED status]*

> "**Status: REJECTED.** No carbon credits will be issued for this reading."

*[Point to transaction ID]*

> "But critically, this fraud attempt is **still logged on-chain** as evidence. The attestation shows the violation, the trust score calculation, and the rejection decision. **Full transparency for auditors.**"

#### 💬 SUBTITLE
```
STEP 4: Fraud Attempt
⚠️ Reported: 9.5 MW (Expected: 4.878 MW)
⚠️ Physics Violation: 95% over theoretical max
❌ Trust Score: 60% → REJECTED
✅ Evidence logged on HCS
```

---

### 📺 Step 3.6: Carbon Credits & Minting
**[5:45 - 6:30] | 45 seconds**

#### ON SCREEN
```
STEP 5: HREC Minting (approved reading only)
  Verified MWh : 4.87
  CO₂ credits  : 3.896 tCO₂ (EF_GRID=0.8)
  HREC tokens  : 4.87 (1 token = 1 MWh)
  ✅ 4.87 HREC minted

Demo complete.
```

#### 🎤 NARRATION

> "Step 5: **Carbon credit calculation** using **ACM0002 methodology** from UNFCCC."

*[Point to calculation]*

> "**4.87 megawatt-hours** times **0.8 tons CO2 per megawatt-hour** equals **3.896 tons of CO2 equivalent**. This is the emission reduction from replacing grid electricity with clean hydropower."

*[Point to HREC tokens]*

> "**4.87 HREC tokens minted** - that's a **1-to-1 correspondence** with verified megawatt-hours."

*[Emphasize contrast]*

> "Notice: **Only the approved reading gets tokens. The fraud attempt gets zero.** This is enforced automatically by the smart contract logic."

#### 💬 SUBTITLE
```
STEP 5: Carbon Credits (ACM0002)
📊 Energy: 4.87 MWh verified
📊 Credits: 3.896 tCO₂ equivalent
✅ HREC Minted: 4.87 tokens (approved only)
❌ Fraud Reading: 0 tokens
```

*[Pause 2 seconds]*

---

## 🧪 SECTION 4: PRODUCTION TEST SUITE
**[6:30 - 9:30] | 3 minutes**

---

### 📺 Step 4.1: Start API Server
**[6:30 - 6:50] | 20 seconds**

#### 🎤 NARRATION

> "Before running the test suite, I need to start the API server. I'll open a second terminal window."

*[Open new PowerShell window]*

#### COMMAND (New Window)
```powershell
cd C:\Users\USER\Hedera-hydropower-dMRV-with-5-layer-verification-

npm run start
```

#### ON SCREEN
```
Server started on port 3000
EngineV1 Initialized with Hedera account: 0.0.6255927
HCS Topic: 0.0.7462776
```

#### 🎤 NARRATION

> "Server is listening on **port 3000** and connected to Hedera testnet."

*[Switch back to first window]*

#### 💬 SUBTITLE
```
API Server Started
✅ Port: 3000
✅ Connected to Hedera
```

---

### 📺 Step 4.2: Run Test Suite
**[6:50 - 7:10] | 20 seconds**

#### COMMAND
```powershell
.\RUN_TESTS.ps1
```

#### 🎤 NARRATION

> "Now I'll run the **production test suite**. This validates all security features: **fraud detection, environmental monitoring, replay attack prevention, and multi-plant isolation**."

#### 💬 SUBTITLE
```
Running 6 Production Tests...
```

---

### 📺 Step 4.3: Narrate Tests
**[7:10 - 9:00] | 110 seconds**

#### ON SCREEN (as each test runs)

```
========================================================
  HEDERA HYDROPOWER dMRV - COMPLETE TEST SUITE
========================================================

[TEST 1] Valid APPROVED Telemetry
  Status: APPROVED
  Trust Score: 0.985
  Reading ID: RDG-PLANT-ALPHA-XXXX
  Physics Check: PERFECT
  Environmental Check: PASS
  Carbon Credits: 0.72 tCO2e
  Transaction: 0.0.6255927@1772736655.860259721
  
  TEST 1 PASSED
```

#### 🎤 NARRATION (Test 1)

> "**Test 1: Valid telemetry** with proper physics and environmental parameters in range."

*[Point to output]*

> "Status **APPROVED**, trust score **0.985**, carbon credits calculated. **Test 1 PASSED.**"

---

#### ON SCREEN
```
[TEST 2] Fraud Detection - Inflated Power
  Status: FLAGGED
  Trust Score: 0.605
  Physics Check: FAIL
  Flags: PHYSICS_VIOLATION, TEMPORAL_ANOMALY
  
  TEST 2 PASSED - Fraud detected
```

#### 🎤 NARRATION (Test 2)

> "**Test 2: Fraud detection.** Inflated power reading - the **physics check fails**, status **FLAGGED**, trust score only **0.605**. **Fraud correctly detected.**"

---

#### ON SCREEN
```
[TEST 3] Environmental Violation Detection
  Status: FLAGGED
  Trust Score: 0.8006
  Environmental Check: FAIL
  Flags: ENVIRONMENTAL_ANOMALY
  
  TEST 3 PASSED - Environmental violation detected
```

#### 🎤 NARRATION (Test 3)

> "**Test 3: Environmental violation.** pH 4.5 is too acidic, turbidity 180 is too high. **Environmental check fails**, reading flagged. **Test 3 PASSED.**"

---

#### ON SCREEN
```
[TEST 4] Zero-Flow Fraud Detection
  API Response: The remote server returned an error: (400) Bad Request.
  
  TEST 4 PASSED - Zero-flow fraud blocked
```

#### 🎤 NARRATION (Test 4)

> "**Test 4: Zero-flow fraud.** Claiming power generation with no water flow - **physically impossible**. API **rejects with 400 error**. **Test 4 PASSED.**"

---

#### ON SCREEN
```
[TEST 5] Multi-Plant Isolation
  PLANT-ALPHA TX: 0.0.6255927@1772736663.938619556
  PLANT-BETA TX:  0.0.6255927@1772736665.783521019
  
  TEST 5 PASSED - Multi-plant isolation verified
```

#### 🎤 NARRATION (Test 5)

> "**Test 5: Multi-plant isolation.** Readings from **PLANT-ALPHA and PLANT-BETA** are processed independently with **separate transaction IDs**. No cross-contamination. **Test 5 PASSED.**"

---

#### ON SCREEN
```
[TEST 6] Replay Attack Prevention
  First submission: APPROVED
  Second submission: Blocked (expected)
  
  TEST 6 PASSED - Replay protection working
```

#### 🎤 NARRATION (Test 6)

> "**Test 6: Replay attack prevention.** Submitting the same reading twice - **first approved, second rejected** as duplicate. **Temporal verification working.** **Test 6 PASSED.**"

---

### 📺 Step 4.4: Test Summary
**[9:00 - 9:30] | 30 seconds**

#### ON SCREEN
```
========================================================
              TESTING COMPLETE
========================================================

Test Results:
  [OK] TEST 1: PASSED
  [OK] TEST 2: PASSED
  [OK] TEST 3: PASSED
  [OK] TEST 4: PASSED
  [OK] TEST 5: PASSED
  [OK] TEST 6: PASSED

Summary: 6/6 tests passed

[OK] ALL TESTS PASSED - PRODUCTION READY!
```

#### 🎤 NARRATION

> "**All six production tests passed.** The system correctly:"
> - "Approves valid readings"
> - "Blocks fraud and physics violations"
> - "Monitors environmental parameters"
> - "Prevents zero-flow fraud"
> - "Isolates multi-plant data"
> - "Stops replay attacks"

> "This is a **production-ready** digital MRV system."

#### 💬 SUBTITLE
```
✅ 6/6 Tests PASSED
✅ Fraud Detection: Working
✅ Environmental Monitoring: Working
✅ Replay Protection: Working
✅ Multi-Plant Isolation: Working
```

*[Pause 2 seconds]*

---

## 🔍 SECTION 5: ON-CHAIN VERIFICATION
**[9:30 - 12:30] | 3 minutes**

---

### 📺 Step 5.1: HashScan Topic Overview
**[9:30 - 10:00] | 30 seconds**

#### 🎤 NARRATION

> "Now let's verify everything on-chain using **HashScan** - Hedera's public blockchain explorer."

*[Switch to browser tab: HashScan HCS Topic]*
*[URL: https://hashscan.io/testnet/topic/0.0.7462776]*

#### ON SCREEN
```
HashScan - HCS Topic 0.0.7462776
[List of recent messages with timestamps]
```

#### 🎤 NARRATION

> "This is **HCS topic 0.0.7462776** - our **immutable audit log**. Every reading submitted to the system appears here."

*[Scroll to show multiple messages]*

> "You can see all the messages from our demo and test runs. Each message is a complete attestation with verification results."

#### 💬 SUBTITLE
```
HashScan Explorer
HCS Topic: 0.0.7462776 (Audit Log)
All readings permanently logged
```

---

### 📺 Step 5.2: Approved Reading Deep Dive
**[10:00 - 11:00] | 60 seconds**

#### 🎤 NARRATION

> "Let me open one of the **approved readings**."

*[Click on a message with APPROVED status]*
*[Message details page loads]*
*[Click "View Message" to expand JSON]*

#### ON SCREEN (JSON structure)
```json
{
  "reading_id": "RDG-PLANT-ALPHA-XXXX",
  "plant_id": "PLANT-ALPHA",
  "device_id": "TURBINE-001",
  "timestamp": 1772736502634,
  "status": "APPROVED",
  "trust_score": 0.985,
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
    "flags": []
  },
  "carbon_credits": {
    "methodology": "ACM0002",
    "ER_tCO2": 0.72,
    "EF_grid_tCO2_per_MWh": 0.8,
    "EG_MWh": 0.9
  },
  "hedera": {
    "transaction_id": "0.0.6255927@1772736502.634551909",
    "topic_id": "0.0.7462776",
    "consensus_timestamp": "2026-03-06T00:15:02.634Z"
  }
}
```

#### 🎤 NARRATION (scroll through JSON)

> "Here's the **complete attestation structure**:"

*[Point to each field]*

- **reading_id**: "Unique reading identifier"
- **status: APPROVED**: "Status is **APPROVED**"
- **trust_score: 0.985**: "Trust score **0.985** - passed all verification layers"
- **readings object**: "Original sensor data: flow rate, head, power generation, pH, turbidity, temperature"
- **verification object**: "Verification results: **physics check PERFECT, environmental check PASS, no flags**"
- **carbon_credits object**: "Carbon credits calculation: **ACM0002 methodology, 0.72 tons CO2 equivalent**"
- **hedera object**: "Hedera transaction metadata: transaction ID, consensus timestamp"

> "**Everything needed to audit this reading** is here on-chain, **permanently and publicly**."

#### 💬 SUBTITLE
```
Approved Reading Attestation
✅ Status: APPROVED
✅ Trust Score: 0.985
✅ Physics: PERFECT
✅ Carbon Credits: 0.72 tCO₂ (ACM0002)
✅ All data verifiable on-chain
```

---

### 📺 Step 5.3: Fraud Reading Examination
**[11:00 - 11:45] | 45 seconds**

#### 🎤 NARRATION

> "Now let's look at one of the **fraud attempts**."

*[Go back to topic, find a FLAGGED/REJECTED message]*
*[Click on it, view message]*

#### ON SCREEN (Fraud message JSON - partial)
```json
{
  "status": "FLAGGED",
  "trust_score": 0.605,
  "verification": {
    "physics_check": "FAIL",
    "flags": ["PHYSICS_VIOLATION", "TEMPORAL_ANOMALY"]
  }
  // Note: No carbon_credits object
}
```

#### 🎤 NARRATION

*[Point to fields]*

- **status: FLAGGED**: "Status **FLAGGED** - not approved for carbon credits"
- **trust_score: 0.605**: "Trust score **0.605** - below threshold"
- **physics_check: FAIL**: "Physics check: **FAIL**"
- **flags array**: "Flags: **PHYSICS_VIOLATION** - reported power exceeds theoretical maximum"
- **No carbon_credits**: "Notice: **no carbon_credits object** - no credits issued for fraudulent readings"

> "But critically, this fraud attempt is **preserved as evidence**. Auditors can see that the system **detected and rejected** it. **Full transparency.**"

#### 💬 SUBTITLE
```
Fraud Attempt Attestation
❌ Status: FLAGGED
❌ Trust Score: 0.605 (below threshold)
❌ Physics: FAIL
⚠️ Flags: PHYSICS_VIOLATION
✅ Evidence preserved on-chain
```

---

### 📺 Step 5.4: HREC Token Verification
**[11:45 - 12:30] | 45 seconds**

#### 🎤 NARRATION

> "Let's verify the **HREC token** on HashScan."

*[Switch to HREC token tab]*
*[URL: https://hashscan.io/testnet/token/0.0.7964264]*

#### ON SCREEN
```
HashScan - Token Details
Token ID: 0.0.7964264
Name: Hedera Renewable Energy Credit
Symbol: HREC
Type: Fungible Common
Decimals: 2
Treasury: 0.0.6255927
Total Supply: [varies]
```

#### 🎤 NARRATION

*[Point to each field]*

- **Token ID**: "0.0.7964264"
- **Name**: "Hedera Renewable Energy Credit"
- **Symbol**: "HREC"
- **Type**: "Fungible Common - standard HTS token"
- **Decimals**: "2 decimals"
- **Treasury**: "0.0.6255927 - our operator account"

*[Scroll to transactions if visible]*

> "Each **mint transaction** corresponds to an **approved HCS attestation**. The amount minted equals the carbon credits calculated in tons CO2 equivalent, **multiplied by 100** for the two decimal places."

> "For example, 0.72 tCO2 becomes 72 HREC tokens."

#### 💬 SUBTITLE
```
HREC Token (Carbon Credits)
📊 Token ID: 0.0.7964264
📊 Type: Fungible (HTS)
📊 Decimals: 2
📊 1 HREC = 0.01 tCO₂
✅ Minted only for approved readings
```

*[Pause 2 seconds]*

---

## 💰 SECTION 6: COST ANALYSIS
**[12:30 - 14:00] | 1.5 minutes**

---

### 📺 Step 6.1: Run Cost Model
**[12:30 - 12:45] | 15 seconds**

#### 🎤 NARRATION

> "Now let me show you the **cost comparison** that proves our **97.59% cost reduction claim**."

*[Switch back to PowerShell]*

#### COMMAND
```powershell
node scripts/show-cost-model.js
```

#### 💬 SUBTITLE
```
Running Cost Model...
```

---

### 📺 Step 6.2: Explain Traditional Costs
**[12:45 - 13:15] | 30 seconds**

#### ON SCREEN
```
======================================================================
  HEDERA HYDROPOWER dMRV — COST MODEL COMPARISON
======================================================================

📊 TRADITIONAL MRV SYSTEM (Annual Costs)

  Third-Party Auditor Visits:        $60,000
  Manual Data Management:            $67,500
  Certification & Compliance:        $20,000
  Carbon Credit Issuance Fees:       $37,500
  Legal & Consulting:                $18,000
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TRADITIONAL TOTAL (Annual):        $203,000
```

#### 🎤 NARRATION

> "**Traditional MRV systems** for a 6-megawatt hydropower plant:"

*[Point to each line]*

- "Third-party auditor visits: **$60,000 per year** - four quarterly visits at $15,000 each"
- "Manual data management: **$67,500** - that's 1.5 full-time staff"
- "Certification and compliance: **$20,000** for ISO 14064 and renewals"
- "Carbon credit issuance fees: **$37,500** at $2.50 per ton for 15,000 tons"
- "Legal and consulting: **$18,000**"

*[Point to total]*

> "**Total: $203,000 per year**"

#### 💬 SUBTITLE
```
Traditional MRV Costs (Annual)
💰 Auditors: $60,000
💰 Staff: $67,500
💰 Compliance: $20,000
💰 Issuance: $37,500
💰 Legal: $18,000
━━━━━━━━━━━━━━━
💰 TOTAL: $203,000/year
```

---

### 📺 Step 6.3: Explain Hedera Costs
**[13:15 - 13:45] | 30 seconds**

#### ON SCREEN
```
⚡ HEDERA dMRV SYSTEM (Annual Costs)

  HCS Telemetry Anchoring:           $10.51
  HREC Token Minting:                $16.00
  Device DID Management:             $0.00
  Infrastructure (VPS + Monitoring): $360.00
  Human Oversight (0.1 FTE):         $4,500.00
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HEDERA dMRV TOTAL (Annual):        $4,886.51
```

#### 🎤 NARRATION

> "Compare that to our **Hedera dMRV system**:"

*[Point to each line]*

- "HCS telemetry anchoring: **$10.51** - that's 105,000 readings at $0.0001 each"
- "HREC token minting: **$16** - 15,000 tokens at $0.001 each"
- "Device DID management: **essentially free** - amortized over 10 years"
- "Infrastructure: **$360** for VPS and monitoring"
- "Human oversight: **$4,500** - just 0.1 full-time equivalent for monitoring"

*[Point to total]*

> "**Total: $4,886.51 per year**"

#### 💬 SUBTITLE
```
Hedera dMRV Costs (Annual)
⚡ HCS: $10.51
⚡ HTS: $16.00
⚡ Infrastructure: $360.00
⚡ Human: $4,500.00
━━━━━━━━━━━━━━━
⚡ TOTAL: $4,886.51/year
```

---

### 📺 Step 6.4: Savings Summary
**[13:45 - 14:00] | 15 seconds**

#### ON SCREEN
```
💰 COST SAVINGS ANALYSIS

  Traditional MRV Annual Cost:       $203,000
  Hedera dMRV Annual Cost:           $4,886.51
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ANNUAL SAVINGS:                    $198,113.49
  COST REDUCTION:                    97.59%
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

======================================================================
  🏆 RESULT: 97.59% COST REDUCTION WITH HEDERA dMRV
======================================================================
```

#### 🎤 NARRATION

> "**Annual savings: $198,113** - that's **97.59% cost reduction**."

*[Pause 1 second]*

> "And critically, this isn't just cost savings. We're actually **improving the quality and auditability** of the verification process with **automated 5-layer checks** and **permanent on-chain records**."

#### 💬 SUBTITLE
```
🏆 COST REDUCTION: 97.59%
💰 Savings: $198,113.49/year
✅ Traditional: $203,000
✅ Hedera dMRV: $4,886.51
```

*[Pause 2 seconds]*

---

## 🎯 SECTION 7: CONCLUSION
**[14:00 - 15:00] | 1 minute**

---

### 📺 Step 7.1: Summary
**[14:00 - 14:45] | 45 seconds**

#### COMMAND (Optional - visual summary)
```powershell
Write-Host "`n══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DEMONSTRATION COMPLETE - KEY ACHIEVEMENTS" -ForegroundColor Cyan  
Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ COST REDUCTION:     97.59% ($203k → $4.9k/year)" -ForegroundColor Green
Write-Host "✅ ACM0002 COMPLIANCE:  Carbon credits per UNFCCC methodology" -ForegroundColor Green
Write-Host "✅ REAL CARBON CREDITS: HTS tokens, 1:1 MWh backing" -ForegroundColor Green
Write-Host "✅ REAL dMRV SYSTEM:    Automated M-R-V, on-chain audit trail" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Live Evidence:" -ForegroundColor White
Write-Host "   • HCS Topic:  0.0.7462776 (all readings immutable)" -ForegroundColor Gray
Write-Host "   • HREC Token: 0.0.7964264 (fungible credits)" -ForegroundColor Gray
Write-Host "   • Test Suite: 6/6 passed (fraud detection working)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Verify Yourself:" -ForegroundColor White
Write-Host "   HashScan: https://hashscan.io/testnet/topic/0.0.7462776" -ForegroundColor Cyan
Write-Host "   GitHub:   https://github.com/BikramBiswas786/Hedera-..." -ForegroundColor Cyan
Write-Host ""
Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
```

#### 🎤 NARRATION

> "Let me summarize what we've demonstrated:"

*[Pause, let visual appear]*

> "**Four core claims, all proven with live evidence:**"

> "**1. Cost Reduction: 97.59%** - from $203,000 to less than $5,000 per year"

> "**2. ACM0002 Compliance** - carbon credits calculated per UNFCCC methodology for grid-connected renewable energy"

> "**3. Real Carbon Credits** - HTS tokens with 1-to-1 megawatt-hour backing, minted only for approved readings"

> "**4. Real dMRV System** - automated Monitoring, Reporting, and Verification with complete on-chain audit trail"

*[Pause 1 second]*

> "All live on Hedera testnet:"
> - "HCS Topic 0.0.7462776 - every reading logged"
> - "HREC Token 0.0.7964264 - fungible carbon credits"
> - "6 out of 6 production tests passed - fraud detection working"

#### 💬 SUBTITLE
```
✅ 4 CLAIMS PROVEN
1️⃣ 97.59% Cost Reduction
2️⃣ ACM0002 Compliant
3️⃣ Real Carbon Credits (HTS)
4️⃣ Real dMRV (Automated M-R-V)

📊 All Verifiable On-Chain
```

---

### 📺 Step 7.2: Call to Action
**[14:45 - 15:00] | 15 seconds**

#### 🎤 NARRATION

> "**Everything you've seen is reproducible.** The complete auditor guide with step-by-step verification instructions is in the repository documentation."

> "Independent auditors can **run the same commands, verify the same on-chain transactions, and validate all four claims**."

> "This is **production-grade digital MRV for hydropower** - automated, transparent, and cost-effective."

> "Thank you."

#### 💬 SUBTITLE (End Card)
```
🔗 Verify Yourself:

HashScan Explorer:
https://hashscan.io/testnet/topic/0.0.7462776

GitHub Repository:
https://github.com/BikramBiswas786/
  Hedera-hydropower-dMRV-with-5-layer-verification-

Complete Auditor Guide:
docs/ULTIMATE_AUDITOR_GUIDE.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Production-Grade Digital MRV
Hedera Hydropower dMRV
Apex Hackathon 2026
```

*[Hold end card for 5 seconds]*

---

# 🎬 END RECORDING

---

## 📋 POST-RECORDING CHECKLIST

### ✅ Quality Check
- [ ] Audio is clear throughout
- [ ] All HashScan URLs are visible and readable
- [ ] Terminal text is large enough (readable at 720p)
- [ ] Key numbers are emphasized (97.59%, 100% trust, etc.)
- [ ] No long awkward pauses (trim if needed)
- [ ] Cursor movements help guide viewer attention

### ✅ Editing (Optional)
- [ ] Add title slide at beginning (5 seconds)
- [ ] Add transition effects between sections (subtle)
- [ ] Add zoom-in for key moments (trust scores, transaction IDs)
- [ ] Add on-screen annotations for complex concepts
- [ ] Add background music (low volume, non-distracting)
- [ ] Add end card with contact/links (10 seconds)

### ✅ Export Settings
- [ ] Resolution: 1920×1080 (1080p)
- [ ] Format: MP4 (H.264)
- [ ] Frame rate: 30 fps
- [ ] Bitrate: 5-10 Mbps (high quality)
- [ ] Audio: AAC, 192 kbps

### ✅ Upload
- [ ] YouTube (if public)
- [ ] Vimeo (if private link needed)
- [ ] Include timestamps in description
- [ ] Add link to GitHub repository
- [ ] Add link to HashScan topic
- [ ] Add hashtags: #Hedera #dMRV #CarbonCredits #Blockchain

---

## ⚠️ TROUBLESHOOTING DURING RECORDING

### If Demo Fails

**Symptom:** `npm run demo` throws errors

**Solution:**
```powershell
# Verify .env
cat .env

# Check network
ping hedera.com

# Re-run
npm run demo
```

**Narration:** "Let me verify the configuration... [fix]... and re-run."

---

### If Tests Show 0/0

**Solution:** Start API server

```powershell
npm run start  # Window 1
.\RUN_TESTS.ps1  # Window 2
```

**Narration:** "I need to start the API server first... now tests run correctly."

---

### If HashScan Slow

**Narration:** "HashScan is loading... all this data is permanent and publicly accessible."

---

## 📊 ALTERNATIVE: SHORTER 8-MINUTE VERSION

### Condensed Timeline

| Section | Time | Changes |
|---------|------|----------|
| Intro | 0:00-0:30 | Same |
| Setup | 0:30-1:30 | Show clone/install only, skip verification |
| Demo | 1:30-4:00 | Narrate while running, skip detailed physics |
| Tests | 4:00-5:30 | Show final 6/6 result only |
| HashScan | 5:30-6:30 | One approved, one fraud, quick |
| Cost | 6:30-7:30 | Just show 97.59% headline |
| Conclusion | 7:30-8:00 | Quick summary |

---

## 💡 PRESENTATION TIPS

### Voice
- **Pace:** Conversational but professional
- **Clarity:** Articulate technical terms clearly
- **Emphasis:** Vocal stress on key numbers and claims
- **Confidence:** If something loads slowly, keep talking

### Cursor
- **Highlight:** Move cursor to emphasize what you're discussing
- **Pause:** Let cursor rest on important values for 1-2 seconds
- **Guide:** Use cursor to "underline" key lines of output

### Timing
- **Pauses:** 2-3 seconds after showing critical data
- **Transitions:** Smooth transitions between sections
- **Pacing:** Faster for setup, slower for key evidence

### Authenticity
- **Real-time:** Show actual loading/waiting (builds credibility)
- **Minor mistakes:** Don't edit out small hiccups (shows it's live)
- **Transparency:** Explain what's happening, even during waits

---

**Document Version:** 3.1  
**Created:** March 6, 2026  
**Type:** Video Production Script  
**Companion Docs:**
- ULTIMATE_AUDITOR_GUIDE.md (technical reference)
- README.md (project overview)
- LIVE_DEMO_RESULTS.md (sample outputs)

---

**Ready to record? Follow this script exactly for a compelling 15-minute demo that proves all four claims with verifiable on-chain evidence. 🚀**
