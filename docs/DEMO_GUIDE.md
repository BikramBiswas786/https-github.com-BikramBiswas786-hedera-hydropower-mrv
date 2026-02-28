# Demo Guide for Judges

**Live API:** https://https-github-com-bikram-biswas786-h.vercel.app/

---

## Authentication (Issue 5 fix)

All endpoints require an API key header:

```
x-api-key: demo_key_001
```

---

## Test 1 — Normal Reading (Expected: APPROVED)

```bash
curl -X POST https://https-github-com-bikram-biswas786-h.vercel.app/api/mrv/verify \
  -H "x-api-key: demo_key_001" \
  -H "Content-Type: application/json" \
  -d '{
    "flowRate": 2.5,
    "head": 15.2,
    "generatedKwh": 1250,
    "pH": 7.2,
    "turbidity": 8,
    "temperature": 22
  }'
```

**Expected response:**
```json
{
  "verificationStatus": "APPROVED",
  "trustScore": 0.95,
  "carbonCredits": { "amount_tco2e": 1.025, "methodology": "ACM0002" },
  "fraudDetected": false
}
```

---

## Test 2 — Fraud Reading (Expected: REJECTED)

```bash
curl -X POST https://https-github-com-bikram-biswas786-h.vercel.app/api/mrv/verify \
  -H "x-api-key: demo_key_001" \
  -H "Content-Type: application/json" \
  -d '{
    "flowRate": 500,
    "head": 15.2,
    "generatedKwh": 999999,
    "pH": 7.2,
    "turbidity": 8,
    "temperature": 22
  }'
```

**Expected response:**
```json
{
  "verificationStatus": "REJECTED",
  "trustScore": 0.0,
  "fraudDetected": true,
  "fraudReasons": ["Abnormal generation spike", "Physics deviation >30%"]
}
```

---

## On-Chain Proofs (HashScan)

| What | Link |
|---|---|
| **HCS Audit Topic** (all readings logged) | https://hashscan.io/testnet/topic/0.0.7462776 |
| **HREC Token** (minted credits) | https://hashscan.io/testnet/token/0.0.7964264 |
| **Account** | https://hashscan.io/testnet/account/0.0.6255927 |

---

## Verification Architecture

```
Incoming Telemetry
      │
      ▼
Fraud Detector (pre-screen)
      │
      ▼
EngineV1 — 5-Layer Verification
  Layer 1: Physics (P = ρgQHη)                 weight: 30%
  Layer 2: Temporal consistency                 weight: 25%
  Layer 3: Environmental bounds (pH/turbidity)  weight: 20%
  Layer 4: ML IsolationForest anomaly           weight: 15%
  Layer 5: Device capacity profile              weight: 10%
      │
      ▼
ACM0002 Carbon Calc (ER = BE - PE - LE)
  EF_GRID = 0.82 tCO2/MWh
      │
      ├─ APPROVED → HCS topic message + HREC mint (HTS)
      └─ REJECTED → HCS topic message (fraud logged forever)
```

---

## Default Configuration

| Parameter | Default | Description |
|---|---|---|
| `EF_GRID` | 0.82 tCO2/MWh | Grid emission factor (ACM0002) |
| `autoApproveThreshold` | 0.90 | Trust score required for auto-APPROVE |
| `manualReviewThreshold` | 0.50 | Trust score floor for FLAGGED |
| `deviceProfile.capacity` | 1000 kWh | Max expected generation |
| `deviceProfile.maxFlow` | 10 m³/s | Max expected flow rate |
| `deviceProfile.maxHead` | 500 m | Max expected head height |

---

## Architecture Notes

- **Primary demo path:** `workflow.js → engine-v1.js → MLAnomalyDetector → HCS/HTS`
- **Batch processing path:** `ai-guardian-verifier.js → processBatch → MLAnomalyDetector (Layer 4 override)`
- `src/anomaly-detector.js` = legacy rule-based detector, used for Layers 1/2/3/5 in batch mode
- `src/ml/MLAnomalyDetector.js` = production IsolationForest model (Liu, Ting & Zhou, ICDM 2008)
