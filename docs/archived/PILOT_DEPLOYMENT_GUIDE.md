# Pilot Deployment Guide: Real Hydropower Plant Integration

**Target Audience:** 5-15 MW runofriver hydropower plant operators  
**Deployment Model:** 3-month shadow mode pilot (zero risk, parallel to existing MRV)  
**Total Cost:** ₹53,000 - ₹78,000 (vs ₹1.25 lakh for manual consultant MRV)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Shadow Mode Setup (Week 1-2)](#phase-1-shadow-mode-setup)
4. [Phase 2: Data Collection & Calibration (Week 3-6)](#phase-2-data-collection--calibration)
5. [Phase 3: Validation & Audit (Week 7-10)](#phase-3-validation--audit)
6. [Phase 4: Production Cutover (Week 11-12)](#phase-4-production-cutover)
7. [Cost Breakdown](#cost-breakdown)
8. [Success Criteria](#success-criteria)
9. [Troubleshooting](#troubleshooting)
10. [Support & Contact](#support--contact)

---

## Executive Summary

### What is Shadow Mode?

**Shadow mode** means the automated MRV system runs **in parallel** with your existing manual MRV process:
- Your consultants continue their quarterly audits (no disruption)
- Our system **observes** sensor data and generates attestations
- At the end, we compare automated vs. manual results
- **Zero financial risk:** Only pay if accuracy >95%

### Why This Approach?

| Risk Factor | Traditional Deployment | Shadow Mode Pilot |
|-------------|------------------------|-------------------|
| **Carbon Credit Risk** | High (new system might fail) | Zero (consultants still signing) |
| **Audit Acceptance** | Uncertain | Proven (manual audit runs parallel) |
| **Cost** | Full commitment | Pay-per-validation after proof |
| **Timeline** | 6-12 months | 3 months to decision |

### Pilot Outcome Scenarios

| Scenario | Likelihood | Next Steps |
|----------|------------|------------|
| **Accuracy >95%** | 70% (based on simulations) | Cut over to automated MRV, save ₹5-7L/year |
| **Accuracy 90-95%** | 20% | Tune parameters, extend pilot 1 month |
| **Accuracy <90%** | 10% | Investigate (likely sensor calibration issue) |

---

## Prerequisites

### Technical Requirements

#### 1. Existing SCADA/Monitoring System
Your plant should already be measuring:
- **Flow rate** (m³/s) – via ultrasonic/electromagnetic flow meter
- **Head** (m) – via pressure transducers or level sensors
- **Power output** (kW) – via energy meter at generator terminals
- **Water quality** (optional) – pH, turbidity, temperature probes

**Supported Protocols:**
- Modbus RTU/TCP (most common in India)
- OPC-UA
- REST API (if SCADA has web interface)
- CSV export (manual upload fallback)

#### 2. Internet Connectivity
- **Minimum:** 512 kbps upload (4G/LTE or fiber)
- **Data usage:** ~500 MB/month (for 5-minute telemetry intervals)
- **Reliability:** >95% uptime (edge agent buffers during outages)

#### 3. Edge Gateway Hardware

**Option A: Budget Setup (₹15,000)**
- Raspberry Pi 4 Model B (8GB RAM)
- Industrial microSD card (64GB, high endurance)
- DIN-rail case for control panel mounting
- 4G modem (if no plant WiFi)

**Option B: Industrial Setup (₹40,000)**
- Advantech UNO-2484G or similar
- Fanless, -20°C to +70°C operating temp
- DIN-rail mount, 12-48V DC input
- Built-in 4G modem

**Option C: Software-Only (Virtual)**
- Install agent on existing plant PC/server
- No additional hardware cost
- Requires Windows 10/11 or Ubuntu 20.04+

### Organizational Requirements

- **Plant Access:** 2 site visits (initial setup + mid-pilot calibration)
- **Data Sharing:** Real-time sensor data (no commercial secrets, just operational metrics)
- **Audit Comparison:** Share 1 quarter of manual MRV reports for validation
- **Decision Authority:** O&M manager approval to proceed after pilot

---

## Phase 1: Shadow Mode Setup (Week 1-2)

### Step 1.1: Pre-Deployment Survey (Remote, 1 hour)

**We need to understand:**
1. Plant capacity and turbine configuration
2. Existing SCADA system (make/model, protocols)
3. Sensor locations and accuracy specs
4. Current MRV process (who does it, how often, cost)

**Action:** Fill out [Plant Survey Form](./docs/PLANT_SURVEY_TEMPLATE.md)

### Step 1.2: Hardware Procurement (3-5 days)

**If using Option A (Raspberry Pi):**
```bash
# Shopping list
- Raspberry Pi 4 (8GB): ₹8,500
- SanDisk High Endurance 64GB: ₹1,200
- DIN-rail case: ₹1,500
- Quectel EC25 4G modem: ₹3,800
- Total: ₹15,000
```

**If using Option B (Advantech):**
- Order from Advantech India distributor
- Lead time: 7-10 days
- Cost: ₹40,000 all-inclusive

### Step 1.3: Edge Agent Installation (On-site, 4 hours)

**For Raspberry Pi / Ubuntu:**
```bash
# 1. Download and install agent
curl -sSL https://raw.githubusercontent.com/BikramBiswas786/.../install.sh | bash

# 2. Configure with your API key
sudo mrv-agent configure \
  --api-key="mrv_pilot_<your_key>" \
  --plant-id="alaknanda-hpp" \
  --plant-capacity-mw=5.6 \
  --location="30.2833,79.3167"

# 3. Set up sensor mappings
sudo mrv-agent add-sensor \
  --id="flow_meter_01" \
  --type="modbus_tcp" \
  --host="192.168.1.50" \
  --register=3000 \
  --format="float32" \
  --unit="m3/s"

sudo mrv-agent add-sensor \
  --id="power_meter_01" \
  --type="modbus_tcp" \
  --host="192.168.1.51" \
  --register=4000 \
  --format="uint32" \
  --unit="kW"

# 4. Test connectivity
sudo mrv-agent test-submit
# Expected: "OK - Telemetry received, status: APPROVED, score: 0.95"

# 5. Start service
sudo systemctl enable mrv-agent
sudo systemctl start mrv-agent
sudo systemctl status mrv-agent
```

**For Windows:**
```powershell
# Download installer
Invoke-WebRequest -Uri "https://github.com/.../mrv-agent-win-x64.msi" -OutFile "mrv-agent.msi"

# Install
msiexec /i mrv-agent.msi /qn

# Configure (use MRV Agent GUI)
C:\Program Files\MRV Agent\configure.exe

# Start service
Start-Service MRVAgent
```

### Step 1.4: Verify Data Flow (Remote, 1 hour)

**Check dashboard:** https://hydropower-mrv.vercel.app/dashboard/alaknanda-hpp

You should see:
- ✅ Device status: Online
- ✅ Last telemetry: <5 minutes ago
- ✅ Verification status: APPROVED (or FLAGGED for first few readings)
- ✅ Hedera anchoring: Transaction IDs visible

**If not working:** See [Troubleshooting](#troubleshooting) section

---

## Phase 2: Data Collection & Calibration (Week 3-6)

### Week 3-4: Baseline Data Collection

**Goal:** Collect 2 weeks of clean data to train plant-specific models

**Automated:**
- Edge agent submits telemetry every 5 minutes (288 readings/day)
- MRV system logs all verifications (APPROVED/FLAGGED/REJECTED)
- Hedera anchoring creates immutable audit trail

**Manual (by plant O&M team):**
- Note any abnormal events (turbine shutdown, grid outage, maintenance)
- Log these in the dashboard "Events" tab
- This helps us filter out valid operational modes

### Week 5: Mid-Pilot Calibration (On-site, 4 hours)

**Review accuracy:**
```bash
# Generate calibration report
mrv-agent calibration-report --period="2026-02-01:2026-02-14"
```

**Typical issues and fixes:**

| Issue | Symptom | Fix |
|-------|---------|-----|
| **High rejection rate** | 30%+ readings rejected | Adjust physics model for plant-specific efficiency |
| **Flow sensor drift** | Power output higher than expected | Recalibrate flow meter or add correction factor |
| **Time sync errors** | "Future timestamp" warnings | Install NTP client on edge gateway |
| **Intermittent connectivity** | Gaps in data | Increase buffer size or add 4G failover |

**Calibration adjustments:**
```bash
# Adjust turbine efficiency baseline
mrv-agent set-parameter --key="turbine.efficiency.baseline" --value=0.87

# Set flow meter correction factor
mrv-agent set-parameter --key="flow.correction_factor" --value=1.05

# Adjust physics tolerance
mrv-agent set-parameter --key="physics.tolerance_percent" --value=15
```

### Week 6: Extended Monitoring

**Goal:** Achieve >90% APPROVED rate for 1 week straight

**Success metrics:**
- <10% rejection rate
- <5% flagged-for-review rate
- ≥99% Hedera transaction success
- <30s average verification latency

---

## Phase 3: Validation & Audit (Week 7-10)

### Step 3.1: Export Automated MRV Report

```bash
# Generate quarterly report
mrv-agent export-report \
  --start="2026-02-01" \
  --end="2026-04-30" \
  --format="pdf" \
  --include-hashscan-links \
  --output="automated_mrv_q1_2026.pdf"
```

**Report includes:**
- Total verified generation (kWh)
- Carbon credits eligible (tCO2e)
- Trust score distribution
- Hedera transaction links for every APPROVED reading
- ACM0002 methodology compliance checklist

### Step 3.2: Compare with Manual Audit

**Request from your consultant:**
- Manual MRV report for same quarter (Q1 2026)
- Raw data used (flow logs, power meter readings)

**Comparison table:**

| Metric | Manual MRV | Automated MRV | Delta | Acceptable? |
|--------|-----------|---------------|-------|-------------|
| **Total Generation (MWh)** | 2,450 | 2,438 | -0.5% | ✅ Yes (<2%) |
| **Carbon Credits (tCO2)** | 2,009 | 1,999 | -0.5% | ✅ Yes |
| **Data Coverage** | 100% | 99.2% | -0.8% | ✅ Yes |
| **Audit Trail** | Excel sheets | Blockchain | N/A | ✅ Stronger |
| **Cost** | ₹1.25L | ₹0 (pilot) | -100% | ✅ Yes |

**Acceptance threshold:** ±2% delta on carbon credits

### Step 3.3: Third-Party Audit (Optional, Week 9-10)

**Recommended for:** Plants seeking CDM/Gold Standard registration

**Process:**
1. Hire independent verifier (e.g., DNV, TUV SUD)
2. Provide:
   - Automated MRV report
   - Hedera blockchain evidence
   - Sensor calibration certificates
   - Edge agent configuration
3. Verifier confirms:
   - Methodology compliance (ACM0002)
   - Data integrity (blockchain anchoring)
   - Sensor accuracy (±5% per CDM requirements)

**Cost:** ₹50,000 - ₹1,00,000 (one-time)

---

## Phase 4: Production Cutover (Week 11-12)

### Decision Gate: Continue or Pause?

**Continue to production if:**
- [x] Accuracy ≥95% vs. manual audit
- [x] Hedera success rate ≥99%
- [x] No major operational issues
- [x] Cost savings clear (₹5-7L/year)

**Pause if:**
- [ ] Accuracy <90%
- [ ] Frequent sensor failures
- [ ] Plant O&M team uncomfortable with automation

### Step 4.1: Contract Signing

**Subscription model:**

| Tier | Monthly Cost | Included |
|------|--------------|----------|
| **Pilot** | ₹0 (3 months) | Up to 50K readings/month, testnet only |
| **Production** | ₹12,000/month | Mainnet anchoring, 200K readings/month, 99.5% SLA |
| **Enterprise** | Custom | Multi-plant, dedicated support, custom integrations |

**Annual contract:** ₹1,25,000/year (vs ₹5,00,000 for manual MRV)

### Step 4.2: Mainnet Migration

**Differences from testnet:**
- Transaction fees: ~₹0.0001 per HCS message (~₹30/month for 5-min intervals)
- Operator account: Your own Hedera account (we'll help set up)
- HREC tokens: Mintable on mainnet HTS

**Migration steps:**
```bash
# 1. Create mainnet operator account
mrv-agent hedera create-account \
  --network="mainnet" \
  --initial-balance=100 # 100 HBAR ~₹700

# 2. Create HCS topic
mrv-agent hedera create-topic \
  --name="Alaknanda HPP MRV Audit Trail" \
  --memo="ACM0002 verified hydropower generation"

# 3. Create HTS token (HREC)
mrv-agent hedera create-token \
  --name="Alaknanda HREC" \
  --symbol="ALAK-HREC" \
  --decimals=3 \
  --initial-supply=0 # Mint on demand

# 4. Switch agent to mainnet
mrv-agent configure --network="mainnet"
mrv-agent restart
```

### Step 4.3: Consultant Transition

**New role for your MRV consultant:**
- Quarterly spot-check audits (1 day instead of 5 days)
- Review automated reports for anomalies
- Certify blockchain evidence for registries

**Cost reduction:**
- Manual MRV: ₹1,25,000/quarter = ₹5,00,000/year
- Automated + spot checks: ₹1,25,000/year + ₹50,000/quarter spot check = ₹3,25,000/year
- **Savings: ₹1,75,000/year (35% reduction)**

---

## Cost Breakdown

### Pilot Phase (3 Months)

| Item | Option A (Budget) | Option B (Industrial) |
|------|-------------------|------------------------|
| **Hardware** | ₹15,000 (RPi + 4G) | ₹40,000 (Advantech) |
| **4G Data** | ₹500/month x 3 = ₹1,500 | Included |
| **Installation** | ₹10,000 (1 day on-site) | ₹10,000 |
| **Mid-pilot calibration** | ₹10,000 (1 day on-site) | ₹10,000 |
| **Software** | ₹0 (free pilot) | ₹0 |
| **Support** | ₹0 (Slack/email) | ₹0 |
| **Third-party audit** | ₹50,000 (optional) | ₹50,000 (optional) |
| **TOTAL (without audit)** | **₹53,000** | **₹78,000** |
| **TOTAL (with audit)** | **₹1,03,000** | **₹1,28,000** |

**Compare to:**
- Manual MRV: ₹1,25,000/quarter
- **ROI if pilot successful:** Recover costs in <1 quarter

### Production Phase (Annual)

| Item | Cost | Notes |
|------|------|-------|
| **SaaS subscription** | ₹1,25,000/year | Includes 200K readings/month, 99.5% SLA |
| **Hedera fees** | ₹360/year | ~₹30/month for HCS messages |
| **Consultant spot checks** | ₹50,000/quarter | 4 days/year vs 20 days/year before |
| **Hardware maintenance** | ₹5,000/year | Replace SD card, modem SIM |
| **TOTAL** | **₹3,25,360/year** | |

**Compare to manual MRV:** ₹5,00,000/year  
**Annual savings:** ₹1,74,640 (35%)

---

## Success Criteria

### Technical KPIs

| Metric | Target | Measured How |
|--------|--------|---------------|
| **Data Coverage** | ≥99% | (Readings received / Expected readings) |
| **Approval Rate** | ≥90% | (APPROVED / Total readings) |
| **Hedera Success** | ≥99% | (Successful HCS txs / Attempted txs) |
| **Verification Latency** | <60s P95 | Time from telemetry submission to verification |
| **Uptime** | ≥99% | Edge agent operational hours / Total hours |

### Business KPIs

| Metric | Target | Measured How |
|--------|--------|---------------|
| **Accuracy vs. Manual** | ±2% | (Automated MWh - Manual MWh) / Manual MWh |
| **Cost Reduction** | >30% | (Manual cost - Automated cost) / Manual cost |
| **Time Savings** | >80% | Hours saved in data collection + reporting |
| **Audit Acceptance** | 100% | Third-party verifier approval |

### Go/No-Go Decision Matrix

| Criterion | Weight | Pass Threshold | Your Score | Weighted Score |
|-----------|--------|----------------|------------|----------------|
| Accuracy vs. Manual | 40% | ≥95% | ___ % | ___ |
| Hedera Success Rate | 20% | ≥99% | ___ % | ___ |
| Uptime | 15% | ≥99% | ___ % | ___ |
| Cost Savings | 15% | >30% | ___ % | ___ |
| O&M Team Satisfaction | 10% | ≥4/5 | ___/5 | ___ |
| **TOTAL** | 100% | **≥85%** | | **___** |

**Decision:**
- ≥90%: Strong go → Production cutover immediately
- 85-90%: Conditional go → Extend pilot 1 month with calibration
- <85%: No-go → Investigate root cause, re-pilot in 3 months

---

## Troubleshooting

### Issue 1: High Rejection Rate (>20%)

**Symptoms:**
- Most readings marked `REJECTED`
- Trust scores consistently <0.50

**Root causes:**
1. **Physics model mismatch**
   - Plant efficiency different from model baseline (0.85)
   - Fix: `mrv-agent set-parameter --key="turbine.efficiency.baseline" --value=<your_efficiency>`

2. **Flow sensor calibration drift**
   - Measured flow × head × efficiency ≠ measured power
   - Fix: Recalibrate flow meter or add correction factor

3. **Turbine operating in partial-load mode**
   - Efficiency curve non-linear at low loads
   - Fix: Add multi-point efficiency curve in config

### Issue 2: Intermittent Connectivity

**Symptoms:**
- Data gaps in dashboard
- "Last seen: 2 hours ago" status

**Fixes:**
1. **Check edge gateway network**
   ```bash
   ping -c 10 8.8.8.8
   ping -c 10 api.hedera-mrv.app
   ```

2. **Increase buffer size**
   ```bash
   mrv-agent set-parameter --key="buffer.max_readings" --value=500
   # Buffers up to 500 readings (~42 hours at 5-min intervals)
   ```

3. **Add 4G failover**
   - Install USB 4G modem as backup
   - Configure automatic failover in network settings

### Issue 3: Hedera Transaction Failures

**Symptoms:**
- `TRANSACTION_EXPIRED` errors in logs
- Hedera success rate <95%

**Fixes:**
1. **Update to latest agent version**
   ```bash
   mrv-agent update
   # Should include exponential retry logic
   ```

2. **Increase operator account balance**
   ```bash
   mrv-agent hedera check-balance
   # Should have >50 HBAR for buffer
   ```

3. **Check Hedera network status**
   - Visit https://status.hedera.com
   - If mainnet issues, transactions will auto-retry

### Issue 4: ML Model Accuracy Low

**Symptoms:**
- ML anomaly detection flagging normal readings
- Fraud detection score unreliable

**Fixes:**
1. **Retrain model on plant-specific data**
   ```bash
   # Export 2 weeks of verified data
   mrv-agent export-training-data \
     --start="2026-02-01" \
     --end="2026-02-14" \
     --filter="status:APPROVED" \
     --output="training_data.csv"
   
   # Train plant-specific model
   mrv-agent ml train \
     --data="training_data.csv" \
     --model="isolation_forest" \
     --contamination=0.05
   
   # Deploy new model
   mrv-agent ml deploy --model="plant_specific_v1"
   ```

2. **Fallback to rule-based detection**
   ```bash
   # Disable ML, use only physics + temporal checks
   mrv-agent set-parameter --key="ml.enabled" --value=false
   ```

---

## Support & Contact

### During Pilot

**Response times:**
- **Critical issues** (system down): 2 hours
- **High priority** (accuracy problems): 8 hours
- **Normal questions**: 24 hours

**Support channels:**
- **Email:** pilot-support@hedera-mrv.app
- **Phone:** +91-XXXX-XXXXXX (Mon-Fri 9am-6pm IST)
- **Slack:** #pilot-alaknanda (shared channel)
- **GitHub Issues:** [Report bug](https://github.com/BikramBiswas786/.../issues/new?template=pilot_issue.md)

### Documentation

- **Installation Guide:** [docs/INSTALLATION.md](./docs/INSTALLATION.md)
- **API Reference:** [docs/api/openapi.yaml](./docs/api/openapi.yaml)
- **Architecture:** [README.md](./README.md)
- **Methodology:** [docs/MRV_METHODOLOGY.md](./docs/MRV_METHODOLOGY.md)

### Emergency Contacts

| Role | Name | Contact |
|------|------|----------|
| **Technical Lead** | Bikram Biswas | bikrambiswas007@gmail.com |
| **On-site Engineer** | TBD | TBD |
| **Hedera Integration** | Bikram Biswas | GitHub: @BikramBiswas786 |

---

## Appendix A: Plant Survey Template

```yaml
plant_info:
  name: "Alaknanda Hydropower Plant"
  operator: "Green Energy Pvt Ltd"
  capacity_mw: 5.6
  location:
    latitude: 30.2833
    longitude: 79.3167
    state: "Uttarakhand"
    river: "Alaknanda"
  type: "runofriver"
  commissioned_year: 2015

turbines:
  - id: "turbine-01"
    type: "Francis"
    capacity_mw: 2.8
    rated_head_m: 45
    rated_flow_m3s: 7.5
  - id: "turbine-02"
    type: "Francis"
    capacity_mw: 2.8
    rated_head_m: 45
    rated_flow_m3s: 7.5

sensors:
  flow:
    - id: "flow_meter_01"
      type: "Ultrasonic"
      manufacturer: "Siemens"
      model: "SITRANS FUS1010"
      location: "Intake channel"
      accuracy: "±2%"
      protocol: "Modbus TCP"
      ip_address: "192.168.1.50"
  
  power:
    - id: "power_meter_01"
      type: "Energy Meter"
      manufacturer: "Schneider Electric"
      model: "PM8000"
      location: "Generator terminals"
      accuracy: "±0.5%"
      protocol: "Modbus TCP"
      ip_address: "192.168.1.51"
  
  water_quality:
    - id: "ph_probe_01"
      type: "pH Sensor"
      manufacturer: "Hach"
      location: "Tailrace"
      accuracy: "±0.1 pH"
      protocol: "4-20mA analog" # Will need ADC converter

network:
  plant_lan:
    type: "Ethernet"
    speed: "100 Mbps"
    vlan_id: 10
  internet:
    provider: "BSNL Fiber"
    speed: "10 Mbps"
    uptime: "95%"
    backup: "Airtel 4G dongle"

current_mrv:
  provider: "ABC Consultants"
  frequency: "Quarterly"
  cost_per_quarter: 125000
  methodology: "ACM0002 v17.0"
  last_audit_date: "2025-12-15"

point_of_contact:
  name: "Rajesh Kumar"
  role: "O&M Manager"
  email: "rajesh@greenergy.com"
  phone: "+91-98XXXXXXXX"
```

---

## Appendix B: Sensor Integration Examples

### Modbus TCP (Most Common)

```javascript
// Auto-detected during mrv-agent setup
{
  "sensor_id": "flow_meter_01",
  "protocol": "modbus_tcp",
  "config": {
    "host": "192.168.1.50",
    "port": 502,
    "unit_id": 1,
    "register": 3000,
    "register_type": "holding",
    "data_type": "float32_le",
    "scale_factor": 1.0,
    "polling_interval_ms": 5000
  }
}
```

### OPC-UA

```javascript
{
  "sensor_id": "power_meter_01",
  "protocol": "opcua",
  "config": {
    "endpoint": "opc.tcp://192.168.1.60:4840",
    "node_id": "ns=2;s=PowerMeter.ActivePower",
    "security_mode": "None",
    "security_policy": "None"
  }
}
```

### CSV Upload (Fallback)

```bash
# For plants with SCADA export but no real-time API
mrv-agent upload-csv \
  --file="daily_generation_2026_02_20.csv" \
  --timestamp-column="DateTime" \
  --flow-column="Flow_m3s" \
  --power-column="Power_kW"
```

---

**Document Version:** 1.0  
**Last Updated:** February 20, 2026  
**Next Review:** March 20, 2026
