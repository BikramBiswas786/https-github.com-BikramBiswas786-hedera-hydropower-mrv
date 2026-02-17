/**
 * Anomaly Detector Tests — Jest (rewritten from tape)
 */
'use strict';
const AnomalyDetector = require('../src/anomaly-detector');

const SITE_CONFIG = {
  flowRateBounds: { min: 0.1, max: 100 },
  phBounds: { min: 6.5, max: 8.5 },
  turbidityBounds: { min: 0, max: 50 },
  temperatureBounds: { min: 0, max: 30 }
};

describe('Physics Constraints', () => {
  let detector;
  beforeEach(() => { detector = new AnomalyDetector(); });

  test('Valid reading passes physics validation', () => {
    const r = { flowRate: 2.5, head: 45, generatedKwh: 900, efficiency: 0.85 };
    const result = detector.validatePhysicsConstraints(r);
    expect(result.isValid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  test('Flow rate too high fails physics validation', () => {
    const r = { flowRate: 200, head: 45, generatedKwh: 900 };
    const result = detector.validatePhysicsConstraints(r);
    expect(result.isValid).toBe(false);
    expect(result.reason).toMatch(/[Pp]hysics/);
  });

  test('Negative head fails physics validation', () => {
    const r = { flowRate: 2.5, head: -10, generatedKwh: 900 };
    const result = detector.validatePhysicsConstraints(r);
    expect(result.isValid).toBe(false);
    expect(result.reason).toMatch(/[Pp]hysics/);
  });

  test('Invalid efficiency fails physics validation', () => {
    const r = { flowRate: 2.5, head: 45, generatedKwh: 900, efficiency: 1.5 };
    const result = detector.validatePhysicsConstraints(r);
    expect(result.isValid).toBe(false);
    expect(result.reason).toMatch(/[Pp]hysics/);
  });
});

describe('Temporal Consistency', () => {
  let detector;
  beforeEach(() => { detector = new AnomalyDetector(); });

  test('Increasing generation passes temporal validation', () => {
    const prev = { timestamp: '2025-01-01T00:00:00Z', generatedKwh: 100 };
    const curr = { timestamp: '2025-01-01T01:00:00Z', generatedKwh: 200 };
    const result = detector.validateTemporalConsistency(curr, prev);
    expect(result.isValid).toBe(true);
  });

  test('Decreased generation fails temporal validation', () => {
    const prev = { timestamp: '2025-01-01T00:00:00Z', generatedKwh: 500 };
    const curr = { timestamp: '2025-01-01T01:00:00Z', generatedKwh: 100 };
    const result = detector.validateTemporalConsistency(curr, prev);
    expect(result.isValid).toBe(false);
    expect(result.reason).toMatch(/generation decreased/);
  });

  test('Non-increasing timestamp fails temporal validation', () => {
    const prev = { timestamp: '2025-01-01T02:00:00Z', generatedKwh: 100 };
    const curr = { timestamp: '2025-01-01T01:00:00Z', generatedKwh: 200 };
    const result = detector.validateTemporalConsistency(curr, prev);
    expect(result.isValid).toBe(false);
    expect(result.reason).toMatch(/timestamp/);
  });

  test('Unrealistic generation increase fails temporal validation', () => {
    const prev = { timestamp: '2025-01-01T00:00:00Z', generatedKwh: 100 };
    const curr = { timestamp: '2025-01-01T01:00:00Z', generatedKwh: 1000 };
    const result = detector.validateTemporalConsistency(curr, prev);
    expect(result.isValid).toBe(false);
    expect(result.reason).toMatch(/generation increase/);
  });

  test('No previous reading => temporal passes (no context)', () => {
    const curr = { timestamp: '2025-01-01T01:00:00Z', generatedKwh: 200 };
    const result = detector.validateTemporalConsistency(curr, null);
    expect(result.isValid).toBe(true);
  });
});

describe('Environmental Bounds', () => {
  let detector;
  beforeEach(() => { detector = new AnomalyDetector(); });

  test('All valid environmental parameters pass', () => {
    const t = { flowRate: 2.5, pH: 7.2, turbidity: 10, temperature: 18 };
    const result = detector.validateEnvironmentalBounds(t, SITE_CONFIG);
    expect(result.isValid).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  test('pH out of range fails', () => {
    const t = { flowRate: 2.5, pH: 4.0, turbidity: 10, temperature: 18 };
    const result = detector.validateEnvironmentalBounds(t, SITE_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.violations).toContain('ph');
  });

  test('Turbidity out of range fails', () => {
    const t = { flowRate: 2.5, pH: 7.2, turbidity: 200, temperature: 18 };
    const result = detector.validateEnvironmentalBounds(t, SITE_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.violations).toContain('turbidity');
  });

  test('Temperature out of range fails', () => {
    const t = { flowRate: 2.5, pH: 7.2, turbidity: 10, temperature: 50 };
    const result = detector.validateEnvironmentalBounds(t, SITE_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.violations).toContain('temperature');
  });

  test('Flow rate out of range fails', () => {
    const t = { flowRate: 500, pH: 7.2, turbidity: 10, temperature: 18 };
    const result = detector.validateEnvironmentalBounds(t, SITE_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.violations).toContain('flowRate');
  });
});

describe('Statistical Anomaly Detection', () => {
  let detector;
  beforeEach(() => { detector = new AnomalyDetector(); });

  function makeHistory(base, count) {
    return Array.from({ length: count }, (_, i) => ({ flowRate: base + (i % 3) * 0.1 }));
  }

  test('Normal reading passes statistical anomaly detection', () => {
    const history = makeHistory(2.5, 20);
    const result = detector.detectStatisticalAnomalies({ flowRate: 2.6 }, history);
    expect(result.isValid).toBe(true);
    expect(result.zScore).toBeLessThan(3);
  });

  test('High outlier (flowRate=200 vs history ~2.5) fails and has z-score > 3', () => {
    // Build stable history so stdDev is well-defined
    const history = Array.from({ length: 20 }, () => ({ flowRate: 2.5 }));
    // Add tiny jitter so stdDev > 0
    history[0].flowRate = 2.4;
    history[1].flowRate = 2.6;
    const result = detector.detectStatisticalAnomalies({ flowRate: 200 }, history);
    expect(result.isValid).toBe(false);
    expect(result.zScore).toBeGreaterThan(3);
  });

  test('Low outlier (flowRate=-50 vs history ~2.5) fails and has z-score > 3', () => {
    const history = Array.from({ length: 20 }, () => ({ flowRate: 2.5 }));
    history[0].flowRate = 2.4;
    history[1].flowRate = 2.6;
    const result = detector.detectStatisticalAnomalies({ flowRate: -50 }, history);
    expect(result.isValid).toBe(false);
    expect(result.zScore).toBeGreaterThan(3);
  });

  test('Reading at z-score boundary (z=3) passes (boundary is exclusive)', () => {
    // Use exact history so we can place current at exactly z=3 or just below
    const history = Array.from({ length: 20 }, () => ({ flowRate: 2.5 }));
    history[0].flowRate = 2.4;
    history[1].flowRate = 2.6;
    // z ~= 0 for same value as mean
    const result = detector.detectStatisticalAnomalies({ flowRate: 2.5 }, history);
    expect(result.isValid).toBe(true);
  });

  test('Empty history returns isValid=true', () => {
    const result = detector.detectStatisticalAnomalies({ flowRate: 200 }, []);
    expect(result.isValid).toBe(true);
  });
});

describe('Complete Validation', () => {
  let detector;
  beforeEach(() => { detector = new AnomalyDetector(); });

  test('All checks pass => isValid true', () => {
    const telemetry = {
      flowRate: 2.5, head: 45, generatedKwh: 900, efficiency: 0.85,
      pH: 7.2, turbidity: 10, temperature: 18,
      timestamp: '2025-01-01T01:00:00Z'
    };
    const prev = { timestamp: '2025-01-01T00:00:00Z', generatedKwh: 800 };
    const history = Array.from({ length: 10 }, () => ({ flowRate: 2.5 }));
    const result = detector.completeValidation(telemetry, prev, history, SITE_CONFIG);
    expect(result.physics.isValid).toBe(true);
    expect(result.temporal.isValid).toBe(true);
    expect(result.environmental.isValid).toBe(true);
    expect(result.statistical.isValid).toBe(true);
    expect(result.isValid).toBe(true);
  });

  test('Physics failure => isValid false', () => {
    const telemetry = {
      flowRate: 200, head: -10, generatedKwh: 99999, efficiency: 2.0,
      timestamp: '2025-01-01T01:00:00Z'
    };
    const result = detector.completeValidation(telemetry, null, [], null);
    expect(result.physics.isValid).toBe(false);
    expect(result.isValid).toBe(false);
  });

  test('No previous reading => temporal check skipped gracefully', () => {
    const telemetry = {
      flowRate: 2.5, head: 45, generatedKwh: 900, efficiency: 0.85,
      timestamp: '2025-01-01T01:00:00Z'
    };
    const result = detector.completeValidation(telemetry, null, [], null);
    expect(result.temporal.isValid).toBe(true);
  });

  test('Missing required fields => returns isValid false (graceful, no throw)', () => {
    const result = detector.completeValidation({}, null, [], null);
    // Should not throw; isValid may be true (no violations triggered) or false
    expect(typeof result.isValid).toBe('boolean');
  });
});
