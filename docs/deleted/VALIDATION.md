# Validation Evidence

> **Archived**: This was the hackathon validation document.
> Judging criterion: Validation (15% weight)

## Technical Validation Summary

### Live Hedera Testnet Transactions
| Transaction | TXID | Result |
|-------------|------|--------|
| Approved telemetry (trust score 94%) | `0.0.6255927@1771367521.991650439` | [Verify](https://hashscan.io/testnet/transaction/0.0.6255927@1771367521.991650439) |
| Rejected telemetry (fraud detected) | `0.0.6255927@1771367525.903417316` | [Verify](https://hashscan.io/testnet/transaction/0.0.6255927@1771367525.903417316) |
| HREC Token created | `0.0.7964264` | [Verify](https://hashscan.io/testnet/token/0.0.7964264) |
| HCS Audit Topic | `0.0.7964262` | [Verify](https://hashscan.io/testnet/topic/0.0.7964262) |

### Test Coverage
- 234 automated tests across 9 suites
- Performance: < 5ms per reading verification
- 100 readings batch E2E: ~5.2s

### ACM0002 Methodology
- Power calculation: P = ρ·g·Q·H·η
- Emission factor: EF = Net MWh × Grid EF (tCO₂/MWh)
- Anomaly thresholds: IEC 60041 standard

> Full validation evidence moved here from root. Active validation docs live in docs/SECURITY-AUDIT-CHECKLIST.md and docs/ACM0002-ALIGNMENT-MATRIX.md
