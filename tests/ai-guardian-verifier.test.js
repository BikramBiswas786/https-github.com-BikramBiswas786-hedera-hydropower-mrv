/**
 * AI Guardian Verifier Tests — Jest (rewritten from tape)
 */
'use strict';
const AIGuardianVerifier = require('../src/ai-guardian-verifier');

describe('Trust Score Calculation', () => {
  let verifier;
  beforeEach(() => { verifier = new AIGuardianVerifier(); });

  test('All checks pass => trust score > 0.95', () => {
    const checks = {
      physics: { passed: true },
      temporal: { passed: true },
      environmental: { passed: true },
      statistical: { passed: true }
    };
    const score = verifier.calculateTrustScore(checks);
    expect(score).toBeGreaterThan(0.95);
    expect(score).toBeLessThanOrEqual(1.0);
  });

  test('Physics fails => trust score < 0.8', () => {
    const checks = {
      physics: { passed: false },
      temporal: { passed: true },
      environmental: { passed: true },
      statistical: { passed: true }
    };
    const score = verifier.calculateTrustScore(checks);
    expect(score).toBeLessThan(0.8);
  });

  test('Temporal fails => trust score < 0.8', () => {
    const checks = {
      physics: { passed: true },
      temporal: { passed: false },
      environmental: { passed: true },
      statistical: { passed: true }
    };
    const score = verifier.calculateTrustScore(checks);
    expect(score).toBeLessThan(0.8);
  });

  test('Environmental fails => trust score < 0.85', () => {
    const checks = {
      physics: { passed: true },
      temporal: { passed: true },
      environmental: { passed: false },
      statistical: { passed: true }
    };
    const score = verifier.calculateTrustScore(checks);
    expect(score).toBeLessThan(0.85);
  });

  test('Multiple failures => trust score < 0.6', () => {
    const checks = {
      physics: { passed: false },
      temporal: { passed: false },
      environmental: { passed: false },
      statistical: { passed: true }
    };
    const score = verifier.calculateTrustScore(checks);
    expect(score).toBeLessThan(0.6);
  });
});

describe('Auto-Approval Logic', () => {
  let verifier;
  beforeEach(() => { verifier = new AIGuardianVerifier(); });

  test('High trust (0.95) => APPROVED', () => {
    const result = verifier.determineVerificationStatus(0.95);
    expect(result.status).toBe('APPROVED');
  });

  test('Low trust (0.65) => REJECTED', () => {
    const result = verifier.determineVerificationStatus(0.65);
    expect(result.status).toBe('REJECTED');
  });

  test('Mid-range trust (0.80) => FLAGGED', () => {
    const result = verifier.determineVerificationStatus(0.80);
    expect(result.status).toBe('FLAGGED');
  });

  test('Score at auto-approve threshold (0.90) => APPROVED', () => {
    const result = verifier.determineVerificationStatus(0.90);
    expect(result.status).toBe('APPROVED');
  });

  test('Score just below auto-approve (0.89) => FLAGGED', () => {
    const result = verifier.determineVerificationStatus(0.89);
    expect(result.status).toBe('FLAGGED');
  });
});

describe('Configurable Thresholds', () => {
  test('Conservative (0.95) threshold: 0.96 approved, 0.90 flagged', () => {
    const v = new AIGuardianVerifier({ autoApproveThreshold: 0.95, manualReviewThreshold: 0.80 });
    expect(v.determineVerificationStatus(0.96).status).toBe('APPROVED');
    expect(v.determineVerificationStatus(0.90).status).toBe('FLAGGED');
  });

  test('Aggressive (0.70) threshold: 0.75 approved, 0.60 flagged', () => {
    const v = new AIGuardianVerifier({ autoApproveThreshold: 0.70, manualReviewThreshold: 0.50 });
    expect(v.determineVerificationStatus(0.75).status).toBe('APPROVED');
    expect(v.determineVerificationStatus(0.60).status).toBe('FLAGGED');
  });
});

describe('Verification Decision - Complete Flow', () => {
  let verifier;
  beforeEach(() => { verifier = new AIGuardianVerifier(); });

  test('Good reading => APPROVED with high trust', async () => {
    const reading = {
      deviceId: 'T1',
      timestamp: new Date().toISOString(),
      flowRate: 2.5, head: 45, generatedKwh: 900, efficiency: 0.85,
      pH: 7.2, turbidity: 10, temperature: 18
    };
    const result = await verifier.verifyReading(reading);
    expect(result.verificationStatus).toBe('APPROVED');
    expect(result.trustScore).toBeGreaterThan(0.90);
    expect(result.timestamp).toBeTruthy();
  });

  test('Bad physics reading => FLAGGED or REJECTED with lower trust', async () => {
    const reading = {
      deviceId: 'T1',
      timestamp: new Date().toISOString(),
      flowRate: 2.5, head: 45, generatedKwh: 999999, efficiency: 0.85,
      pH: 7.2, turbidity: 10, temperature: 18
    };
    const result = await verifier.verifyReading(reading);
    expect(result.trustScore).toBeLessThan(0.90);
    expect(result.reason || result.verificationStatus).toBeTruthy();
  });

  test('Very bad reading => REJECTED', async () => {
    const reading = {
      deviceId: 'T1',
      timestamp: new Date().toISOString(),
      flowRate: 200, head: -10, generatedKwh: 999999, efficiency: 2.5,
      pH: 1.0, turbidity: 9999, temperature: 200
    };
    const result = await verifier.verifyReading(reading);
    expect(result.trustScore).toBeLessThan(0.70);
    expect(result.verificationStatus).toBe('REJECTED');
  });
});

describe('Attestation Generation', () => {
  let verifier;
  beforeEach(() => { verifier = new AIGuardianVerifier(); });

  test('Valid reading produces attestation with required fields', async () => {
    const reading = {
      deviceId: 'T1',
      timestamp: new Date().toISOString(),
      flowRate: 2.5, head: 45, generatedKwh: 900, efficiency: 0.85
    };
    const att = await verifier.generateAttestation(reading);
    expect(att.deviceId).toBeTruthy();
    expect(att.verificationStatus).toBeTruthy();
    expect(att.trustScore).toBeDefined();
    expect(att.signature).toBeTruthy();
    expect(att.timestamp).toBeTruthy();
  });

  test('Invalid reading produces rejected attestation with reasons', async () => {
    const reading = {
      deviceId: 'T1',
      timestamp: new Date().toISOString(),
      flowRate: 200, head: -99, generatedKwh: 999999, efficiency: 5.0
    };
    const att = await verifier.generateAttestation(reading);
    expect(att.deviceId).toBeTruthy();
    expect(att.verificationStatus).toBe('REJECTED');
    expect(att.rejectionReasons || att.reasons).toBeTruthy();
  });
});

describe('Batch Processing', () => {
  let verifier;
  beforeEach(() => { verifier = new AIGuardianVerifier(); });

  function makeReading(overrides = {}) {
    return {
      deviceId: 'T1',
      timestamp: new Date().toISOString(),
      flowRate: 2.5, head: 45, generatedKwh: 900, efficiency: 0.85,
      pH: 7.2, turbidity: 10, temperature: 18,
      ...overrides
    };
  }

  test('Processes all readings', async () => {
    const readings = [makeReading(), makeReading(), makeReading()];
    const results = await verifier.processBatch(readings);
    expect(results.length).toBe(3);
    results.forEach(r => expect(r.verificationStatus).toBeTruthy());
  });

  test('Mixed valid/invalid batch — at least 1 approved and 1 non-approved', async () => {
    const readings = [
      makeReading(),
      makeReading({ flowRate: 200, head: -99, generatedKwh: 999999, efficiency: 5.0 }),
      makeReading({ generatedKwh: 1e8, flowRate: 500 })
    ];
    const results = await verifier.processBatch(readings);
    expect(results.length).toBe(3);
    const approved = results.filter(r => r.verificationStatus === 'APPROVED').length;
    const notApproved = results.filter(r => r.verificationStatus !== 'APPROVED').length;
    expect(approved).toBeGreaterThanOrEqual(1);
    expect(notApproved).toBeGreaterThanOrEqual(1);
  });

  test('Empty batch returns empty array', async () => {
    const results = await verifier.processBatch([]);
    expect(results).toEqual([]);
  });
});

describe('Edge Cases', () => {
  test('Null validation results throws or returns error', () => {
    const v = new AIGuardianVerifier();
    expect(() => v.calculateTrustScore(null)).toThrow();
  });

  test('Trust score is always in [0, 1]', () => {
    const v = new AIGuardianVerifier();
    const checks = {
      physics: { passed: true },
      temporal: { passed: true },
      environmental: { passed: true },
      statistical: { passed: true }
    };
    const score = v.calculateTrustScore(checks);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});

describe('Performance', () => {
  test('Single decision completes in < 50ms', () => {
    const v = new AIGuardianVerifier();
    const checks = { physics: { passed: true }, temporal: { passed: true }, environmental: { passed: true }, statistical: { passed: true } };
    const start = Date.now();
    v.determineVerificationStatus(v.calculateTrustScore(checks));
    expect(Date.now() - start).toBeLessThan(50);
  });

  test('Batch of 100 completes in < 5s', async () => {
    const v = new AIGuardianVerifier();
    const readings = Array.from({ length: 100 }, (_, i) => ({
      deviceId: 'T1',
      timestamp: new Date().toISOString(),
      flowRate: 2.5, head: 45, generatedKwh: 900 + i, efficiency: 0.85
    }));
    const start = Date.now();
    await v.processBatch(readings);
    expect(Date.now() - start).toBeLessThan(5000);
  });
});
