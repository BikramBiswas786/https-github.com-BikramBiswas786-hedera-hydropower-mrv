/**
 * Anomaly Detector Unit Tests (tests/unit/) — Jest
 * Mirrors tests/anomaly-detector.test.js for the unit/ folder
 */
'use strict';
const AnomalyDetector = require('../../src/anomaly-detector');

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
    expect(detector.validateTemporalConsistency(curr, prev).isValid).toBe(true);
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
});

describe('Environmental Bounds', () => {
  let detector;
  beforeEach(() => { detector = new AnomalyDetector(); });

  test('All valid parameters pass', () => {
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

  test('Normal reading passes statistical anomaly detection', () => {
    const history = Array.from({ length: 20 }, () => ({ flowRate: 2.5 }));
    const result = detector.detectStatisticalAnomalies({ flowRate: 2.5 }, history);
    expect(result.isValid).toBe(true);
    expect(result.zScore).toBeLessThan(3);
  });

  test('High outlier fails and has z-score > 3', () => {
    const history = Array.from({ length: 20 }, () => ({ flowRate: 2.5 }));
    history[0].flowRate = 2.4;
    history[1].flowRate = 2.6;
    const result = detector.detectStatisticalAnomalies({ flowRate: 200 }, history);
    expect(result.isValid).toBe(false);
    expect(result.zScore).toBeGreaterThan(3);
  });

  test('Low outlier fails and has z-score > 3', () => {
    const history = Array.from({ length: 20 }, () => ({ flowRate: 2.5 }));
    history[0].flowRate = 2.4;
    history[1].flowRate = 2.6;
    const result = detector.detectStatisticalAnomalies({ flowRate: -50 }, history);
    expect(result.isValid).toBe(false);
    expect(result.zScore).toBeGreaterThan(3);
  });

  test('Reading at mean passes z-score check', () => {
    const history = Array.from({ length: 20 }, () => ({ flowRate: 2.5 }));
    history[0].flowRate = 2.4;
    history[1].flowRate = 2.6;
    const result = detector.detectStatisticalAnomalies({ flowRate: 2.5 }, history);
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
    expect(result.isValid).toBe(true);
  });

  test('Physics failure => isValid false', () => {
    const telemetry = { flowRate: 200, head: -10, generatedKwh: 99999, efficiency: 2.0, timestamp: '2025-01-01T01:00:00Z' };
    const result = detector.completeValidation(telemetry, null, [], null);
    expect(result.physics.isValid).toBe(false);
    expect(result.isValid).toBe(false);
  });

  test('Missing fields returns boolean isValid without throwing', () => {
    const result = detector.completeValidation({}, null, [], null);
    expect(typeof result.isValid).toBe('boolean');
  });
});
