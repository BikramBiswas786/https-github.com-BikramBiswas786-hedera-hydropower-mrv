'use strict';

/**
 * Time-Series Forecaster - Triple Exponential Smoothing
 * ─────────────────────────────────────────────────────────────────
 * Holt-Winters algorithm for hydropower generation forecasting
 * Accounts for trend and seasonality (monsoon patterns)
 */

class Forecaster {
  constructor(options = {}) {
    this.alpha = options.alpha || 0.2;  // Level smoothing
    this.beta  = options.beta  || 0.1;  // Trend smoothing
    this.gamma = options.gamma || 0.1;  // Seasonality smoothing
    this.seasonLength = options.seasonLength || 24; // 24 hours

    this.level = null;
    this.trend = null;
    this.seasonal = [];
    this.trained = false;
    this.history = [];
  }

  /**
   * Train on historical readings (hourly or daily)
   * @param {Array} readings - Array of { timestamp, generatedKwh }
   */
  train(readings) {
    if (!readings || readings.length < this.seasonLength * 2) {
      throw new Error(
        `Insufficient data. Need at least ${this.seasonLength * 2} readings, got ${readings?.length || 0}`
      );
    }

    // Extract time series
    const series = readings.map(r => r.generatedKwh || r.value || 0);
    this.history = series;

    // Initialize level (average of first season)
    const firstSeason = series.slice(0, this.seasonLength);
    this.level = firstSeason.reduce((a, b) => a + b, 0) / this.seasonLength;

    // Initialize trend (average change between first two seasons)
    const secondSeason = series.slice(this.seasonLength, this.seasonLength * 2);
    const firstAvg = this.level;
    const secondAvg = secondSeason.reduce((a, b) => a + b, 0) / this.seasonLength;
    this.trend = (secondAvg - firstAvg) / this.seasonLength;

    // Initialize seasonal components
    this.seasonal = [];
    for (let i = 0; i < this.seasonLength; i++) {
      let sum = 0;
      let count = 0;
      for (let j = i; j < series.length; j += this.seasonLength) {
        sum += series[j];
        count++;
      }
      const avg = sum / count;
      this.seasonal[i] = avg - this.level;
    }

    // Run Holt-Winters smoothing on historical data
    for (let t = 0; t < series.length; t++) {
      const observation = series[t];
      const seasonIndex = t % this.seasonLength;

      const prevLevel = this.level;
      const prevTrend = this.trend;
      const prevSeasonal = this.seasonal[seasonIndex];

      // Update level
      this.level = this.alpha * (observation - prevSeasonal) +
                   (1 - this.alpha) * (prevLevel + prevTrend);

      // Update trend
      this.trend = this.beta * (this.level - prevLevel) +
                   (1 - this.beta) * prevTrend;

      // Update seasonal component
      this.seasonal[seasonIndex] = this.gamma * (observation - this.level) +
                                   (1 - this.gamma) * prevSeasonal;
    }

    this.trained = true;
  }

  /**
   * Predict next N time steps
   * @param {number} steps - Number of future steps to forecast
   * @returns {Array} - Forecasted values with confidence intervals
   */
  predict(steps = 24) {
    if (!this.trained) {
      throw new Error('Model not trained. Call train() first.');
    }

    const forecasts = [];

    for (let h = 1; h <= steps; h++) {
      const seasonIndex = (this.history.length + h - 1) % this.seasonLength;
      const forecast = this.level + h * this.trend + this.seasonal[seasonIndex];

      // Compute confidence interval (simple approximation)
      const historicalStd = this._computeStd(this.history);
      const margin = 1.96 * historicalStd; // 95% CI

      forecasts.push({
        step: h,
        forecast: Math.max(0, forecast),
        lower: Math.max(0, forecast - margin),
        upper: forecast + margin
      });
    }

    return forecasts;
  }

  /**
   * Check if current reading underperforms forecast
   * @param {number} actual - Actual generation (kWh)
   * @param {number} step - Which forecast step (1 = next hour)
   * @returns {object} - { underperforming, delta, severity }
   */
  checkUnderperformance(actual, step = 1) {
    if (!this.trained) {
      throw new Error('Model not trained.');
    }

    const forecasts = this.predict(step);
    const forecast = forecasts[step - 1];

    const delta = actual - forecast.forecast;
    const deltaPercent = (delta / forecast.forecast) * 100;

    let severity = 'NORMAL';
    if (actual < forecast.lower) {
      severity = 'HIGH';  // Below 95% CI
    } else if (deltaPercent < -10) {
      severity = 'MEDIUM'; // 10% below forecast
    } else if (deltaPercent < -5) {
      severity = 'LOW';   // 5% below forecast
    }

    return {
      underperforming: severity !== 'NORMAL',
      severity,
      actual,
      forecast: forecast.forecast,
      delta,
      deltaPercent: parseFloat(deltaPercent.toFixed(2)),
      message: severity !== 'NORMAL'
        ? `⚠️ Generation ${Math.abs(deltaPercent).toFixed(1)}% below forecast. Check for maintenance needs.`
        : '✅ Generation within expected range'
    };
  }

  /**
   * Compute standard deviation
   */
  _computeStd(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  /**
   * Export model state
   */
  toJSON() {
    return {
      alpha: this.alpha,
      beta: this.beta,
      gamma: this.gamma,
      seasonLength: this.seasonLength,
      level: this.level,
      trend: this.trend,
      seasonal: this.seasonal,
      trained: this.trained
    };
  }

  /**
   * Load model state
   */
  static fromJSON(json) {
    const model = new Forecaster({
      alpha: json.alpha,
      beta: json.beta,
      gamma: json.gamma,
      seasonLength: json.seasonLength
    });
    model.level = json.level;
    model.trend = json.trend;
    model.seasonal = json.seasonal;
    model.trained = json.trained;
    return model;
  }
}

module.exports = { Forecaster };
