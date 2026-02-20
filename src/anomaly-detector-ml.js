/**
 * ML-Enhanced Anomaly Detector
 * 
 * Drop-in replacement for anomaly-detector.js with ML integration
 * 
 * Usage:
 *   const AnomalyDetector = require('./anomaly-detector-ml');
 *   const detector = new AnomalyDetector({ useML: true });
 */

const BaseDetector = require('./anomaly-detector');
const MLDetector = require('../ml/src/ml-detector');

class MLEnhancedAnomalyDetector extends BaseDetector {
  constructor(config) {
    super(config);
    
    this.useML = config?.useML === true;
    this.mlDetector = null;
    
    if (this.useML) {
      try {
        this.mlDetector = new MLDetector({
          enableFallback: true,
          minConfidence: config?.mlMinConfidence || 0.7
        });
        console.log('[AnomalyDetector] ML enhancement enabled');
      } catch (error) {
        console.warn('[AnomalyDetector] ML init failed, using rule-based only:', error.message);
        this.useML = false;
      }
    }
  }

  /**
   * Override: detectStatisticalAnomalies with ML
   */
  async detectStatisticalAnomalies(currentReading, historicalReadings) {
    // Try ML first if enabled
    if (this.useML && this.mlDetector) {
      try {
        const mlResult = await this.mlDetector.predict(currentReading, historicalReadings);
        
        return {
          isValid: !mlResult.isAnomaly,
          hasAnomaly: mlResult.isAnomaly,
          anomalies: mlResult.isAnomaly ? [{
            field: 'multi_feature',
            type: 'ml_anomaly',
            severity: mlResult.score > 0.8 ? 'critical' : 'high'
          }] : [],
          zScore: mlResult.score * 3,  // Convert to Z-score equivalent
          method: mlResult.method,
          confidence: mlResult.confidence,
          mlDetails: mlResult.details
        };
      } catch (error) {
        console.warn('[AnomalyDetector] ML prediction failed, using rule-based fallback:', error.message);
      }
    }

    // Fallback to parent class rule-based detection
    return super.detectStatisticalAnomalies(currentReading, historicalReadings);
  }

  /**
   * Get ML statistics
   */
  getMLStats() {
    if (!this.mlDetector) {
      return {
        enabled: false,
        reason: 'ML not initialized'
      };
    }

    return {
      enabled: true,
      ...this.mlDetector.getStats()
    };
  }
}

module.exports = MLEnhancedAnomalyDetector;
