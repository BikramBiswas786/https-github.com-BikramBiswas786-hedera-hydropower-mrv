/**
 * ML-Enhanced Anomaly Detector
 * 
 * Wraps machine learning models with transparent fallback logic.
 * 
 * Design principles:
 * 1. Graceful degradation (fallback to rule-based)
 * 2. Transparent confidence scoring
 * 3. Reproducible predictions
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MLDetector {
  constructor(config = {}) {
    this.config = {
      modelPath: config.modelPath || path.join(__dirname, '../models/isolation_forest_v0.1.pkl'),
      pythonPath: config.pythonPath || 'python3',
      minConfidence: config.minConfidence || 0.7,
      enableFallback: config.enableFallback !== false,
      timeout: config.timeout || 5000,
      ...config
    };

    this.modelLoaded = fs.existsSync(this.config.modelPath);
    this.fallbackCount = 0;
    this.mlCount = 0;
  }

  /**
   * Predict anomaly using ML model
   * @param {Object} reading - Single reading
   * @param {Array} historicalReadings - Historical context
   * @returns {Promise<{isAnomaly: boolean, score: number, confidence: number, method: string}>}
   */
  async predict(reading, historicalReadings = []) {
    if (!this.modelLoaded) {
      console.warn('[ML] Model not found, using rule-based fallback');
      return this._fallbackPredict(reading, historicalReadings);
    }

    try {
      const mlResult = await this._runMLInference(reading);
      this.mlCount++;

      // Check confidence threshold
      if (mlResult.confidence < this.config.minConfidence && this.config.enableFallback) {
        console.warn(`[ML] Low confidence (${mlResult.confidence}), using fallback`);
        return this._fallbackPredict(reading, historicalReadings);
      }

      return {
        isAnomaly: mlResult.isAnomaly,
        score: mlResult.score,
        confidence: mlResult.confidence,
        method: 'ML_ISOLATION_FOREST',
        details: mlResult.details
      };
    } catch (error) {
      console.error('[ML] Inference failed:', error.message);
      
      if (this.config.enableFallback) {
        return this._fallbackPredict(reading, historicalReadings);
      }
      
      throw error;
    }
  }

  /**
   * Run ML inference via Python subprocess
   */
  async _runMLInference(reading) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '../scripts/predict.py');
      
      const python = spawn(this.config.pythonPath, [
        scriptPath,
        this.config.modelPath,
        JSON.stringify(reading)
      ]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Timeout
      const timeout = setTimeout(() => {
        python.kill();
        reject(new Error('ML inference timeout'));
      }, this.config.timeout);

      python.on('close', (code) => {
        clearTimeout(timeout);

        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse ML output: ${error.message}`));
        }
      });
    });
  }

  /**
   * Fallback to rule-based Z-score detection
   */
  _fallbackPredict(reading, historicalReadings) {
    this.fallbackCount++;

    if (!historicalReadings || historicalReadings.length === 0) {
      return {
        isAnomaly: false,
        score: 0,
        confidence: 1.0,
        method: 'RULE_BASED_NO_HISTORY'
      };
    }

    // Z-score calculation
    const values = historicalReadings.map(r => r.generatedKwh).filter(v => v !== undefined);
    
    if (values.length === 0) {
      return {
        isAnomaly: false,
        score: 0,
        confidence: 1.0,
        method: 'RULE_BASED_NO_DATA'
      };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const zScore = stdDev > 0 ? Math.abs(reading.generatedKwh - mean) / stdDev : 0;

    return {
      isAnomaly: zScore > 3.0,
      score: Math.min(1.0, zScore / 3.0),
      confidence: 0.75,
      method: 'RULE_BASED_ZSCORE',
      details: { zScore, mean, stdDev }
    };
  }

  /**
   * Get detector statistics
   */
  getStats() {
    return {
      modelLoaded: this.modelLoaded,
      modelPath: this.config.modelPath,
      mlPredictions: this.mlCount,
      fallbackPredictions: this.fallbackCount,
      totalPredictions: this.mlCount + this.fallbackCount,
      mlUsageRate: this.mlCount + this.fallbackCount > 0 
        ? (this.mlCount / (this.mlCount + this.fallbackCount) * 100).toFixed(1) + '%'
        : '0%'
    };
  }
}

module.exports = MLDetector;
