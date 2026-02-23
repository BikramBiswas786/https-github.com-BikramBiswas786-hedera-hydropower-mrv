# Hedera Hydropower MRV — Pitch Deck
## Hedera Hello Future Apex Hackathon 2026 | Sustainability Track

> **Instructions for submission:** Use this document as the script/outline for your pitch deck PDF.
> Export to PDF using Google Slides, Canva, or PowerPoint. Upload to your submission portal.
> The PDF must be included with your submission on the StackUp submission portal.

---

## Slide 1 — Team & Project Introduction

**Project Name:** Hedera Hydropower MRV

**Team:** Bikram Biswas | Solo Developer | GitHub: [@BikramBiswas786](https://github.com/BikramBiswas786)

**Hackathon:** Hedera Hello Future Apex Hackathon 2026

**Track:** Theme 3 — Sustainability

**Tagline:**
> *Automated, fraud-proof carbon credit verification for small hydropower — at $0.0001 per reading.*

**Live Demo:** https://https-github-com-bikram-biswas786-h.vercel.app/

**GitHub:** https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv

---

## Slide 2 — The Problem

### Carbon Credit Fraud Is Breaking Climate Finance

**Scale of the problem:**
- 700 MW+ of small hydropower (1–15 MW) in India alone needs MRV certification
- Manual MRV costs **$15,000–$50,000** per project and takes **3–6 months**
- **30–40% of submitted claims** contain errors, data manipulation, or outright fraud
- Double-counting is rampant — the same MWh can be sold multiple times
- Current audits are paper-based with no cryptographic provenance

**The consequence:**
Carbon markets lose credibility. Climate funding is misdirected. Renewable energy operators who play by the rules are crowded out by fraudsters.

**Why now:**
India's carbon credit market is being formalized under the Carbon Credit Trading Scheme (CCTS). The infrastructure to verify credits at scale doesn't exist yet. This is the window.

---

## Slide 3 — The Solution

### Automated MRV + Hedera = Tamper-Proof Carbon Credits in Seconds

```
IoT Sensors → 5-Layer AI Engine → Hedera Ledger → Carbon Credits (HREC)
```

**What we built:**
1. **IoT data ingestion** — REST API accepts real-time sensor readings (flow rate, head, generation, pH, turbidity)
2. **AI verification engine** — 5 layers of physics + ML checks, produces a trust score 0–1.0
3. **Hedera HCS** — Every reading (approved AND rejected) is written immutably to the blockchain
4. **Hedera HTS** — Verified credits are minted as HREC tokens (1 token = 1 verified MWh)
5. **Hedera DID** — Each turbine has a W3C-standard decentralized identity

**Cost:** ~$0.0001 per reading on Hedera (vs $50,000 manual)
**Speed:** < 5 seconds per verification (vs 3–6 months manual)

---

## Slide 4 — Technical Architecture

### 5-Layer AI Verification Engine

| Layer | Weight | What It Checks |
|-------|--------|----------------|
| 1. Physics Validation | 30% | P = ρ·g·Q·H·η — power must match sensor readings |
| 2. Temporal Consistency | 25% | No impossible jumps between readings |
| 3. Environmental Bounds | 20% | pH 6–9, turbidity < 100 NTU, temperature 2–35°C |
| 4. Statistical Anomaly | 15% | Isolation Forest ML on 4,001 hydropower samples |
| 5. Device Consistency | 10% | Per-turbine historical profile |

**Trust Score Thresholds:**
- **> 0.85** → Auto-approved, carbon credits minted
- **0.50–0.85** → Flagged for manual review, fraud evidence recorded on-chain
- **< 0.50** → Rejected, fraud reason logged permanently on Hedera HCS

### Hedera Integration — 4 Services Used

| Service | Usage | ID |
|---------|-------|----|
| HCS | Immutable audit log for every reading | `0.0.7462776` |
| HTS | HREC carbon credit token | `0.0.7964264` |
| Hedera DID | W3C device identity per turbine | `0.0.8011563` |
| Account | Transaction signing + fee payment | `0.0.6255927` |

---

## Slide 5 — Live Demo Evidence

### Everything is verifiable on Hedera Testnet RIGHT NOW

**Approved Reading (Real TX):**
- Trust: 100% | Status: APPROVED | Credits: 0.72 tCO2e
- https://hashscan.io/testnet/transaction/0.0.6255927@1771653525.644096977

**Fraud Detected (Real TX):**
- 10x power inflation | Trust: 65% | Status: FLAGGED
- Fraud evidence permanently on-chain
- https://hashscan.io/testnet/transaction/0.0.6255927@1771653635.503086014

**HREC Token:**
- 165.55 tCO2e minted | Token: `0.0.7964264`
- https://hashscan.io/testnet/token/0.0.7964264

**HCS Audit Trail:**
- All readings — approved AND rejected — permanently recorded
- https://hashscan.io/testnet/topic/0.0.7462776

### Test Results
- 288+ tests passing (17 test suites)
- 85%+ code coverage
- CI/CD: 3 jobs green (Security Audit ✅ | Tests ✅ | Docker ✅)
- Performance: 1,000 readings verified in ~20 seconds

---

## Slide 6 — UN CDM ACM0002 Compliance

### Carbon Credits Calculated to International Standard

**Formula (ACM0002 v18.0):**
```
ER = BE - PE - LE

Where:
  BE = Baseline Emissions = Generated MWh × Grid Emission Factor
  PE = Project Emissions   = 0 (run-of-river hydro)
  LE = Leakage Emissions   = 0 (grid-connected)
```

**Example calculation:**
```
Generated: 900 kWh = 0.9 MWh
Grid EF (India): 0.8 tCO2e/MWh
Carbon Credits: 0.9 × 0.8 = 0.72 tCO2e
Market value (@$16/tCO2e): ~$11.52 per reading
```

**ACM0002 Sections Implemented:**
- Section 4: Project eligibility checks
- Section 6–7: Baseline emissions (BE)
- Section 8: Project emissions (PE)
- Section 9: Leakage emissions (LE)
- Section 10: Emission reductions (ER)
- Section 11: Monitoring parameters
- Section 12: Quality assurance (our AI engine)

---

## Slide 7 — Business Model

### Why This Wins on Economics

| Metric | Manual MRV | This System | Savings |
|--------|-----------|-------------|---------|
| Cost per quarter | ₹1,25,000 (~$1,500) | ₹38,000–63,000 (~$460–$760) | **60–70%** |
| Time per verification | 3–6 months | < 5 seconds | **99.99%** |
| Fraud detection | Manual, ~60–70% accuracy | AI+blockchain, 95%+ | **+35%** |
| Double-counting risk | High (paper ledger) | Zero (blockchain immutability) | **Eliminated** |
| Audit cost (per plant) | $15,000–50,000 | ~$0.10/year (Hedera fees) | **99.9%** |

### Revenue Model (SaaS)
- **Per-verification fee:** $0.001–0.01 per reading (still 100x cheaper than manual)
- **Annual SaaS subscription:** $500–2,000/plant/year for full platform access
- **White-label licensing:** For carbon registries, utilities, MRV auditors
- **Market size:** 15,000+ small hydro plants in South/Southeast Asia alone

---

## Slide 8 — Go-To-Market Strategy

### Three-Phase GTM

**Phase 1 (Now — Q1 2026): Shadow Pilot**
- 90-day parallel run with 1 × 6 MW plant in Himachal Pradesh/Uttarakhand
- Target: < 5% delta vs manual reports, < 0.5% false rejection rate
- Cost: ~Rs 38,000–63,000 vs Rs 1,25,000/quarter manual MRV

**Phase 2 (Q2 2026): Mainnet Launch**
- Move from Hedera Testnet to Mainnet
- Onboard 5 plants in India (HP, UK, Karnataka)
- Integrate with Verra Gold Standard registry API

**Phase 3 (Q3–Q4 2026): Scale**
- Multi-tenant SaaS platform for 50+ plants
- Automated REC trading marketplace
- Expand to solar and wind MRV
- Target markets: India, Nepal, Sri Lanka, Bangladesh

### Validation Achieved
- Real HashScan transactions prove the system works today
- Pilot plan documented at `/docs/PILOT_PLAN_6MW_PLANT.md`
- India CCTS regulatory timeline aligns with Q2 2026 mainnet launch

---

## Slide 9 — Hedera Impact

### Why Hedera — And How This Grows the Ecosystem

**Why Hedera over Ethereum/Solana:**
- 3–5 second finality (vs 10+ minutes on Ethereum)
- **$0.0001/tx** (vs $5–50 on Ethereum) — critical for IoT-scale transactions
- **Carbon-negative network** — directly aligns with sustainability mission
- Public ledger meets regulatory requirements (SEBI, UNFCCC)
- No mining = no energy paradox for a green credential system

**How this grows Hedera:**
- Every hydropower plant = 1 new Hedera account + 2–4 HCS topics
- A 50-plant deployment generates **~500,000 transactions/year** on Hedera
- Exposes Hedera to carbon finance sector (multi-trillion dollar market)
- Demonstrates HCS as regulatory-grade audit infrastructure
- HREC token creates a new DeFi primitive: tokenized verified RECs

---

## Slide 10 — Future Roadmap & Key Learnings

### Roadmap

| Timeline | Milestone |
|----------|-----------|
| **Now** | 90-day shadow pilot, 1 plant |
| **Q2 2026** | Hedera mainnet, 5 plants India |
| **Q3 2026** | Verra/Gold Standard registry API integration |
| **Q4 2026** | Multi-tenant SaaS, solar + wind support |
| **2027** | Southeast Asia expansion (Nepal, Sri Lanka, Bangladesh) |
| **2028** | Global MRV platform, 1,000+ plants |

### Key Learnings from Hackathon

1. **Hedera HCS is underutilized** — it's a perfect fit for regulatory audit trails; most projects use it only for messaging
2. **Physics-based fraud detection beats pure ML** for IoT energy data — first-principles validation catches fraud that statistical models miss
3. **ACM0002 is implementable in code** — the UN methodology is formulaic enough to automate with high fidelity
4. **Cost economics are the killer feature** — not the blockchain per se, but $0.0001 vs $50,000 is the story

### Room for Improvement
- Multi-tenancy (per-org API key scoping)
- Real-time Grafana dashboard for plant operators
- Mobile app for field engineers
- Integration with satellite imagery for cross-validation
- Expand ML training dataset beyond 4,001 samples

---

## Slide 11 — Demo

### Demo Video
**[TO BE ADDED — upload to YouTube before 23 March 2026, 11:59 PM ET]**

**Demo Script (5 steps, target 2–3 minutes):**

1. **[00:00–00:20]** Open live dashboard: https://https-github-com-bikram-biswas786-h.vercel.app/
   - Show system status, Hedera connection, live metrics

2. **[00:20–00:50]** Submit a normal reading via API
   - Flow: 2.5 m³/s, Head: 45m, Generated: 900 kWh
   - Show APPROVED result, trust score 100%
   - Click HashScan link — show real transaction on Hedera Testnet

3. **[00:50–01:20]** Submit a fraud reading (10x inflated)
   - Generated: 9,000 kWh (10x fraud)
   - Show FLAGGED result, trust score 65%
   - Show fraud evidence permanently recorded on-chain

4. **[01:20–01:45]** Show HCS audit trail
   - Open HashScan topic 0.0.7462776
   - Show both approved and rejected readings in immutable log

5. **[01:45–02:00]** Show HREC token and carbon credits
   - Open token 0.0.7964264 on HashScan
   - Show 165.55 tCO2e minted, ACM0002 calculation

---

## Slide 12 — Summary

### Why Hedera Hydropower MRV Wins

| Criterion | Our Score | Evidence |
|-----------|-----------|---------|
| **Innovation** | High | First automated MRV on Hedera, novel HCS audit use |
| **Feasibility** | High | Working MVP deployed to Vercel + Hedera Testnet |
| **Execution** | High | 288 tests, 85% coverage, CI/CD green, Docker ready |
| **Integration** | High | 4 Hedera services (HCS + HTS + DID + Account) |
| **Success** | High | Drives TPS, new accounts, exposes Hedera to carbon markets |
| **Validation** | Medium | HashScan evidence + pilot plan; market pilot starting |
| **Pitch** | High | Clear $50K → $0.0001 cost reduction story |

**The pitch in one sentence:**
> We replaced a $50,000, 6-month manual process with a $0.0001, 5-second blockchain transaction — and we have the HashScan receipts to prove it works today.

---

**Bikram Biswas | [@BikramBiswas786](https://github.com/BikramBiswas786)**
**Hedera Hello Future Apex Hackathon 2026 | Theme 3: Sustainability**
**Submission Deadline: 23 March 2026, 11:59 PM ET**
