# Hedera Hydropower MRV

[![CI Tests](https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/actions/workflows/test.yml/badge.svg)](https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen.svg)](./tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A blockchain-based Measurement, Reporting & Verification (MRV) platform for small-scale hydropower. Uses Hedera for tamper-proof audit trails, runs an AI verification engine to catch fraud, and calculates carbon credits using UN CDM ACM0002 methodology.

Built for the AngelHack Apex 2026 Sustainability Track.

---

## What it does

Small hydropower plants (1-15 MW) have a problem: carbon credit verification costs $15,000-50,000 per project and takes months. A lot of that cost is manual auditing, and 30-40% of claims contain errors or outright fraud.

This system automates the whole thing:
- Reads telemetry from IoT sensors (flow rate, head height, generation, water quality)
- Runs it through a 5-layer AI verification engine
- Writes verified attestations to Hedera's public ledger
- Issues carbon credits as HTS tokens

Cost per verification: ~$0.0001. Time: seconds instead of months.

---

## Live system

**Deployed:** [hydropower-mrv-19feb26.vercel.app] https://https-github-com-bikram-biswas786-h.vercel.app/

**Hedera testnet:**
- Audit topic: [0.0.7462776 on HashScan](https://hashscan.io/testnet/topic/0.0.7462776)
- Carbon credit token: [0.0.7964264 on HashScan](https://hashscan.io/testnet/token/0.0.7964264)
- Account: 0.0.6255927

**What's been verified on-chain:**
- 288+ tests passing, including real Hedera transactions (updated February 2026)
- 165.55 tCO2e minted as real HTS tokens
- Fraud detection working: 10x power inflation caught at 65% trust score
- $0.0001 per transaction on testnet

---

## Quick Start

```bash
git clone https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv.git
cd https-github.com-BikramBiswas786-hedera-hydropower-mrv
npm install
```

For Windows setup:
```powershell
.\setup-local-production.ps1
npm run api
```

Run the demo:
```bash
npm run demo
```

Run tests:
```bash
npm test
```

See [QUICK_START.md](./QUICK_START.md) for the full setup guide.

---

## How it works

```
IoT Sensors (flow rate, head, generation, water quality)
    |
    v
Verification Engine
    1. Physics check       (30%) - P = rho x g x Q x H x eta
    2. Temporal consistency (25%) - no impossible jumps
    3. Environmental bounds (20%) - pH, turbidity, temperature
    4. Statistical anomaly  (15%) - isolation forest ML
    5. Device consistency   (10%) - per-device historical profile
    |
    v
Trust score (0-1.0)
    APPROVED >0.85 | FLAGGED 0.50-0.85 | REJECTED <0.50
    |
    v
Hedera DLT
    - HCS topic: immutable audit log
    - Device DID: identity per turbine
    - HTS token: carbon credit (HREC)
```

---

## Hedera integration

| Service | What it's used for | IDs |
|---------|-------------------|-----|
| Hedera Consensus Service | Audit log for every verified reading | Topic: `0.0.7462776` |
| Hedera Token Service | Carbon credit tokens (HREC) | Token: `0.0.7964264` |
| Hedera DID | Decentralized identity per device | Topic: `0.0.8011563` |
| Hedera Account | Transaction signing | `0.0.6255927` |

**Why Hedera over other chains:**
- 3-5 second finality (vs 10+ minutes on Ethereum)
- $0.0001/tx (vs $5-50 on Ethereum)
- Carbon-negative network
- Public ledger meets regulatory requirements

---

## Testing

```bash
npm test
```

Current results (February 2026):
```
Test Suites: 17 passed, 17 total
Tests:       259 passed, 259 total
Time:        2.576s
```

To run with real Hedera transactions:
```powershell
$env:USE_REAL_HEDERA="true"
npm test
```

This will hit the actual testnet and cost a small amount of HBAR.

---

## Using the API

```javascript
const Workflow = require('./src/workflow');

const wf = new Workflow();
await wf.initialize('PROJ-001', 'TURBINE-1', 0.8);

const result = await wf.submitReading({
  flowRate: 2.5,      // m3/s
  head: 45,           // meters
  generatedKwh: 900,  // kWh
  timestamp: Date.now(),
  pH: 7.2,
  turbidity: 10,
  temperature: 18
});

console.log(result.verificationStatus); // APPROVED / FLAGGED / REJECTED
console.log(result.trustScore);         // 0.0 - 1.0
console.log(result.transactionId);      // Hedera transaction ID
```

---

## Carbon credits

The system implements ACM0002 v18.0 (UN CDM methodology for grid-connected renewable energy):

```
ER = BE - PE - LE

BE = baseline emissions (grid electricity displaced × grid emission factor)
PE = project emissions (0 for run-of-river hydropower)
LE = leakage emissions (0 for grid-connected renewable)
```

Example: 0.9 MWh x 0.8 tCO2e/MWh = 0.72 tCO2e

Verified credits are issued as HREC tokens on Hedera Token Service. Current market rate is ~$15-18/tCO2e with a blockchain verification premium.

### ACM0002 v18.0 Compliance Coverage

| Section | Description | Status |
|---------|-------------|--------|
| Section 4 | Project eligibility | Implemented |
| Section 6-7 | Baseline emissions calculation | Implemented |
| Section 8 | Project emissions calculation | Implemented |
| Section 9 | Leakage emissions calculation | Implemented |
| Section 10 | Emission reductions calculation | Implemented |
| Section 11 | Monitoring parameters | Implemented |
| Section 12 | Quality assurance procedures | Implemented |

---

## Fraud Detection

Physics-based validation rejects impossible readings before they reach the blockchain:

```
Theoretical max power: P = rho x g x Q x H x eta
rho = 1000 kg/m3 (water density)
g   = 9.81 m/s2
Q   = flow rate (m3/s)
H   = head height (meters)
eta = turbine efficiency (0.70 - 0.95)
```

ML anomaly detection is trained on 4,001 real hydropower samples using an isolation forest model. Any reading that deviates beyond statistical bounds is flagged automatically.

Trust score thresholds:
- Above 0.85: auto-approved
- 0.50 to 0.85: manual review queue
- Below 0.50: rejected, fraud reason logged on-chain

---

## Production pilot

The next step is a 90-day shadow pilot with a 6 MW run-of-river plant in HP/UK:
- Run in parallel with manual MRV (no operational changes)
- Target: <5% delta vs manual reports
- Target: <0.5% false rejection rate
- Target: 99% Hedera transaction success

Pilot cost: ~Rs 38,000-63,000 vs Rs 1.25 lakh/quarter for manual MRV.

See [docs/PILOT_PLAN_6MW_PLANT.md](docs/PILOT_PLAN_6MW_PLANT.md) for the full plan.

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - how the system works
- [API reference](docs/API.md) - REST endpoints
- [Verra submission guide](docs/VERRA-GUIDEBOOK.md) - how to submit credits to Verra
- [Deployment](docs/deployment/DEPLOYMENT-GUIDE.md) - production deployment
- [Operator guide](docs/OPERATOR_GUIDE.md) - day-to-day operations
- [Testing guide](TESTING_GUIDE.md) - running tests
- [Carbon credits quick start](CARBON-CREDITS-QUICK-START.md)
- [Security](docs/SECURITY.md)

Older/archived docs are in `docs/archived/` if you need them.

---

## Roadmap

**Now:** 90-day shadow pilot with one plant

**Q2 2026:** Mainnet launch, 5 plants in India

**Q3 2026:** Verra/Gold Standard registry integration, automated REC trading

**Q4 2026:** Multi-tenant SaaS, solar and wind support

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup.

---

## License

MIT - see [LICENSE](./LICENSE)

---

**Bikram Biswas** — [GitHub](https://github.com/BikramBiswas786)
