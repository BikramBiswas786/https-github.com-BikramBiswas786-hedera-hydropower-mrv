'use strict';

/**
 * Model Drift Detector
 * ───────────────────
 * Detects when production data distribution shifts away from
 * training data (concept drift / data drift).
 *
 * Uses Kolmogorov-Smirnov (KS) two-sample test to compare
 * feature distributions.
 *
 * Reference:
 *   Massey, F.J. (1951). "The Kolmogorov-Smirnov test for goodness of fit".
 *   Journal of the American Statistical Association.
 */

const { extractFeatures, FEATURE_NAMES } = require('./MLAnomalyDetector');

/**
 * Kolmogorov-Smirnov test for two samples.
 * @param {number[]} sample1 - First sample
 * @param {number[]} sample2 - Second sample
 * @returns {{ statistic: number, pValue: number }}
 */
function kolmogorovSmirnovTest(sample1, sample2) {
  // Sort both samples
  const s1 = [...sample1].sort((a, b) => a - b);
  const s2 = [...sample2].sort((a, b) => a - b);

  const n1 = s1.length;
  const n2 = s2.length;

  // Combine and sort unique values
  const allValues = [...new Set([...s1, ...s2])].sort((a, b) => a - b);

  let maxDiff = 0;

  for (const value of allValues) {
    // Empirical CDF for sample1
    const cdf1 = s1.filter(x => x <= value).length / n1;
    // Empirical CDF for sample2
    const cdf2 = s2.filter(x => x <= value).length / n2;
    const diff = Math.abs(cdf1 - cdf2);
    if (diff > maxDiff) maxDiff = diff;
  }

  // Approximate p-value using Smirnov's formula
  const n = (n1 * n2) / (n1 + n2);
  const lambda = maxDiff * Math.sqrt(n);
  const pValue = Math.exp(-2 * lambda * lambda);  // Approximation for large n

  return {
    statistic: parseFloat(maxDiff.toFixed(4)),
    pValue: parseFloat(pValue.toFixed(6))
  };
}

/**
 * Compute basic statistics for a feature.
 */
function computeStats(values) {
  const n = values.length;
  if (n === 0) return { mean: 0, std: 0, min: 0, max: 0 };

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    mean: parseFloat(mean.toFixed(4)),
    std:  parseFloat(std.toFixed(4)),
    min:  parseFloat(min.toFixed(4)),
    max:  parseFloat(max.toFixed(4))
  };
}

class DriftDetector {
  /**
   * @param {object[]} trainingReadings - Array of raw telemetry readings used for training
   * @param {object} options
   * @param {number} options.pValueThreshold - KS test p-value threshold (default 0.05)
   * @param {number} options.minSampleSize - Minimum samples needed for drift check (default 30)
   */
  constructor(trainingReadings = [], options = {}) {
    this.pValueThreshold = options.pValueThreshold || 0.05;
    this.minSampleSize   = options.minSampleSize   || 30;
    this.trainingStats   = {};
    this.trainingFeatures = [];

    if (trainingReadings.length > 0) {
      this._computeTrainingStats(trainingReadings);
    }
  }

  _computeTrainingStats(readings) {
    // Extract all features
    const featureVectors = readings.map(r => extractFeatures(r).features);
    this.trainingFeatures = featureVectors;

    // Compute stats per feature
    FEATURE_NAMES.forEach((name, idx) => {
      const values = featureVectors.map(fv => fv[idx]);
      this.trainingStats[name] = {
        ...computeStats(values),
        values  // Store for KS test
      };
    });

    console.log(
      `[DriftDetector] Initialized with ${readings.length} training samples, ` +
      `${FEATURE_NAMES.length} features tracked.`
    );
  }

  /**
   * Check if new production data has drifted from training distribution.
   * @param {object[]} newReadings - Array of raw telemetry readings from production
   * @returns {{
   *   hasDrift: boolean,
   *   driftedFeatures: Array<{ feature: string, pValue: number, severity: string }>,
   *   newStats: object,
   *   recommendation: string
   * }}
   */
  checkDrift(newReadings) {
    if (!this.trainingStats || Object.keys(this.trainingStats).length === 0) {
      return {
        hasDrift: false,
        driftedFeatures: [],
        recommendation: 'No training baseline — cannot detect drift.'
      };
    }

    if (newReadings.length < this.minSampleSize) {
      return {
        hasDrift: false,
        driftedFeatures: [],
        recommendation: `Need at least ${this.minSampleSize} samples for drift detection (got ${newReadings.length}).`
      };
    }

    // Extract features from new readings
    const newFeatureVectors = newReadings.map(r => extractFeatures(r).features);
    const newStats = {};
    const driftedFeatures = [];

    FEATURE_NAMES.forEach((name, idx) => {
      const trainingValues = this.trainingStats[name].values;
      const newValues = newFeatureVectors.map(fv => fv[idx]);
      newStats[name] = computeStats(newValues);

      // Perform KS test
      const ksResult = kolmogorovSmirnovTest(trainingValues, newValues);

      if (ksResult.pValue < this.pValueThreshold) {
        const severity =
          ksResult.pValue < 0.001 ? 'HIGH' :
          ksResult.pValue < 0.01  ? 'MEDIUM' :
          'LOW';

        driftedFeatures.push({
          feature: name,
          pValue: ksResult.pValue,
          ksStatistic: ksResult.statistic,
          severity,
          trainingMean: this.trainingStats[name].mean,
          newMean: newStats[name].mean,
          meanShift: parseFloat((newStats[name].mean - this.trainingStats[name].mean).toFixed(4))
        });
      }
    });

    // Sort by severity
    driftedFeatures.sort((a, b) => a.pValue - b.pValue);

    const hasDrift = driftedFeatures.length > 0;
    let recommendation = '';

    if (hasDrift) {
      const topDrift = driftedFeatures[0];
      recommendation =
        `⚠️ Model drift detected: ${topDrift.feature} distribution ` +
        `shifted significantly (p=${topDrift.pValue.toFixed(4)}). ` +
        `Recommend retraining model with last 30 days of production data.`;
    } else {
      recommendation = '✅ No significant drift detected. Model is still valid.';
    }

    return {
      hasDrift,
      driftedFeatures,
      newStats,
      trainingStats: this.trainingStats,
      samplesChecked: newReadings.length,
      recommendation
    };
  }

  /**
   * Update training baseline with new data.
   * Call this after retraining the ML model.
   */
  updateBaseline(newTrainingReadings) {
    this._computeTrainingStats(newTrainingReadings);
    console.log(
      `[DriftDetector] Baseline updated with ${newTrainingReadings.length} new training samples.`
    );
  }
}

module.exports = { DriftDetector, kolmogorovSmirnovTest, computeStats };
