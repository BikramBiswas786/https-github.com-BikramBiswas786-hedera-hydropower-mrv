'use strict';

const fs = require('fs').promises;
const path = require('path');

/**
 * Feedback Storage for Active Learning
 * Stores human corrections to ML predictions for model improvement
 * 
 * Usage:
 *   const store = new FeedbackStore();
 *   await store.load();
 *   await store.addFeedback({ readingId, originalLabel, correctLabel });
 *   const stats = store.getStats();
 */
class FeedbackStore {
  constructor(filePath = './data/feedback.json') {
    this.filePath = path.resolve(filePath);
    this.feedback = [];
  }

  /**
   * Load feedback from disk
   */
  async load() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      this.feedback = JSON.parse(data);
      console.log(`✅ Loaded ${this.feedback.length} feedback entries from ${this.filePath}`);
      return this.feedback.length;
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('ℹ️ No existing feedback file, starting fresh');
        this.feedback = [];
        return 0;
      }
      throw err;
    }
  }

  /**
   * Save feedback to disk
   */
  async save() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(
        this.filePath,
        JSON.stringify(this.feedback, null, 2)
      );
    } catch (err) {
      console.error('[FeedbackStore] Save error:', err);
      throw err;
    }
  }

  /**
   * Add new feedback entry
   * @param {object} entry - Feedback data
   * @param {string} entry.readingId - Unique reading identifier
   * @param {string} entry.originalLabel - ML prediction (anomaly/normal)
   * @param {string} entry.correctLabel - Human correction (anomaly/normal)
   * @param {number} [entry.confidence] - ML confidence score
   * @param {object} [entry.reading] - Original reading data
   * @param {string} [entry.notes] - Optional human notes
   */
  async addFeedback(entry) {
    if (!entry.readingId || !entry.originalLabel || !entry.correctLabel) {
      throw new Error('Missing required fields: readingId, originalLabel, correctLabel');
    }

    const feedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      readingId: entry.readingId,
      originalLabel: entry.originalLabel,
      correctLabel: entry.correctLabel,
      confidence: entry.confidence || null,
      reading: entry.reading || null,
      notes: entry.notes || null
    };

    this.feedback.push(feedbackEntry);
    await this.save();

    return feedbackEntry;
  }

  /**
   * Get feedback entries with optional filters
   * @param {object} filters - Filter criteria
   * @param {string} [filters.correctLabel] - Filter by correct label
   * @param {number} [filters.confidence] - Max confidence threshold
   * @param {number} [filters.limit] - Max number of results
   * @returns {Array} Filtered feedback entries
   */
  getFeedback(filters = {}) {
    let result = [...this.feedback];

    // Filter by correct label
    if (filters.correctLabel !== undefined) {
      result = result.filter(f => f.correctLabel === filters.correctLabel);
    }

    // Filter by confidence threshold
    if (filters.confidence !== undefined) {
      result = result.filter(f => {
        const conf = f.confidence || 1.0;
        return conf < filters.confidence;
      });
    }

    // Filter by date range
    if (filters.startDate) {
      result = result.filter(f => f.timestamp >= filters.startDate);
    }

    if (filters.endDate) {
      result = result.filter(f => f.timestamp <= filters.endDate);
    }

    // Limit results
    if (filters.limit) {
      result = result.slice(-filters.limit);
    }

    return result;
  }

  /**
   * Get confusion matrix and performance statistics
   * @returns {object} Statistics including precision, recall, accuracy
   */
  getStats() {
    const stats = {
      total: this.feedback.length,
      truePositives: 0,   // Correctly identified anomalies
      falsePositives: 0,  // Normal flagged as anomaly
      falseNegatives: 0,  // Anomaly missed
      trueNegatives: 0    // Correctly identified normal
    };

    // Build confusion matrix
    this.feedback.forEach(f => {
      const predicted = f.originalLabel;
      const actual = f.correctLabel;

      if (predicted === 'anomaly' && actual === 'anomaly') {
        stats.truePositives++;
      } else if (predicted === 'anomaly' && actual === 'normal') {
        stats.falsePositives++;
      } else if (predicted === 'normal' && actual === 'anomaly') {
        stats.falseNegatives++;
      } else if (predicted === 'normal' && actual === 'normal') {
        stats.trueNegatives++;
      }
    });

    // Calculate performance metrics
    const tp = stats.truePositives;
    const fp = stats.falsePositives;
    const fn = stats.falseNegatives;
    const tn = stats.trueNegatives;

    // Precision: Of all predicted anomalies, how many were correct?
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;

    // Recall: Of all actual anomalies, how many did we catch?
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;

    // Accuracy: Overall correctness
    const accuracy = stats.total > 0 ? (tp + tn) / stats.total : 0;

    // F1 Score: Harmonic mean of precision and recall
    const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    return {
      ...stats,
      precision: parseFloat(precision.toFixed(4)),
      recall: parseFloat(recall.toFixed(4)),
      accuracy: parseFloat(accuracy.toFixed(4)),
      f1Score: parseFloat(f1Score.toFixed(4)),
      falsePositiveRate: fp + tn > 0 ? parseFloat((fp / (fp + tn)).toFixed(4)) : 0,
      falseNegativeRate: tp + fn > 0 ? parseFloat((fn / (tp + fn)).toFixed(4)) : 0
    };
  }

  /**
   * Get insights about model performance
   * @returns {object} Actionable insights
   */
  getInsights() {
    const stats = this.getStats();
    const insights = {
      summary: '',
      recommendations: [],
      needsRetraining: false
    };

    // Check if enough data for insights
    if (stats.total < 10) {
      insights.summary = 'Insufficient feedback data for insights';
      return insights;
    }

    // High false positive rate
    if (stats.falsePositiveRate > 0.2) {
      insights.recommendations.push(
        `High false positive rate (${(stats.falsePositiveRate * 100).toFixed(1)}%). Model is too sensitive. Consider increasing anomaly threshold.`
      );
      insights.needsRetraining = stats.total >= 50;
    }

    // High false negative rate
    if (stats.falseNegativeRate > 0.2) {
      insights.recommendations.push(
        `High false negative rate (${(stats.falseNegativeRate * 100).toFixed(1)}%). Model is missing anomalies. Consider decreasing threshold.`
      );
      insights.needsRetraining = stats.total >= 50;
    }

    // Good performance
    if (stats.accuracy > 0.9 && stats.f1Score > 0.85) {
      insights.summary = 'Model performing well! Accuracy and F1 score are excellent.';
    } else if (stats.accuracy > 0.75) {
      insights.summary = 'Model performing adequately but has room for improvement.';
    } else {
      insights.summary = 'Model performance is poor. Retraining strongly recommended.';
      insights.needsRetraining = true;
    }

    // Retraining threshold
    if (stats.total >= 50 && stats.total % 50 === 0) {
      insights.recommendations.push(
        `${stats.total} feedback samples collected. Consider retraining model with updated data.`
      );
      insights.needsRetraining = true;
    }

    return insights;
  }

  /**
   * Clear all feedback (use with caution)
   */
  async clear() {
    this.feedback = [];
    await this.save();
  }

  /**
   * Export feedback for model retraining
   * @returns {Array} Formatted training samples
   */
  exportForTraining() {
    return this.feedback.map(f => ({
      features: f.reading,
      label: f.correctLabel === 'anomaly' ? 1 : 0,
      weight: f.confidence ? (1 - f.confidence) : 1.0 // Give more weight to uncertain predictions
    }));
  }
}

module.exports = { FeedbackStore };
