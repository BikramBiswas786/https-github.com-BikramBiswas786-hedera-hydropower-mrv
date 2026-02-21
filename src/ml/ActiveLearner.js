'use strict';

/**
 * Active Learning Loop - Human-in-the-Loop
 * ════════════════════════════════════════════════════════════════════
 * Continuous model improvement through operator feedback
 */

class ActiveLearner {
  constructor(mlDetector, options = {}) {
    this.mlDetector = mlDetector;
    this.minFeedbackForRetrain = options.minFeedback || 50;
    this.retrainInterval = options.retrainInterval || 1000; // readings
    
    this.feedbackBuffer = [];
    this.retrainHistory = [];
    this.metrics = {
      totalFeedback: 0,
      truePositives: 0,
      falsePositives: 0,
      trueNegatives: 0,
      falseNegatives: 0
    };
  }

  /**
   * Add human feedback for a reading
   * @param {object} reading - The reading that was flagged
   * @param {string} feedback - 'true_positive', 'false_positive', 'false_negative', 'true_negative'
   * @param {object} context - Optional context (operator notes, etc.)
   */
  addFeedback(reading, feedback, context = {}) {
    const feedbackEntry = {
      reading,
      feedback,
      timestamp: new Date().toISOString(),
      operator: context.operator || 'unknown',
      notes: context.notes || '',
      features: reading.featureVector || reading.features
    };

    this.feedbackBuffer.push(feedbackEntry);
    this.metrics.totalFeedback++;

    // Update metrics
    switch (feedback) {
      case 'true_positive':
        this.metrics.truePositives++;
        break;
      case 'false_positive':
        this.metrics.falsePositives++;
        break;
      case 'true_negative':
        this.metrics.trueNegatives++;
        break;
      case 'false_negative':
        this.metrics.falseNegatives++;
        break;
    }

    console.log(`[ActiveLearner] Feedback added: ${feedback} (total: ${this.metrics.totalFeedback})`);
  }

  /**
   * Check if model should be retrained
   */
  shouldRetrain() {
    // Retrain if we have enough feedback
    if (this.feedbackBuffer.length >= this.minFeedbackForRetrain) {
      return true;
    }

    // Retrain if false positive rate is too high
    const fpRate = this.getFalsePositiveRate();
    if (fpRate > 0.3 && this.feedbackBuffer.length >= 20) {
      console.log(`[ActiveLearner] High FP rate (${(fpRate * 100).toFixed(1)}%), triggering retrain`);
      return true;
    }

    return false;
  }

  /**
   * Retrain model with feedback
   */
  retrain() {
    if (this.feedbackBuffer.length === 0) {
      console.warn('[ActiveLearner] No feedback to retrain on');
      return false;
    }

    console.log(`[ActiveLearner] Retraining with ${this.feedbackBuffer.length} feedback samples...`);

    // Separate correct vs incorrect classifications
    const correctNormals = this.feedbackBuffer
      .filter(f => f.feedback === 'true_negative')
      .map(f => f.reading);

    const missedAnomalies = this.feedbackBuffer
      .filter(f => f.feedback === 'false_negative')
      .map(f => f.reading);

    // Build retraining dataset
    // Include high-confidence correct classifications
    const retrainingData = [
      ...correctNormals,
      ...missedAnomalies
    ];

    if (retrainingData.length < 10) {
      console.warn('[ActiveLearner] Insufficient data for retraining');
      return false;
    }

    // Retrain ML detector
    try {
      this.mlDetector.retrain(retrainingData);
      
      // Record retrain event
      this.retrainHistory.push({
        timestamp: new Date().toISOString(),
        feedbackUsed: this.feedbackBuffer.length,
        metrics: { ...this.metrics }
      });

      // Clear feedback buffer
      this.feedbackBuffer = [];

      console.log('[ActiveLearner] ✅ Retrain successful');
      return true;
    } catch (error) {
      console.error('[ActiveLearner] Retrain failed:', error.message);
      return false;
    }
  }

  /**
   * Get readings that model is uncertain about (for human review)
   * @param {Array} readings - Recent readings
   * @param {number} topN - How many uncertain readings to return
   */
  getUncertainReadings(readings, topN = 10) {
    const scored = readings.map(r => {
      const result = this.mlDetector.detect(r);
      
      // Uncertainty is high when score is near threshold (0.5)
      const uncertainty = 1 - Math.abs(result.score - 0.5) * 2;
      
      return {
        reading: r,
        result,
        uncertainty
      };
    });

    // Sort by uncertainty descending
    scored.sort((a, b) => b.uncertainty - a.uncertainty);

    return scored.slice(0, topN);
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const total = this.metrics.truePositives + this.metrics.falsePositives +
                  this.metrics.trueNegatives + this.metrics.falseNegatives;

    if (total === 0) {
      return {
        ...this.metrics,
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        falsePositiveRate: 0
      };
    }

    const tp = this.metrics.truePositives;
    const fp = this.metrics.falsePositives;
    const tn = this.metrics.trueNegatives;
    const fn = this.metrics.falseNegatives;

    const accuracy = (tp + tn) / total;
    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    const f1Score = 2 * (precision * recall) / (precision + recall || 1);
    const fpRate = fp / (fp + tn || 1);

    return {
      ...this.metrics,
      accuracy: parseFloat(accuracy.toFixed(4)),
      precision: parseFloat(precision.toFixed(4)),
      recall: parseFloat(recall.toFixed(4)),
      f1Score: parseFloat(f1Score.toFixed(4)),
      falsePositiveRate: parseFloat(fpRate.toFixed(4)),
      totalRetrains: this.retrainHistory.length
    };
  }

  /**
   * Get false positive rate
   */
  getFalsePositiveRate() {
    const fp = this.metrics.falsePositives;
    const tn = this.metrics.trueNegatives;
    return fp / (fp + tn || 1);
  }

  /**
   * Export state
   */
  toJSON() {
    return {
      feedbackBuffer: this.feedbackBuffer,
      retrainHistory: this.retrainHistory,
      metrics: this.metrics
    };
  }

  /**
   * Import state
   */
  static fromJSON(json, mlDetector) {
    const learner = new ActiveLearner(mlDetector);
    learner.feedbackBuffer = json.feedbackBuffer || [];
    learner.retrainHistory = json.retrainHistory || [];
    learner.metrics = json.metrics || learner.metrics;
    return learner;
  }
}

module.exports = { ActiveLearner };
