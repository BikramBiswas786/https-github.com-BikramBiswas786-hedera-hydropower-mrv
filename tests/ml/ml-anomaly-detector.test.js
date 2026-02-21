'use strict';

/**
 * Tests for real ML Isolation Forest anomaly detector.
 * Validates that the model correctly separates normal readings
 * from fraudulent / sensor-fault readings.
 */

const { IsolationForest }   = require('../../src/ml/IsolationForest');
const { MLAnomalyDetector, extractFeatures } = require('../../src/ml/MLAnomalyDetector');
const { generateDataset }   = require('../../src/ml/SyntheticDataGenerator');

// ─────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────

// Physically valid 6 MW plant reading (flowRate 2.5 m³/s, head 45m)
const NORMAL_READING = {
  flowRate_m3_per_s:  2.5,
  headHeight_m:        45,
  generatedKwh:        936,   // ≈ 1000*9.81*2.5*45*0.85/1000 = 934 kWh  (+0.2%)
  pH:                  7.2,
  turbidity_ntu:       10,
  temperature_celsius: 18
};

// 10× inflated fraud attempt (carbon credit scam)
const FRAUD_READING = {
  ...NORMAL_READING,
  generatedKwh: 9360   // 10× normal
};

// Sensor fault — completely implausible
const FAULT_READING = {
  flowRate_m3_per_s:  2.5,
  headHeight_m:        45,
  generatedKwh:        45000, // Physically impossible
  pH:                  3.1,   // Acid rain levels
  turbidity_ntu:       800,   // Catastrophic flood
  temperature_celsius: 60     // Boiling river
};

// ─────────────────────────────────────────────────────────────────
// IsolationForest unit tests
// ─────────────────────────────────────────────────────────────────

describe('IsolationForest (pure JS)', () => {
  let forest;

  beforeAll(() => {
    // Train on 500 normal-ish 2D points
    const normal = Array.from({ length: 500 }, () => [
      0.4 + Math.random() * 0.2,
      0.4 + Math.random() * 0.2
    ]);
    forest = new IsolationForest({ nTrees: 50, sampleSize: 128, contamination: 0.1 });
    forest.fit(normal);
  });

  test('fit() sets trained=true', () => {
    expect(forest.trained).toBe(true);
  });

  test('fit() produces correct number of trees', () => {
    expect(forest.trees).toHaveLength(50);
  });

  test('fit() sets a finite threshold', () => {
    expect(typeof forest.threshold).toBe('number');
    expect(isFinite(forest.threshold)).toBe(true);
  });

  test('normal centre point scores as non-anomaly', () => {
    const result = forest.score([0.5, 0.5]);
    expect(result.isAnomaly).toBe(false);
  });

  test('extreme outlier scores as anomaly', () => {
    const result = forest.score([10.0, 10.0]);
    expect(result.isAnomaly).toBe(true);
  });

  test('score() returns values in expected range', () => {
    const result = forest.score([0.5, 0.5]);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('toJSON() / fromJSON() roundtrip preserves scores', () => {
    const json    = forest.toJSON();
    const loaded  = IsolationForest.fromJSON(json);
    const original = forest.score([0.5, 0.5]);
    const restored = loaded.score([0.5, 0.5]);
    expect(restored.score).toBeCloseTo(original.score, 5);
    expect(restored.isAnomaly).toBe(original.isAnomaly);
  });

  test('scoreMany() processes array correctly', () => {
    const results = forest.scoreMany([[0.5, 0.5], [10, 10]]);
    expect(results).toHaveLength(2);
    expect(results[0].isAnomaly).toBe(false);
    expect(results[1].isAnomaly).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────
// Feature extraction tests
// ─────────────────────────────────────────────────────────────────

describe('Feature extraction (8-dim normalised)', () => {
  test('extractFeatures returns 8-element array', () => {
    const { features } = extractFeatures(NORMAL_READING);
    expect(features).toHaveLength(8);
  });

  test('all features in [0, 1]', () => {
    const { features } = extractFeatures(NORMAL_READING);
    features.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });

  test('fraud reading has higher efficiencyRatio feature', () => {
    const { features: fNormal } = extractFeatures(NORMAL_READING);
    const { features: fFraud }  = extractFeatures(FRAUD_READING);
    // Feature index 7 = efficiencyRatio
    expect(fFraud[7]).toBeGreaterThan(fNormal[7]);
  });
});

// ─────────────────────────────────────────────────────────────────
// MLAnomalyDetector integration tests
// ─────────────────────────────────────────────────────────────────

describe('MLAnomalyDetector (Isolation Forest, auto-trained)', () => {
  let detector;

  beforeAll(() => {
    // Use fresh instance (not singleton) for isolated testing
    detector = new MLAnomalyDetector({ trainSamples: 1000, nTrees: 50 });
  });

  test('detector trains successfully on startup', () => {
    const info = detector.getInfo();
    expect(info.trained).toBe(true);
    expect(info.trainedOn).toBeGreaterThan(0);
    expect(info.algorithm).toContain('IsolationForest');
  });

  test('normal reading is NOT flagged as anomaly', () => {
    const result = detector.detect(NORMAL_READING);
    expect(result.isAnomaly).toBe(false);
    expect(result.method).toBe('ISOLATION_FOREST_ML');
  });

  test('10× fraud reading IS flagged as anomaly', () => {
    const result = detector.detect(FRAUD_READING);
    expect(result.isAnomaly).toBe(true);
    expect(result.score).toBeGreaterThan(0.5);
  });

  test('sensor fault reading IS flagged as anomaly', () => {
    const result = detector.detect(FAULT_READING);
    expect(result.isAnomaly).toBe(true);
  });

  test('detect() returns featureVector of length 8', () => {
    const result = detector.detect(NORMAL_READING);
    expect(result.featureVector).toHaveLength(8);
  });

  test('retrain() updates model with new data', () => {
    const freshReadings = Array.from({ length: 100 }, () => ({
      ...NORMAL_READING,
      generatedKwh: 900 + (Math.random() - 0.5) * 50
    }));
    expect(() => detector.retrain(freshReadings)).not.toThrow();
    const info = detector.getInfo();
    expect(info.trainedOn).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────
// Bulk detection accuracy test
// ─────────────────────────────────────────────────────────────────

describe('Bulk detection accuracy (synthetic dataset)', () => {
  let detector;

  beforeAll(() => {
    detector = new MLAnomalyDetector({ trainSamples: 1500, nTrees: 80 });
  });

  test('correctly classifies >70% of anomalies in 200-sample test set', () => {
    const dataset   = generateDataset(200);
    const anomalies = dataset.filter(d => d.label !== 'normal');

    let correct = 0;
    for (const sample of anomalies) {
      const result = detector.detect(sample.reading);
      if (result.isAnomaly) correct++;
    }

    const recall = correct / anomalies.length;
    // Expect at least 70% recall on synthetic anomalies
    expect(recall).toBeGreaterThanOrEqual(0.70);
  });
});
