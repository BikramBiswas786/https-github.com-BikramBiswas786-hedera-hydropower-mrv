/**
 * ML Integration Tests
 * 
 * Verify ML detector works correctly with fallback logic
 */

const MLDetector = require('../src/ml-detector');
const fs = require('fs');
const path = require('path');

describe('ML Integration Tests', () => {
  let detector;

  beforeEach(() => {
    detector = new MLDetector({
      enableFallback: true,
      minConfidence: 0.7
    });
  });

  describe('Initialization', () => {
    test('should initialize with default config', () => {
      expect(detector).toBeDefined();
      expect(detector.config.minConfidence).toBe(0.7);
      expect(detector.config.enableFallback).toBe(true);
    });

    test('should check if model exists', () => {
      const stats = detector.getStats();
      expect(stats).toHaveProperty('modelLoaded');
      expect(stats).toHaveProperty('modelPath');
    });
  });

  describe('Fallback Detection', () => {
    test('should use fallback when no model', async () => {
      const reading = {
        flowRate: 2.5,
        head: 45,
        generatedKwh: 900,
        pH: 7.2,
        turbidity: 10,
        temperature: 18
      };

      const history = [
        { generatedKwh: 850 },
        { generatedKwh: 870 },
        { generatedKwh: 890 }
      ];

      const result = await detector.predict(reading, history);

      expect(result).toHaveProperty('isAnomaly');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('method');
      expect(result.method).toMatch(/RULE_BASED/);
    });

    test('should detect fraud with Z-score', async () => {
      const normalReading = { generatedKwh: 900 };
      const fraudReading = { generatedKwh: 50000 };

      const history = Array(10).fill({ generatedKwh: 900 });

      const normalResult = await detector.predict(normalReading, history);
      const fraudResult = await detector.predict(fraudReading, history);

      expect(normalResult.isAnomaly).toBe(false);
      expect(fraudResult.isAnomaly).toBe(true);
    });

    test('should handle empty history', async () => {
      const reading = { generatedKwh: 900 };
      const result = await detector.predict(reading, []);

      expect(result.isAnomaly).toBe(false);
      expect(result.method).toMatch(/NO_HISTORY/);
    });
  });

  describe('Statistics', () => {
    test('should track prediction counts', async () => {
      const reading = { generatedKwh: 900 };
      const history = [{ generatedKwh: 850 }];

      await detector.predict(reading, history);
      await detector.predict(reading, history);

      const stats = detector.getStats();
      expect(stats.totalPredictions).toBe(2);
    });

    test('should calculate ML usage rate', async () => {
      const reading = { generatedKwh: 900 };
      await detector.predict(reading, []);

      const stats = detector.getStats();
      expect(stats).toHaveProperty('mlUsageRate');
      expect(stats.mlUsageRate).toMatch(/%$/);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid reading gracefully', async () => {
      const invalidReading = {};
      const result = await detector.predict(invalidReading, []);

      expect(result).toHaveProperty('isAnomaly');
      expect(result.isAnomaly).toBe(false);
    });

    test('should timeout on long-running inference', async () => {
      const quickDetector = new MLDetector({
        timeout: 100,
        enableFallback: true
      });

      const reading = { generatedKwh: 900 };
      const result = await quickDetector.predict(reading, []);

      // Should fallback, not crash
      expect(result).toBeDefined();
    }, 10000);
  });
});
