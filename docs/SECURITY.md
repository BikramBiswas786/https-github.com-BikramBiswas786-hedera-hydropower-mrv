# Security Model — Hedera Hydropower MRV

## Threat Model

| Threat                        | Mitigation                                                       |
|------------------------------|-------------------------------------------------------------------|
| Fake sensor data             | Physics validator rejects readings that violate P = ρ·g·Q·H·η     |
| Replay attacks               | Monotonic timestamp checks reject duplicate or old readings      |
| Data tampering in transit    | HCS stores SHA-256 hash of payload; any change invalidates it     |
| Phantom REC minting          | HTS minting gated exclusively by APPROVED attestation status     |
| Compromised operator key     | Rotate key via Hedera account update; history remains immutable  |
| Statistical fraud (slow drift)| Rolling z-score history per device detects gradual inflation     |

## Key Management

- Operator private key stored in .env and never committed to the repository.
- .gitignore includes .env.
- CI pipeline uses GitHub Actions Secrets (encrypted at rest).
- For production, use hardware-backed or managed key solutions.

## On-Chain (Public) Data

All data submitted to Hedera HCS is public and permanent:

- Attestation ID.
- Device DID.
- Trust score.
- Verification status.
- ACM0002 calculation outputs.
- Hedera consensus timestamp.

Sensitive telemetry values (raw sensor readings) should be hashed before HCS submission in production.

## Not Stored On-Chain

- Raw private keys.
- Account seed phrases.
- Personal data of operators.

## Audit Trail Guarantees

1. Every reading (APPROVED, FLAGGED, REJECTED) is submitted to HCS.
2. HCS records are immutable.
3. Timestamps are Hedera consensus timestamps.
4. Any verifier can retrieve full history via mirror node or explorer.

## Responsible Disclosure

To report a security issue, open a private GitHub Security Advisory on this repository.