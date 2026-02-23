# Hedera Hydropower MRV — Apex Hackathon 2026 Submission

## Hackathon Details

| Field | Value |
|-------|-------|
| **Event** | Hedera Hello Future Apex Hackathon 2026 |
| **Track** | Theme 3: Sustainability |
| **Submission Deadline** | 23 March 2026, 11:59 PM ET |
| **Team Leader** | Bikram Biswas ([@BikramBiswas786](https://github.com/BikramBiswas786)) |
| **Team Size** | 1 |

---

## 1. Project Description (max 100 words)

Hedera Hydropower MRV automates carbon credit verification for small-scale hydropower plants (1–15 MW). Manual MRV costs $15,000–50,000 per project and takes months, with 30–40% of claims containing errors or fraud. Our system reads IoT sensor telemetry (flow rate, head height, generation, water quality), runs it through a 5-layer AI verification engine, writes tamper-proof attestations to Hedera's public ledger via HCS, and issues carbon credits as HTS tokens using UN CDM ACM0002 methodology. Cost: ~$0.0001 per verification. Time: seconds instead of months. 288+ tests passing with real on-chain transactions verified on Hedera Testnet.

---

## 2. Selected Hackathon Track

**Theme 3: Sustainability** — Main Track Submission

This project directly addresses the Sustainability track by:
- Creating financial systems that promote ecological impact (carbon credit verification)
- Building on-chain verification tools for environmental claims
- Using Hedera's low-carbon, energy-efficient network as the trust layer
- Channeling verified carbon value to renewable energy producers

---

## 3. Tech Stack

### Blockchain & DLT
- **Hedera Consensus Service (HCS)** — Immutable audit log for every telemetry reading (Topic: `0.0.7462776`)
- **Hedera Token Service (HTS)** — HREC carbon credit tokens (Token: `0.0.7964264`)
- **Hedera DID** — Decentralized identity per turbine device (Topic: `0.0.8011563`)
- **Hedera Account** — Transaction signing (`0.0.6255927`)
- **HashScan** — On-chain transaction verification

### AI & Verification Engine
- **5-Layer AI Verification Engine** (custom-built):
  1. Physics validation (ACM0002 formula: P = ρ·g·Q·H·η)
  2. Temporal consistency checks
  3. Environmental bounds validation
  4. Statistical anomaly detection (Isolation Forest ML)
  5. Device consistency profiling
- **Isolation Forest** — ML anomaly detection trained on 4,001 hydropower samples

### Backend
- **Node.js / Express** — REST API server
- **Jest** — 288+ tests, 85%+ coverage
- **Prometheus** — Real-time metrics (`/metrics` endpoint)
- **Docker** — Containerised deployment

### Frontend & Deployment
- **Vercel** — Production deployment (live dashboard)
- **Next.js / React** — Dashboard UI
- **GitHub Actions** — CI/CD pipeline (Security Audit + Tests + Docker Validation)

### Standards & Methodology
- **UN CDM ACM0002 v18.0** — Carbon credit calculation methodology
- **W3C DID** — Decentralised identity standard for devices
- **MIT License** — Open source

---

## 4. Project Demo Video

> **⚠️ ACTION REQUIRED:** Record a 2–3 minute demo video, upload to YouTube, and paste the link here.

**Demo Video URL:** `[TO BE ADDED — upload to YouTube before 23 March 2026, 11:59 PM ET]`

**Suggested demo script (5 steps, ~2 min):**
1. Show live dashboard at https://https-github-com-bikram-biswas786-h.vercel.app/
2. Submit a normal reading → show APPROVED + HashScan transaction
3. Submit a fraud reading (10x inflated power) → show REJECTED + fraud logged on-chain
4. Show HREC token minting on HashScan
5. Show HCS audit trail topic with all messages

---

## 5. Project Demo Link

**Live Demo:** https://https-github-com-bikram-biswas786-h.vercel.app/

**API Endpoints:**
- Status: `https://https-github-com-bikram-biswas786-h.vercel.app/api/status`
- Demo: `https://https-github-com-bikram-biswas786-h.vercel.app/api/demo`

---

## 6. GitHub Repository

**Repo:** https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv

---

## 7. Hedera On-Chain Evidence

All transactions are live and verifiable on Hedera Testnet:

| Resource | ID | HashScan Link |
|----------|----|---------------|
| Operator Account | `0.0.6255927` | [View Account](https://hashscan.io/testnet/account/0.0.6255927) |
| HCS Audit Topic | `0.0.7462776` | [View Messages](https://hashscan.io/testnet/topic/0.0.7462776) |
| HREC Token (HTS) | `0.0.7964264` | [View Token](https://hashscan.io/testnet/token/0.0.7964264) |
| Device DID Topic | `0.0.8011563` | [View Topic](https://hashscan.io/testnet/topic/0.0.8011563) |
| Sample Approved TX | `0.0.6255927@1771653525.644096977` | [View TX](https://hashscan.io/testnet/transaction/0.0.6255927@1771653525.644096977) |
| Sample Rejected TX | `0.0.6255927@1771653667.685541244` | [View TX](https://hashscan.io/testnet/transaction/0.0.6255927@1771653667.685541244) |

---

## 8. CI/CD Status

[![CI Tests](https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/actions/workflows/test.yml/badge.svg)](https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/actions/workflows/test.yml)

Latest CI run #284: **SUCCESS** — Security Audit ✅ | Tests (Node 20.x) ✅ | Docker Validation ✅

---

## 9. Key Metrics

| Metric | Value |
|--------|-------|
| Tests passing | 288+ (17 suites) |
| Code coverage | 85%+ |
| Cost per verification | ~$0.0001 |
| Verification speed | < 5 seconds (vs 3–6 months manual) |
| Fraud detection accuracy | 95%+ |
| Carbon credits minted | 165.55 tCO2e on testnet |
| Real Hedera transactions | 100+ on testnet |
| CI pipeline | 3 jobs, all green |

---

## 10. Judging Criteria Self-Assessment

### Innovation (10%)
- First fully automated MRV system for small hydropower on Hedera
- Novel application of HCS for regulatory-grade audit trails
- AI + blockchain hybrid verification (not seen cross-chain in this form)

### Feasibility (10%)
- Working MVP deployed to production (Vercel + Hedera Testnet)
- Real IoT sensor data pipeline implemented
- UN CDM ACM0002 methodology fully implemented
- 90-day shadow pilot planned with 6 MW plant in India/UK

### Execution (20%)
- 288+ tests passing, 85% coverage, CI/CD green
- Full E2E: IoT → AI → Hedera → Carbon Credits
- Docker containerised, Prometheus metrics, API auth
- GTM: SaaS for hydropower operators, Verra registry integration roadmap

### Integration (15%)
- Uses HCS (audit log), HTS (tokens), Hedera DID (device identity), Hedera Account
- 4 Hedera services integrated — comprehensive use of the ecosystem
- Real transactions on Hedera Testnet (not mocked)

### Success (20%)
- Increases Hedera TPS through IoT reading submissions
- Creates new Hedera accounts (one per hydropower plant)
- Exposes Hedera to carbon market / climate finance sector
- Targets 5 plants on mainnet by Q2 2026 → significant monthly active accounts

### Validation (15%)
- 90-day shadow pilot planned with real plant
- Evidence folder with real HashScan transactions as market proof
- Cost comparison: Rs 38,000–63,000 vs Rs 1,25,000/quarter manual MRV (60–70% savings)

### Pitch (10%)
- Clear problem: $15K–50K manual verification, 30–40% fraud rate
- Clear solution: $0.0001 automated blockchain verification in seconds
- Demo video + live dashboard + on-chain proof

---

## 11. Submission Checklist

- [x] GitHub repo with full source code
- [x] README.md with quick start instructions
- [x] Live demo URL (Vercel): https://https-github-com-bikram-biswas786-h.vercel.app/
- [x] CI/CD passing (3 jobs green)
- [x] On-chain evidence (HashScan transactions)
- [x] Evidence folder (`/evidence/`)
- [x] Documentation (`/docs/`)
- [x] QUICK_START.md (5-minute setup)
- [x] Architecture docs
- [x] MIT License
- [ ] **Demo video URL** — ⚠️ MUST ADD before submission deadline
- [ ] **Pitch deck PDF** — ⚠️ MUST ADD before submission deadline (see PITCH_DECK.md)

---

## 12. Terms & Rules

- Hackathon Terms of Service: https://angelhack.com/terms-of-service/
- Hackathon Rules: https://go.hellofuturehackathon.dev/apex-rules
- Submission portal: https://go.hellofuturehackathon.dev/submit-bounty

---

*Last updated: February 2026 | Bikram Biswas — [@BikramBiswas786](https://github.com/BikramBiswas786)*
