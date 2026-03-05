# HEDERA HYDROPOWER dMRV - ULTIMATE COMPLETE AUDITOR & TESTING GUIDE

**Version 3.0 – Evidence-Based Edition**  
**Last Updated:** March 6, 2026  
**System:** Production-Grade Digital MRV for Hydropower Carbon Credits

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Quick Start for Judges & Auditors](#2-quick-start-for-judges--auditors)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Four Core Claims & Evidence](#4-four-core-claims--evidence)
5. [Complete Demo Script (Video Recording)](#5-complete-demo-script-video-recording)
6. [One-Shot Verification Commands](#6-one-shot-verification-commands)
7. [Deep Dive: Verification Engine (5 Layers)](#7-deep-dive-verification-engine-5-layers)
8. [Test Suite Reference](#8-test-suite-reference)
9. [On-Chain Evidence Map](#9-on-chain-evidence-map)
10. [FAQ & Troubleshooting](#10-faq--troubleshooting)
11. [Appendix: Code References](#11-appendix-code-references)

---

## 1. EXECUTIVE SUMMARY

### What This System Does

This is a **production-grade digital MRV (Monitoring, Reporting, Verification) system** for hydropower plants that:

- Accepts sensor telemetry (flow, head, energy, environmental parameters)
- Runs **five automated verification layers** (physics, temporal, environmental, ML/anomaly, consistency)
- Logs every reading (valid or fraudulent) **immutably on Hedera Consensus Service (HCS)**
- Calculates carbon credits using the **ACM0002 methodology** (grid-connected renewable energy)
- Mints fungible **HREC tokens (HTS)** only for approved readings
- Assigns a **decentralized identity (DID)** to each device

### Why This Guide Exists

Judges, auditors, and independent reviewers need **verifiable, falsifiable evidence** for four claims:

1. **97.59% cost reduction** vs traditional MRV (CDM/Verra style)
2. **ACM0002 compliance** (emission reductions calculation)
3. **Real carbon credits** (HTS tokens backed by attested readings)
4. **Real dMRV system** (automated M-R-V with on-chain auditability)

This guide provides:

- **Step-by-step demo script** (what to say, what to run on screen)
- **One-command verification** (`npm run demo`, test suites, cost model)
- **Direct HashScan links** to every on-chain transaction
- **Reproducible test cases** (fraud, environmental violations, replay attacks)

---

## 2. QUICK START FOR JUDGES & AUDITORS

### Prerequisites

- **Node.js** v18+ installed
- **Git** installed
- **PowerShell** (Windows) or **Bash** (Linux/macOS)
- Hedera testnet credentials (provided in `.env`)

### Four Commands That Prove Everything

```bash
# 1) Clone repo and install dependencies
git clone https://github.com/BikramBiswas786/Hedera-hydropower-dMRV-with-5-layer-verification-.git
cd Hedera-hydropower-dMRV-with-5-layer-verification-
npm install

# 2) Full on-chain workflow (DID → valid + fraud → verification)
npm run demo

# 3) Production test suite (6 scenarios)
# IMPORTANT: Start API server first!
# Window 1:
npm run start

# Window 2:
.\RUN_TESTS.ps1    # PowerShell (Windows)
# OR
node scripts/test-suite-complete.js    # Cross-platform

# 4) Cost model (97.59% savings claim)
node scripts/show-cost-model.js
```

**Expected time:** 5–10 minutes total

### What You'll See

- **DID registration** → HashScan link to HCS topic with W3C DID document
- **HREC token** → HashScan link to HTS token (0.0.7964264)
- **Valid reading** → APPROVED, trust score 0.985, ER_tCO2 = 0.72, HCS tx
- **Fraud reading** → FLAGGED, trust score ~0.6, fraud reasons, HCS tx
- **Carbon credit calculation** → ACM0002 formula applied correctly
- **Test results** → All 6 production scenarios PASS
- **Cost comparison** → $4,886.51/year vs $203,000/year traditional MRV

### Verification Checklist

After running the above commands, you can independently verify:

- [ ] DID document exists on Hedera testnet (HCS topic)
- [ ] HREC token exists with correct parameters (name, symbol, decimals)
- [ ] APPROVED reading has `status: "APPROVED"`, `trustScore ≈ 0.985`, `carbon_credits` object
- [ ] REJECTED fraud has `status: "FLAGGED"`, fraud reasons listed
- [ ] HTS mint capability demonstrated (minting logic tied to APPROVED status)
- [ ] All transaction fees visible on HashScan (HCS ≈ $0.0001, HTS mint ≈ $0.001)
- [ ] Test suite shows 6/6 PASS (valid, fraud, environmental, zero-flow, multi-plant, replay)
- [ ] Cost model prints 97.59% reduction with cited sources

---

## 3. SYSTEM ARCHITECTURE OVERVIEW

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     HEDERA TESTNET                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ HCS Topic    │  │ HTS Token    │  │ DID Service  │      │
│  │ 0.0.7462776  │  │ 0.0.7964264  │  │ (HCS-based)  │      │
│  │ (Audit Log)  │  │ (HREC)       │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ HCS submit, HTS mint
                            │
┌─────────────────────────────────────────────────────────────┐
│                   NODE.JS API SERVER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Verification Engine V1 (5 Layers)                   │   │
│  │  - Physics (theoretical power vs reported)           │   │
│  │  - Temporal (time-series consistency, replay check)  │   │
│  │  - Environmental (pH, turbidity, temp ranges)        │   │
│  │  - ML/Statistical (anomaly detection, Z-score)       │   │
│  │  - Consistency (multi-plant isolation, DID check)    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Workflow Module                                     │   │
│  │  - DID deployment                                    │   │
│  │  - Telemetry processing                              │   │
│  │  - Carbon credit calculation (ACM0002)               │   │
│  │  - HTS minting (APPROVED only)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│           PLANT OPERATORS / IOT SENSORS                     │
│  POST /api/v1/telemetry                                     │
│  {                                                           │
│    "plant_id": "PLANT-ALPHA",                               │
│    "device_id": "TURBINE-ALPHA-2026",                       │
│    "readings": {                                            │
│      "flowRate": 2.5, "head": 45.0,                        │
│      "generatedKwh": 900, "pH": 7.2, ...                   │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Sensor telemetry** → API endpoint (`POST /api/v1/telemetry`)
2. **Verification engine** → 5-layer checks, compute trust score (0–1)
3. **Status determination** → APPROVED (≥0.7), FLAGGED (<0.7), REJECTED
4. **HCS logging** → Attestation message (reading + verification results + status)
5. **Carbon calculation** → If APPROVED: `ER = EG_MWh × EF_grid` (ACM0002)
6. **HTS minting** → If APPROVED + trustScore ≥ threshold: mint HREC tokens
7. **Response** → API returns status, trust score, HCS tx ID, carbon credits (if any)

### Key IDs (Hedera Testnet)

- **Operator Account:** `0.0.6255927`
- **HCS Audit Topic:** `0.0.7462776`
- **HREC Token:** `0.0.7964264`
- **Network:** Hedera Testnet
- **Explorer:** https://hashscan.io/testnet

---

## 4. FOUR CORE CLAIMS & EVIDENCE

### 4.1. Claim: 97.59% Cost Reduction

**Traditional MRV (Annual Costs for 6MW Plant):**

- Third-party auditor visits: $60,000 (4 quarterly @ $15,000 each)
- Manual data management: $67,500 (1.5 FTE staff)
- Certification & compliance: $20,000 (ISO 14064, renewals)
- Carbon credit issuance fees: $37,500 ($2.50/tCO2e × 15,000 credits)
- Legal & consulting: $18,000
- **TOTAL: $203,000/year**

**Hedera dMRV System (Annual Costs):**

- HCS telemetry anchoring: $10.51 (105,120 readings @ $0.0001)
- HREC token minting: $16.00 (15,000 tokens @ $0.001)
- Device DID management: $0.00 (amortized 10yr)
- Infrastructure (VPS + monitoring): $360.00
- Human oversight (0.1 FTE): $4,500.00
- **TOTAL: $4,886.51/year**

**Cost Reduction:** `(203,000 - 4,886.51) / 203,000 × 100% = 97.59%`

**Evidence:**

- Run `node scripts/show-cost-model.js` → prints detailed breakdown
- Sources cited: Hedera fee schedule, Verra/Gold Standard benchmarks, World Bank 2024
- Check `LIVE_DEMO_RESULTS.md` → table of real HCS tx IDs with fees from HashScan

### 4.2. Claim: ACM0002 Compliance

**Methodology:** ACM0002 – Consolidated methodology for grid-connected electricity generation from renewable sources (UNFCCC)

**Formula:**
```
ER_y = EG_y × EF_grid,y - PE_y - LE_y
```

Where:
- `ER_y` = Emission reductions (tCO₂e)
- `EG_y` = Electricity generated and fed to grid (MWh)
- `EF_grid,y` = Grid emission factor (tCO₂/MWh)
- `PE_y` = Project emissions (≈0 for hydro)
- `LE_y` = Leakage emissions (≈0 for hydro)

**Our Implementation:**

For India grid: `EF_grid = 0.8 tCO₂/MWh`

Example (900 kWh reading):
```
EG = 900 kWh = 0.9 MWh
ER = 0.9 × 0.8 - 0 - 0 = 0.72 tCO₂e
```

**Evidence:**

- API response includes:
  ```json
  "carbon_credits": {
    "methodology": "ACM0002",
    "ER_tCO2": 0.72,
    "EF_grid_tCO2_per_MWh": 0.8,
    "EG_MWh": 0.9
  }
  ```
- HCS attestation message contains same fields (verify on HashScan)
- Code reference: `src/workflow.js` → `calculateCarbonCredits()` function
- ACM0002 official documentation available in CDM registry

### 4.3. Claim: Real Carbon Credits

**Definition:** Each HREC token is:

- **Fungible** (HTS standard)
- **Minted only for APPROVED readings** (status check + trust score threshold)
- **1:1 backed by attested ER_tCO2** (visible on-chain)

**Evidence:**

- HREC token page: https://hashscan.io/testnet/token/0.0.7964264
  - Name: Hedera Renewable Energy Credit
  - Symbol: HREC
  - Decimals: 2
  - Total supply = sum of all mints (verifiable)
- Minting logic in `src/workflow.js` enforces:
  - `if (status !== 'APPROVED') { reject mint }`
  - `if (trustScore < threshold) { reject mint }`
- Demo shows: Approved reading → mints tokens; Fraud reading → no mint

### 4.4. Claim: Real dMRV System

**Digital MRV Definition (EBRD Protocol):**

- **Monitoring (M):** Automated sensor data collection
- **Reporting (R):** Structured, machine-readable attestations
- **Verification (V):** Automated rule-based checks with audit trail

**Our Implementation:**

| Component | Evidence |
|-----------|----------|
| **Monitoring** | REST API `/api/v1/telemetry` accepts plant data (flow, head, energy, pH, turbidity, temp) |
| **Reporting** | Every reading → HCS attestation with: inputs, verification results (5 layers), status, trust score, fraud flags, carbon credits |
| **Verification** | 5-layer engine: Physics, Temporal, Environmental, ML/Statistical, Consistency checks |
| **Auditability** | DID for device identity, HCS for immutable logs (every reading including fraud), HTS for credits, public HashScan explorer |
| **Reproducibility** | Full test suite (`RUN_TESTS.ps1`), demo script (`npm run demo`), independent auditor guide |

**Evidence:**

- Check `LIVE_DEMO_RESULTS.md` → approved reading has all MRV fields; fraud reading has FLAGGED status + reasons
- Code: `src/engine/v1/engine-v1.js` → `processReading()` runs all 5 layers sequentially
- Test suite validates all verification layers work correctly

---

## 5. COMPLETE DEMO SCRIPT (VIDEO RECORDING)

**Total time:** 10–12 minutes

**Goal:** Show end-to-end workflow with on-chain evidence for all four claims

### Pre-Recording Setup

**PowerShell Commands:**

```powershell
# Clean slate - navigate to your user folder
cd C:\Users\USER

# Kill any existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear screen for clean recording
cls

# If you already have the repo, navigate to it:
cd Hedera-hydropower-dMRV-with-5-layer-verification-

# OR if starting fresh, clone it:
# git clone https://github.com/BikramBiswas786/Hedera-hydropower-dMRV-with-5-layer-verification-.git
# cd Hedera-hydropower-dMRV-with-5-layer-verification-
# npm install

# Verify environment
cat .env | Select-String "HEDERA"
```

**Expected output:**
```
HEDERA_OPERATOR_ID=0.0.6255927
HEDERA_OPERATOR_KEY=302...
```

**Open browser tabs:**

1. https://hashscan.io/testnet/account/0.0.6255927
2. https://hashscan.io/testnet/topic/0.0.7462776
3. https://hashscan.io/testnet/token/0.0.7964264
4. https://github.com/BikramBiswas786/Hedera-hydropower-dMRV-with-5-layer-verification-

**Start screen recording** (1080p, mic on)

---

### Demo Steps

#### Step 1: Full Live Demo

**SAY:**
> "I'm running the complete live demo that shows DID registration, valid telemetry, fraud detection, and carbon credit calculation."

**PowerShell:**

```powershell
npm run demo
```

**Expected output:**

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

STEP 2: HREC Token (Hedera Token Service)
  ✅ Token ID  : 0.0.7964264
  ✅ Token Name: HREC (1 token = 1 verified MWh)
  ℹ  HashScan  : https://hashscan.io/testnet/token/0.0.7964264

STEP 3: Telemetry #1 — NORMAL reading
  Flow 12.5 m³/s | Head 45.2 m | Eff 0.88
  Expected: 4.878 MW | Reported: 4.87 MW
  Trust Score: 100% → APPROVED
  ✅ TX: 0.0.6255927@1772733584.348234779
  ℹ  HashScan: https://hashscan.io/testnet/transaction/...
  ✅ Reading anchored to Hedera HCS

STEP 4: Telemetry #2 — FRAUD ATTEMPT
  Flow 12.5 m³/s | Head 45.2 m | Eff 0.88
  Expected: 4.878 MW | Reported: 9.5 MW  ← INFLATED
  Trust Score: 60% → REJECTED
  ✅ TX: 0.0.6255927@1772733585.901458595
  ✅ Fraud REJECTED — evidence preserved on-chain

STEP 5: HREC Minting (approved reading only)
  Verified MWh : 4.87
  CO₂ credits  : 3.896 tCO₂ (EF_GRID=0.8)
  HREC tokens  : 4.87 (1 token = 1 MWh)
  ✅ 4.87 HREC minted

Demo complete.
```

**SAY while showing:**
- "DID created for device identity"
- "HREC token is live on Hedera testnet"
- "Valid reading: APPROVED with 100% trust score and carbon credits calculated"
- "Fraud reading: REJECTED with 60% trust score, permanently logged on HCS"
- "All transactions are verifiable on HashScan"

---

#### Step 2: Production Test Suite

**SAY:**
> "Now I'll run the complete 6-test production suite. First, I need to start the API server."

**Open NEW PowerShell window** (keep first one visible)

**Window 1 (API Server):**

```powershell
cd C:\Users\USER\Hedera-hydropower-dMRV-with-5-layer-verification-
npm run start
```

**Expected output:**
```
Server started on port 3000
EngineV1 Initialized with Hedera account: 0.0.6255927
```

**SAY:**
> "Server is running. Now I'll run the tests in the other window."

**Switch to Window 2 (Tests):**

```powershell
cd C:\Users\USER\Hedera-hydropower-dMRV-with-5-layer-verification-
.\RUN_TESTS.ps1
```

**Expected output:**

```
========================================================
  HEDERA HYDROPOWER dMRV - COMPLETE TEST SUITE
========================================================

[TEST 1] Valid APPROVED Telemetry
  Status: APPROVED
  Trust Score: 0.985
  TEST 1 PASSED

[TEST 2] Fraud Detection - Inflated Power
  Status: FLAGGED
  TEST 2 PASSED - Fraud detected

[TEST 3] Environmental Violation Detection
  Status: FLAGGED
  TEST 3 PASSED - Environmental violation detected

[TEST 4] Zero-Flow Fraud Detection
  TEST 4 PASSED - Zero-flow fraud blocked

[TEST 5] Multi-Plant Isolation
  TEST 5 PASSED - Multi-plant isolation verified

[TEST 6] Replay Attack Prevention
  TEST 6 PASSED - Replay protection working

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

**SAY:**
> "All 6 production scenarios pass: valid readings, fraud detection, environmental monitoring, zero-flow protection, multi-plant isolation, and replay attack prevention."

---

#### Step 3: Cost Model

**SAY:**
> "Now I'll show the cost comparison that proves our 97.59% reduction claim."

**PowerShell:**

```powershell
node scripts/show-cost-model.js
```

**Expected output:**

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

⚡ HEDERA dMRV SYSTEM (Annual Costs)

  HCS Telemetry Anchoring:           $10.51
  HREC Token Minting:                $16.00
  Device DID Management:             $0.00
  Infrastructure (VPS + Monitoring): $360.00
  Human Oversight (0.1 FTE):         $4,500.00
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HEDERA dMRV TOTAL (Annual):        $4,886.51

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

**SAY:**
> "This shows the dramatic cost reduction from $203,000 per year to less than $5,000 per year - that's 97.59% savings while maintaining full MRV compliance."

---

#### Step 4: HashScan Evidence

**Switch to browser** → HashScan topic tab
**URL:** https://hashscan.io/testnet/topic/0.0.7462776

**SAY while scrolling through messages:**
- "Every reading is permanently logged on Hedera HCS"
- "Approved readings show full verification details and carbon credits"
- "Fraud attempts are flagged and preserved as evidence"
- "All data is publicly auditable on HashScan"

**Click on one approved message:**

**SAY while pointing:**
- "Status: APPROVED"
- "Trust score: 0.985 - passed all 5 verification layers"
- "Carbon credits calculation: 0.72 tons CO2 equivalent using ACM0002 methodology"
- "Transaction ID and timestamp - permanent blockchain record"

**Click on one fraud message:**

**SAY while pointing:**
- "Status: FLAGGED"
- "Physics violation flag - reported power exceeded theoretical maximum"
- "Lower trust score: 0.605"
- "No carbon credits issued - but fraud attempt is preserved as evidence"

---

## 6. ONE-SHOT VERIFICATION COMMANDS

### For PowerShell (Windows)

```powershell
# Navigate to your user folder
cd C:\Users\USER

# Clone (if not already cloned)
git clone https://github.com/BikramBiswas786/Hedera-hydropower-dMRV-with-5-layer-verification-.git
cd Hedera-hydropower-dMRV-with-5-layer-verification-
npm install

# Verify credentials exist
cat .env | Select-String "HEDERA"

# Run all verification
npm run demo

# For tests - need TWO windows:
# Window 1: npm run start
# Window 2: .\RUN_TESTS.ps1

# Cost model
node scripts/show-cost-model.js
```

### For Bash (Linux/macOS)

```bash
# Navigate to home
cd ~

# Clone (if not already cloned)
git clone https://github.com/BikramBiswas786/Hedera-hydropower-dMRV-with-5-layer-verification-.git
cd Hedera-hydropower-dMRV-with-5-layer-verification-
npm install

# Verify credentials
grep HEDERA .env

# Run all verification
npm run demo
node scripts/test-suite-complete.js
node scripts/show-cost-model.js
```

---

## 7-11. [Rest of sections remain the same as before]

---

**Document Version:** 3.1  
**Focus:** Fixed Section 5 with correct Windows paths  
**Last Updated:** March 6, 2026  
**Key Fix:** Replaced `C:\path\to\` with actual `C:\Users\USER\` path
