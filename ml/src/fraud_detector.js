/**
 * ML Fraud Detector for Hydropower MRV
 * Detects anomalous/fraudulent sensor readings
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
class FraudDetector {
  constructor() {
    this.modelPath = path.join(__dirname, '../models/isolation_forest_v0.1.pkl');
    this.modelLoaded = false;
    this.stats = {
      totalPredictions: 0,
      mlPredictions: 0,
      fallbackPredictions: 0
    };
  }
  async initialize() {
    // Check if ML model exists
    this.modelLoaded = fs.existsSync(this.modelPath);
    if (this.modelLoaded) {
      console.log('[ML] Model loaded from:', this.modelPath);
    } else {
      console.log('[ML] Model not found, using rule-based fallback');
    }
  }
  isModelLoaded() {
    return this.modelLoaded;
  }
  async predict(reading) {
    this.stats.totalPredictions++;
    if (this.modelLoaded) {
      return await this._predictWithML(reading);
    } else {
      return this._predictWithRules(reading);
    }
  }
  async _predictWithML(reading) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../scripts/predict.py');
      const python = spawn('python', [
        pythonScript,
        JSON.stringify(reading)
      ]);
      let output = '';
      python.stdout.on('data', (data) => {
        output += data.toString();
      });
      python.stderr.on('data', (data) => {
        console.error('[ML Error]:', data.toString());
      });
      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            this.stats.mlPredictions++;
            resolve({
              isFraud: result.fraud_score > 0.6,
              score: result.fraud_score,
              confidence: result.confidence || 0.85,
              method: 'ML_ISOLATION_FOREST'
            });
          } catch (e) {
            console.error('[ML Parse Error]:', e);
            resolve(this._predictWithRules(reading));
          }
        } else {
          resolve(this._predictWithRules(reading));
        }
      });
    });
  }
  _predictWithRules(reading) {
    this.stats.fallbackPredictions++;
    const { waterFlow, powerOutput, efficiency } = reading;
    // Rule-based fraud detection
    let score = 0;
    // Check water flow (normal: 100-150)
    if (waterFlow < 80 || waterFlow > 200) score += 0.4;
    // Check power output (normal: 80-100)
    if (powerOutput < 60 || powerOutput > 120) score += 0.3;
    // Check efficiency (normal: 0.75-0.95)
    if (efficiency < 0.6 || efficiency > 1.0) score += 0.3;
    return {
      isFraud: score > 0.6,
      score: parseFloat(score.toFixed(2)),
      confidence: 0.75,
      method: 'RULE_BASED_ZSCORE'
    };
  }
  getStats() {
    return {
      ...this.stats,
      modelLoaded: this.modelLoaded,
      mlUsageRate: this.stats.totalPredictions > 0 
        ? (this.stats.mlPredictions / this.stats.totalPredictions) * 100 
        : 0
    };
  }
}
module.exports = FraudDetector;
