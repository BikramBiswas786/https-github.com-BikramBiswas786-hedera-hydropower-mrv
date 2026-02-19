# Hedera Network Impact — Hydropower MRV

> **Judging criterion: Success (20% weight)**
> This document quantifies the projected impact on the Hedera network and the
> global voluntary carbon market if this system is adopted at scale.

---

## 🌐 Hedera Network Impact

### New Accounts

Every hydropower plant onboarded creates:
- 1 Hedera account for the operator
- 1 device DID (`did:hedera:testnet:...`) per sensor/turbine unit
- 1 HCS topic per plant (dedicated audit log)
- 1 HTS token type per plant (HREC)

| Scenario | Plants | New Hedera Accounts | New HCS Topics | New HTS Tokens |
|----------|--------|---------------------|----------------|----------------|
| Pilot (Year 1) | 3 | 3 | 3 | 3 |
| Phase 1 (India) | 500 | 500 | 500 | 500 |
| South/SE Asia | 5,000 | 5,000 | 5,000 | 5,000 |
| Global TAM | 50,000 | 50,000 | 50,000 | 50,000 |

### HCS Transaction Volume

Each telemetry reading = 1 HCS `TopicMessageSubmitTransaction`.

| Reading Frequency | Plants | Daily HCS TXs | Annual HCS TXs |
|-------------------|--------|---------------|----------------|
| 1/hour per plant | 500 | 12,000 | 4,380,000 |
| 1/hour per plant | 5,000 | 120,000 | 43,800,000 |
| 1/hour per plant | 50,000 | 1,200,000 | 438,000,000 |
| 6/hour per plant | 50,000 | 7,200,000 | 2,628,000,000 |

At full global scale with 6 readings/hour per plant:
**2.6 billion HCS transactions per year** — a substantial contribution to Hedera’s network activity.

### HTS Transaction Volume

Each REC minting = 1 HTS `TokenMintTransaction`.

| Scenario | Monthly MWh Verified | Monthly HREC Mints |
|----------|---------------------|--------------------|
| 500 plants × 1 MW avg | 360,000 MWh | 360,000 |
| 5,000 plants × 1 MW avg | 3,600,000 MWh | 3,600,000 |

---

## 💰 Economic Impact

### Carbon Credit Value Generated on Hedera

| Scenario | Annual MWh | CO₂ Credits (800 tCO₂/GWh) | Value at $15/tCO₂ |
|----------|-----------|---------------------------|-------------------|
| 500 plants | 4,380,000 MWh | 3,504,000 tCO₂ | **$52.5M/year** |
| 5,000 plants | 43,800,000 MWh | 35,040,000 tCO₂ | **$525M/year** |

All of this value is **anchored, verified, and auditable on Hedera** — not on paper.

### Fee Revenue for MRV-as-a-Service

| Pricing model | 500 plants | 5,000 plants |
|---------------|------------|-------------|
| $0.10/MWh verified | $438,000/year | $4,380,000/year |

---

## 🌱 Ecosystem Impact

### Carbon Registry Integration

- **Verra VCS** — Verra is the world’s largest voluntary carbon standard.
  Integration via Hedera Guardian would make every HREC token directly
  redeemable as a VCS credit. Verra has 1,800+ registered projects.
- **Gold Standard** — Secondary target. 2,200+ certified projects globally.
- **Climate Collective** — ReFi ecosystem building on Hedera. Direct
  partnership path for distribution to carbon buyers.
- **Hedera Guardian** — Existing Hedera policy engine. Aligning this system
  with Guardian’s ACM0002 policy template enables automated issuance
  without manual auditor intervention.

### Hedera Ecosystem Exposure

- Every carbon registry adopting this system publicly lists Hedera TXIDs
  as audit evidence — organic, third-party Hedera exposure
- Press coverage: ReFi newsletters, climate tech media, UNFCCC observers
- First-mover: no comparable open-source, on-chain MRV system exists on Hedera

---

## 📍 Current Live Evidence

| Metric | Value |
|--------|-------|
| Hedera Testnet Account | `0.0.6255927` |
| HCS Topic Active | `0.0.7964262` |
| HREC Token Deployed | `0.0.7964264` |
| Real TXIDs on HashScan | 2 verified (approved + fraud-rejected) |
| Automated tests passing | 234 (9 suites) |
| Performance | 1,000 readings in ~20s; single check < 5ms |

All verifiable at [hashscan.io/testnet](https://hashscan.io/testnet).
