# Operator Guide: How to Test Hedera Hydropower MRV

**Last Updated:** February 21, 2026  
**Status:** Testnet - Safe for Testing, No Real Money Required

---

## ⚠️ **Important: This is a Testnet System**

Before you start, understand what this means:

- ✅ **Safe to Test:** No real money involved, all transactions use free testnet tokens
- ✅ **Public Data:** Everything you submit is visible on [Hedera Testnet Explorer](https://hashscan.io/testnet)
- ✅ **No Legal Validity:** Testnet carbon credits are for testing only, not real offsets
- ✅ **Free to Use:** Hedera testnet tokens are free from the faucet
- ⚠️ **Not Production:** This is for evaluation purposes before committing to real deployment

**If you need production-ready MRV with legal validity, contact us for mainnet deployment after testing.**

---

## 🎯 **Who Should Use This Guide**

- **Hydropower Plant Operators** — Want to test automated MRV vs manual audits
- **Project Developers** — Evaluating blockchain MRV for carbon credit projects
- **Carbon Credit Buyers** — Need to verify authenticity of seller claims
- **Auditors/Consultants** — Assessing new verification technologies
- **Researchers** — Studying blockchain applications in renewable energy

---

## 📋 **Prerequisites**

Before starting, you need:

### Required
- [ ] Basic computer knowledge (can use terminal/command prompt)
- [ ] Internet connection (stable, at least 1 Mbps)
- [ ] Computer with:
  - Windows 10/11, macOS 10.15+, or Linux
  - 4GB RAM minimum
  - 1GB free disk space
- [ ] 30 minutes of uninterrupted time

### Optional (For Real Sensor Integration)
- [ ] Access to your plant's SCADA system
- [ ] Sensor data (flow rate, head height, power generation)
- [ ] Network access from plant to internet

---

## 🚀 **Quick Start: 3 Testing Methods**

### **Method 1: Web API Testing (Easiest - 5 Minutes)**

**Best for:** First-time users, non-technical operators

**What you'll test:** Submit sensor readings via web API and see real blockchain verification

**Limitations:** Uses our hosted server, not your own infrastructure

---

### **Method 2: Local Installation (Recommended - 15 Minutes)**

**Best for:** Technical operators who want full control

**What you'll test:** Run the entire system on your computer, see how it works internally

**Limitations:** Requires technical setup (we provide automated scripts)

---

### **Method 3: Production Pilot (Comprehensive - 90 Days)**

**Best for:** Serious evaluation before purchase decision

**What you'll test:** Connect to your real plant sensors, run parallel to manual MRV

**Limitations:** Requires hardware (Raspberry Pi or similar), 90-day commitment

---

## 📖 **Method 1: Web API Testing**

### Step 1: Understanding the Live System

**Our testnet system is running at:**
- **API Base URL:** `https://hydropower-mrv-19feb26.vercel.app`
- **Health Check:** https://hydropower-mrv-19feb26.vercel.app/api/status
- **Hedera Account:** `0.0.6255927` ([View on HashScan](https://hashscan.io/testnet/account/0.0.6255927))
- **Audit Topic:** `0.0.7462776` ([View Messages](https://hashscan.io/testnet/topic/0.0.7462776))
- **HREC Token:** `0.0.7964264` ([View Token](https://hashscan.io/testnet/token/0.0.7964264))

### Step 2: Get API Key

**For Demo Testing (No Approval Needed):**
```
API Key: ghpk_demo_key_001
```

**Note:** This demo key is rate-limited (10 requests per minute) and shared among all testers.

**For Dedicated Testing (Requires Approval):**
1. Open GitHub Issue: https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/issues/new
2. Title: "Request API Key for Testing"
3. Provide:
   - Organization name
   - Plant location (optional)
   - Expected testing volume (readings per day)
   - Testing duration (days/weeks)
4. You'll receive a dedicated API key within 24 hours

### Step 3: Test with Real Browser (No Code Required)

#### 3A. Check System Health

**Open in your browser:**
```
https://hydropower-mrv-19feb26.vercel.app/api/status
```

**You should see:**
```json
{
  "status": "operational",
  "hedera": {
    "account": "0.0.6255927",
    "network": "testnet",
    "balance": "..."
  },
  "resources": {
    "audit_topic": "0.0.7462776",
    "rec_token": "0.0.7964264"
  }
}
```

**If you see this, the system is online.** ✅

#### 3B. Run Live Demo

**Open in your browser:**
```
https://hydropower-mrv-19feb26.vercel.app/api/demo
```

**This will execute a 6-step demo:**
1. Register device identity
2. Link to HREC token
3. Submit normal reading → APPROVED
4. Submit fraudulent reading → REJECTED
5. Mint carbon credits (for approved only)
6. Show audit trail on Hedera

**You'll see real HashScan URLs** — click them to verify on blockchain!

### Step 4: Submit Your Own Test Reading

#### Using Command Line (Windows PowerShell)

**Open PowerShell** (press Win + X, select "Windows PowerShell")

**Copy and paste this:**

```powershell
# Test 1: Submit a VALID reading
$headers = @{
    "x-api-key"    = "ghpk_demo_key_001"
    "Content-Type" = "application/json"
}

$body = @{
    plant_id  = "TEST-PLANT-$(Get-Random -Maximum 9999)"
    device_id = "TURBINE-TEST-1"
    readings  = @{
        flowRate     = 2.5          # m³/s - reasonable for small hydro
        head         = 45           # meters - typical head height
        generatedKwh = 900          # kWh - matches physics
        timestamp    = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        pH           = 7.2          # neutral water
        turbidity    = 10           # clear water (NTU)
    }
} | ConvertTo-Json

Write-Host "Submitting valid reading..." -ForegroundColor Cyan
$response = Invoke-RestMethod `
    -Uri https://hydropower-mrv-19feb26.vercel.app/api/v1/telemetry `
    -Method POST `
    -Headers $headers `
    -Body $body

# Display results
Write-Host "`nStatus: $($response.status)" -ForegroundColor $(if($response.status -eq 'APPROVED'){'Green'}else{'Red'})
Write-Host "Trust Score: $($response.trust_score * 100)%" -ForegroundColor Cyan
Write-Host "Carbon Credits: $($response.carbon_credits.amount_tco2e) tCO2e" -ForegroundColor Yellow
Write-Host "Hedera TX: $($response.hedera.hashscan_url)" -ForegroundColor Magenta
Write-Host "`nClick the Hedera TX link to see your transaction on the blockchain!" -ForegroundColor Green
```

**Expected Result:**
```
Status: APPROVED
Trust Score: 100%
Carbon Credits: 0.72 tCO2e
Hedera TX: https://hashscan.io/testnet/transaction/0.0.6255927@...
```

**Click the HashScan URL** to see your transaction permanently recorded on Hedera blockchain!

---

#### Test 2: Submit a FRAUDULENT reading (to test AI detection)

```powershell
# Test 2: Submit an INFLATED reading (fraud attempt)
$body = @{
    plant_id  = "TEST-PLANT-$(Get-Random -Maximum 9999)"
    device_id = "TURBINE-TEST-1"
    readings  = @{
        flowRate     = 2.5
        head         = 45
        generatedKwh = 9000       # ← 10x INFLATED! Physics impossible
        timestamp    = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        pH           = 7.2
        turbidity    = 10
    }
} | ConvertTo-Json

Write-Host "Submitting fraudulent reading (10x inflated power)..." -ForegroundColor Yellow
$response = Invoke-RestMethod `
    -Uri https://hydropower-mrv-19feb26.vercel.app/api/v1/telemetry `
    -Method POST `
    -Headers $headers `
    -Body $body

# Display results
Write-Host "`nStatus: $($response.status)" -ForegroundColor $(if($response.status -eq 'APPROVED'){'Green'}else{'Red'})
Write-Host "Trust Score: $($response.trust_score * 100)%" -ForegroundColor Cyan
Write-Host "Carbon Credits: $($response.carbon_credits)" -ForegroundColor Yellow
Write-Host "Physics Check: $($response.verification_details.physics_check)" -ForegroundColor Red
Write-Host "Hedera TX: $($response.hedera.hashscan_url)" -ForegroundColor Magenta
Write-Host "`nNotice: AI caught the fraud! Trust score dropped, no credits issued." -ForegroundColor Red
```

**Expected Result:**
```
Status: FLAGGED
Trust Score: 65%
Carbon Credits: null
Physics Check: FAIL
Hedera TX: https://hashscan.io/testnet/transaction/0.0.6255927@...
```

**The fraud attempt is permanently recorded on blockchain as evidence!**

---

#### Using Command Line (Linux/Mac)

```bash
# Test 1: Valid reading
curl -X POST https://hydropower-mrv-19feb26.vercel.app/api/v1/telemetry \
  -H "x-api-key: ghpk_demo_key_001" \
  -H "Content-Type: application/json" \
  -d '{
    "plant_id": "TEST-PLANT-'$RANDOM'",
    "device_id": "TURBINE-1",
    "readings": {
      "flowRate": 2.5,
      "head": 45,
      "generatedKwh": 900,
      "timestamp": '$(date +%s%3N)',
      "pH": 7.2,
      "turbidity": 10
    }
  }'
```

---

### Step 5: Understanding the Response

#### Successful Verification (APPROVED)
```json
{
  "status": "APPROVED",           // ← Reading passed all checks
  "trust_score": 1.0,              // ← 100% confidence (1.0 = 100%)
  "reading_id": "RDG-...",         // ← Unique identifier
  "timestamp": 1771653532209,
  
  "hedera": {
    "transaction_id": "0.0.6255927@1771653525.644096977",
    "topic_id": "0.0.7462776",
    "hashscan_url": "https://hashscan.io/testnet/transaction/..."
  },
  
  "carbon_credits": {
    "amount_tco2e": 0.72,          // ← CO2 offset calculated
    "generated_mwh": 0.9,          // ← Energy verified
    "ef_grid": 0.8,                // ← Grid emission factor
    "methodology": "ACM0002"       // ← UN CDM standard
  },
  
  "verification_details": {
    "physics_check": "PERFECT",    // ← Power matches physics formula
    "temporal_check": "FIRST_READING",
    "environmental_check": "PASS", // ← pH/turbidity normal
    "trust_score": 1.0,
    "flags": []                    // ← No warnings
  }
}
```

#### Failed Verification (FLAGGED/REJECTED)
```json
{
  "status": "FLAGGED",             // ← Suspicious, needs review
  "trust_score": 0.65,              // ← Only 65% confidence
  "reading_id": "RDG-...",
  
  "hedera": {
    "transaction_id": "...",       // ← Still recorded on blockchain!
    "hashscan_url": "..."          // ← Fraud evidence preserved
  },
  
  "carbon_credits": null,           // ← NO CREDITS ISSUED
  
  "verification_details": {
    "physics_check": "FAIL",       // ← Power exceeds physical limits
    "temporal_check": "FIRST_READING",
    "environmental_check": "PASS",
    "trust_score": 0.65,
    "flags": []                     // ← Could list specific issues
  }
}
```

**Key Insight:** Both approved AND rejected readings go on blockchain. This creates permanent fraud evidence.

---

### Step 6: Verify on Hedera Blockchain

**Every response includes a `hashscan_url`. Click it!**

You'll see:
1. **Transaction ID** — Unique identifier
2. **Timestamp** — Exact time (UTC)
3. **Topic ID** — Where it's stored (0.0.7462776)
4. **Message Content** — Your reading data + verification result
5. **Consensus** — Confirmed by Hedera network (3-5 seconds)

**This is proof your data is on a public blockchain, not a private database.**

---

### Step 7: View All Transactions

**See ALL readings (from all users) on Hedera:**

https://hashscan.io/testnet/topic/0.0.7462776/message

**You'll see:**
- Every reading submitted since launch
- Approved and rejected readings
- Trust scores for each
- Carbon credits calculated

**This is complete transparency** — you can audit the entire system publicly.

---

## 📖 **Method 2: Local Installation**

### Why Run Locally?

- ✅ **Full Control:** Run your own instance, no reliance on hosted API
- ✅ **Data Privacy:** Sensor data doesn't leave your network (except Hedera transactions)
- ✅ **Customization:** Modify code, add features, integrate with your systems
- ✅ **Learning:** See exactly how the AI verification engine works

### Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/en/download/)
- **Git** — [Download](https://git-scm.com/downloads)
- **Text Editor** — VS Code, Notepad++, or any code editor

### Step 1: Clone Repository

**Open Terminal/PowerShell:**

```bash
# Clone the code
git clone https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv.git

# Navigate to folder
cd https-github.com-BikramBiswas786-hedera-hydropower-mrv
```

### Step 2: Automated Setup (Windows)

```powershell
# Run automated setup script
.\setup-local-production.ps1
```

**This script will:**
1. Check Node.js version
2. Install dependencies (npm install)
3. Copy `.env.production` to `.env`
4. Show your Hedera account info
5. Run tests to verify installation

**Expected Output:**
```
=== Hedera Hydropower MRV - Local Production Setup ===

[1/5] Checking prerequisites...
[OK] Node.js v24.13.0 found
[OK] npm 11.6.2 found

[2/5] Installing dependencies...
[OK] Dependencies installed

[3/5] Setting up production environment...
[OK] .env file created from .env.production

[4/5] Configuration summary:

  Hedera Account:  0.0.6255927
  Explorer:        https://hashscan.io/testnet/account/0.0.6255927
  HCS Audit Topic: 0.0.7462776
  HREC Token:      0.0.7964264

[5/5] Setup complete!
```

### Step 2 (Alternative): Manual Setup (Linux/Mac)

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.production .env

# Verify .env contents
cat .env
```

**You should see:**
```bash
# Hedera Configuration
HEDERA_OPERATOR_ID=0.0.6255927
HEDERA_OPERATOR_KEY=302e02...
AUDIT_TOPIC_ID=0.0.7462776
REC_TOKEN_ID=0.0.7964264

# Configuration
EF_GRID=0.8
VALID_API_KEYS=ghpk_demo_key_001,ghpk_test_key_002
```

**Note:** The `.env.production` file contains shared testnet credentials. These are safe to use for testing.

### Step 3: Run Tests (Verify Installation)

```bash
npm test
```

**Expected Output:**
```
Test Suites: 10 passed, 10 total
Tests:       224 passed, 224 total
Snapshots:   0 total
Time:        18.456 s
Coverage:    85.3% statements | 82.7% branches | 88.9% functions

✓ All tests passed!
```

**If tests fail:**
1. Check Node.js version: `node --version` (must be 18+)
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check `.env` file exists and has correct format

### Step 4: Start API Server

```bash
npm run api
```

**Expected Output:**
```
[dotenv@17.3.1] injecting env (17) from .env
✓ Hedera Hydropower MRV API running on port 3000
✓ Health: http://localhost:3000/health
✓ Metrics: http://localhost:3000/metrics
✓ API Docs: http://localhost:3000/
```

**Server is now running!** Keep this terminal window open.

### Step 5: Test Local API

**Open a NEW terminal window** and test:

```bash
# Health check
curl http://localhost:3000/health

# Submit test reading
curl -X POST http://localhost:3000/api/v1/telemetry \
  -H "x-api-key: ghpk_demo_key_001" \
  -H "Content-Type: application/json" \
  -d '{
    "plant_id": "LOCAL-TEST",
    "device_id": "TURBINE-1",
    "readings": {
      "flowRate": 2.5,
      "head": 45,
      "generatedKwh": 900,
      "timestamp": '$(date +%s%3N)',
      "pH": 7.2,
      "turbidity": 10
    }
  }'
```

**You should see the same JSON response as the hosted API.**

**Check the server terminal** — you'll see logs:
```
POST /api/v1/telemetry 200 42ms
✓ Reading verified: APPROVED (trust: 1.0)
✓ Hedera TX: 0.0.6255927@1771653525.644096977
```

### Step 6: Run Complete Demo

```bash
# Stop the API server (Ctrl+C)

# Run 6-step demo
npm run demo
```

**This executes:**
1. Device DID registration
2. HREC token linking
3. Normal reading → APPROVED
4. Fraud reading → REJECTED
5. Carbon credit minting
6. Audit trail summary

**You'll see real HashScan URLs for every step.**

### Step 7: Explore the Code

**Key Files:**

```
src/
├── api/
│   ├── server.js              ← REST API endpoints
│   └── routes/
│       └── telemetry.js       ← Telemetry submission logic
├── engine/
│   └── v1/
│       └── engine-v1.js       ← 5-layer AI verification engine
├── workflow.js                ← Orchestration (ties everything together)
└── hedera/
    ├── hcs-client.js          ← Hedera Consensus Service
    └── hts-client.js          ← Hedera Token Service
```

**Try modifying the AI weights:**

Open `src/engine/v1/engine-v1.js`, find line ~50:

```javascript
const LAYER_WEIGHTS = {
  physics: 0.30,        // ← Change to 0.50 (prioritize physics)
  temporal: 0.25,
  environmental: 0.20,
  statistical: 0.15,
  device: 0.10
};
```

Save, restart API, retest — see how trust scores change!

---

## 📖 **Method 3: Production Pilot (90-Day Shadow Operation)**

### Overview

This is the **most realistic test** before committing to full deployment. Your plant runs normal operations while our system runs in parallel, collecting the same sensor data.

**At the end of 90 days, we compare:**
- Our AI verification vs. your manual audit
- If delta < 5%, system is validated ✅
- If delta > 5%, we identify issues and fix (no charge)

### Prerequisites

#### From Your Side
- [ ] Hydropower plant with 1-15 MW capacity
- [ ] Existing SCADA system (Modbus, OPC UA, or HTTP API)
- [ ] Sensor data: flow rate, head height, power generation (minimum)
- [ ] Network: 4G/WiFi with 1GB/month data
- [ ] Budget: ₹38K-63K for 90-day pilot
- [ ] Staff: 2 days of technical support for setup

#### We Provide
- [ ] Edge gateway device (Raspberry Pi 4 or industrial PC)
- [ ] Pre-configured software with auto-updates
- [ ] Hedera testnet account (free)
- [ ] 90-day monitoring and support
- [ ] Final validation report with accuracy analysis

### Step 1: Application

**Fill this form:**

https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/issues/new?template=pilot

**Required Information:**
- Plant name and location
- Installed capacity (MW)
- Turbine type (Francis, Kaplan, Pelton, etc.)
- SCADA system details (vendor, protocol)
- Current MRV process (manual/automated?)
- Network connectivity (4G/broadband?)
- Expected start date

### Step 2: Feasibility Assessment (1 Week)

We'll review:
1. **Sensor Compatibility** — Can we read your SCADA data?
2. **Network Requirements** — Is bandwidth sufficient?
3. **Integration Effort** — How complex is the setup?
4. **Timeline** — When can we start?

**Deliverable:** Feasibility report + go/no-go decision

### Step 3: Hardware Procurement (1 Week)

**Option A: We Provide (Recommended)**
- Raspberry Pi 4 (4GB RAM) + enclosure
- Pre-installed MRV software
- 4G dongle (if needed)
- **Cost:** ₹15,000 (one-time)

**Option B: You Provide**
- Any Linux-capable device (x86 or ARM)
- Minimum: 2GB RAM, 16GB storage, Ethernet/WiFi
- We ship SD card with software
- **Cost:** ₹5,000 (software license)

### Step 4: Installation & Integration (1 Week)

**We'll configure:**
1. SCADA protocol adapter (Modbus, OPC UA, HTTP)
2. Data polling frequency (5-15 minute intervals)
3. Hedera testnet credentials
4. API keys and authentication
5. Dashboard access (Grafana, optional)

**You'll provide:**
1. SCADA IP address and credentials (read-only access)
2. Network connectivity (Ethernet or 4G SIM)
3. Power outlet (24/7 uptime)
4. Physical security for gateway device

**Deliverable:** Working gateway pushing data to our system

### Step 5: Shadow Operation (90 Days)

**What Happens:**
- Gateway reads sensors every 15 minutes
- Sends data to Hedera MRV API
- AI verifies each reading
- Results recorded on Hedera blockchain
- You continue manual MRV as usual

**Monitoring:**
- Weekly reports emailed to you
- Real-time dashboard access (optional)
- Alerts if gateway goes offline
- Monthly check-in calls

**No Disruption:**
- Read-only access to SCADA (no control)
- Separate network (isolated from operations)
- Can be turned off anytime

### Step 6: Validation & Reporting (Week 13)

**We'll compare:**

| Metric | Manual MRV | Hedera MRV | Delta |
|---|---|---|---|
| Total Energy (MWh) | 1,234.5 | 1,228.3 | -0.5% |
| Carbon Credits (tCO2e) | 987.6 | 982.6 | -0.5% |
| Rejected Readings | 0 | 12 | N/A |
| Audit Trail Gaps | 3 incidents | 0 | 100% improvement |

**Success Criteria:**
- Energy delta < 5%
- Carbon delta < 5%
- Zero false positives (legit readings rejected)
- 99%+ Hedera transaction success rate

**Deliverable:** 30-page validation report + decision recommendation

### Step 7: Go-Live Decision

**Option A: Continue to Mainnet**
- Migrate to Hedera mainnet (real HBAR tokens)
- Connect to carbon registry (Verra, Gold Standard)
- Start issuing real carbon credits
- Monthly subscription: ₹5K-15K depending on volume

**Option B: Extend Pilot**
- Need more time to evaluate?
- Continue on testnet for another 90 days
- Additional cost: ₹20,000

**Option C: Discontinue**
- No obligations, stop anytime
- Keep the hardware (it's yours)
- Source code is open source (MIT license)

---

## ❓ **Frequently Asked Questions**

### General

**Q: Is this real or just a demo?**  
**A:** Both. The blockchain integration is real (verify on [HashScan](https://hashscan.io/testnet/topic/0.0.7462776)). However, we're on Hedera testnet, so the carbon credits are not legally valid offsets. For production use, we migrate to mainnet.

**Q: Is testnet data public?**  
**A:** Yes. Everything submitted to Hedera testnet is publicly visible on HashScan. Do NOT submit confidential plant data. Use anonymized values (e.g., "PLANT-001" instead of real plant name).

**Q: What does it cost?**  
**A:** Testing is FREE (testnet tokens are free). Production costs:
- Hedera fees: $0.0001 per reading (~₹30,000/year for 15-min intervals)
- Our service: ₹5,000-15,000/month depending on volume
- Total: ₹90K-210K/year vs ₹5 lakh manual MRV

**Q: Do I need blockchain knowledge?**  
**A:** No. The system handles all blockchain interactions. You just submit sensor data via API.

**Q: Can I use my own Hedera account?**  
**A:** Yes! For production, we recommend you control your own account. For testing, our shared account is fine.

### Technical

**Q: What sensors do I need?**  
**A:** Minimum: flow rate, head height, power generation. Optional: pH, turbidity, temperature (improves accuracy).

**Q: What SCADA protocols are supported?**  
**A:** Modbus TCP/RTU, OPC UA, HTTP REST API, MQTT. Custom protocols can be added (2-3 days).

**Q: Can I run this on my own server?**  
**A:** Yes. Open source MIT license. Deploy anywhere: AWS, Azure, on-premise, Raspberry Pi.

**Q: What happens if internet goes down?**  
**A:** Gateway queues readings locally (up to 7 days). When online, syncs to Hedera. No data loss.

**Q: How is this different from traditional MRV?**  
**A:** Traditional = manual audits every quarter. This = automated verification every 15 minutes + blockchain proof.

### Security & Privacy

**Q: Who can see my plant data?**  
**A:** On testnet: everyone (public blockchain). On mainnet: you can use private HCS topics (only authorized parties see data).

**Q: Can the AI be fooled?**  
**A:** We've tested 10x power inflation — detected and rejected. Physics validation catches impossible readings. However, sophisticated attacks (e.g., tampering with flow sensors) require hardware security.

**Q: What if I disagree with AI decision?**  
**A:** Flagged readings go to manual review. You can dispute via API. All disputes logged on blockchain.

**Q: Is my Hedera private key safe?**  
**A:** On testnet: shared key is acceptable (low risk). On production: you control your key, stored in HSM (hardware security module) recommended.

### Business

**Q: Do I get real carbon credits from this?**  
**A:** On testnet: no (test credits only). On mainnet: yes, after integrating with carbon registry (Verra, Gold Standard).

**Q: What's the ROI?**  
**A:** Manual MRV: ₹5 lakh/year. Automated MRV: ₹1.5-2.5 lakh/year. ROI: 50-70% cost reduction = ₹2.5-3.5 lakh/year savings.

**Q: Can I white-label this?**  
**A:** Yes. We offer white-label licensing for ₹5 lakh one-time. You get full source code + branding rights.

**Q: What if Hedera shuts down?**  
**A:** Hedera is governed by 39 global enterprises (Google, IBM, Boeing). Unlikely to shut down. Even if it did, we can migrate to another blockchain (code is chain-agnostic).

---

## 📞 **Support & Contact**

### For Testing Issues
- **GitHub Issues:** https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/issues
- **Response Time:** 24-48 hours

### For Pilot Inquiries
- **Email:** (Provided after pilot application)
- **Response Time:** 1 week feasibility assessment

### For Technical Documentation
- **API Docs:** https://github.com/BikramBiswas786/.../docs/API.md
- **MRV Methodology:** https://github.com/BikramBiswas786/.../docs/MRV-METHODOLOGY.md
- **Setup Guide:** https://github.com/BikramBiswas786/.../QUICK_START.md

---

## ✅ **Testing Checklist**

Before deciding on production deployment, you should:

- [ ] Test Method 1 (Web API) — Verify blockchain integration is real
- [ ] Submit valid reading → Get APPROVED status
- [ ] Submit fraudulent reading → Get FLAGGED/REJECTED status
- [ ] Click HashScan URLs → See transactions on public blockchain
- [ ] Test Method 2 (Local) — Understand how system works internally
- [ ] Run `npm test` → See 224 tests passing
- [ ] Run `npm run demo` → See 6-step E2E flow
- [ ] Review source code → Ensure no backdoors/security issues
- [ ] Calculate ROI → Compare vs your manual MRV costs
- [ ] Read ACM0002 docs → Ensure methodology compliance
- [ ] (Optional) Method 3 (Pilot) → 90-day real-world validation

**Once you complete these, you'll have full confidence in the system.**

---

## 🎯 **Next Steps**

### Immediate (Today)
1. Test Web API (Method 1) — 5 minutes
2. Verify transactions on HashScan
3. Understand how it works

### This Week
1. Install locally (Method 2) — 15 minutes
2. Run tests and demo
3. Review source code
4. Calculate your ROI

### This Month
1. Apply for 90-day pilot (Method 3)
2. Get feasibility report
3. Start shadow operation

### This Quarter
1. Complete 90-day validation
2. Review accuracy report
3. Decide: go-live or discontinue

---

## 📄 **Legal Disclaimer**

**Testnet Status:**
- This system runs on Hedera testnet, not mainnet
- Testnet carbon credits have NO legal validity
- DO NOT use for official carbon credit claims
- For production use, mainnet migration is required

**Open Source:**
- MIT License (free to use, modify, distribute)
- No warranty provided (use at your own risk)
- Not audited by third-party security firm (yet)

**Not Financial Advice:**
- We do not guarantee carbon credit prices
- We do not guarantee registry acceptance
- We do not guarantee regulatory compliance in all jurisdictions

**Contact a professional advisor for legal/financial decisions.**

---

**Last Updated:** February 21, 2026  
**Version:** 1.0  
**Feedback:** https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/issues

---

**Ready to start testing? Choose Method 1, 2, or 3 above!** 🚀
