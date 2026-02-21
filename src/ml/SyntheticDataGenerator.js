'use strict';

/**
 * Synthetic Training Data Generator (Monsoon-Aware)
 * ───────────────────────────────────────────────────
 * Generates realistic labelled hydropower telemetry readings for
 * training / validating the Isolation Forest anomaly detector.
 *
 * **Seasonal Flow Patterns (India):**
 *   Jun-Sep (Monsoon):      2.5-3.5× base flow
 *   Oct-Nov (Post-monsoon): 1.5-2.0× base flow
 *   Dec-May (Dry season):   0.8-1.2× base flow
 *
 * Distribution:
 *   80%  NORMAL          — power within ±15% of theoretical
 *   10%  FRAUD_INFLATE   — carbon-credit fraud (2×-10× inflation)
 *    5%  FRAUD_UNDER     — underreport to reduce taxes (30-60%)
 *    5%  SENSOR_FAULT    — implausible / out-of-range values
 *
 * Physics basis: P_kW = (ρ × g × Q × H × η) / 1000
 *   ρ = 1000 kg/m³, g = 9.81 m/s²
 */

const RHO = 1000;
const G   = 9.81;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

/**
 * Get seasonal flow multiplier for Indian monsoon calendar.
 * @param {number} month - 1 (Jan) to 12 (Dec)
 * @returns {number} Flow multiplier
 */
function getSeasonalFlowMultiplier(month) {
  // Jun-Sep: Southwest Monsoon (80% annual rainfall)
  if (month >= 6 && month <= 9) {
    return rand(2.5, 3.5);
  }
  // Oct-Nov: Post-monsoon / Northeast monsoon
  if (month >= 10 && month <= 11) {
    return rand(1.5, 2.0);
  }
  // Dec-May: Dry season
  return rand(0.8, 1.2);
}

/**
 * Generate a single synthetic reading.
 * @param {number} [month] - Optional month (1-12). If omitted, random.
 * @returns {{ reading: object, label: string, theoreticalKwh: number, month: number }}
 */
function generateReading(month) {
  // Default to random month if not specified
  if (!month) {
    month = randInt(1, 12);
  }

  const seasonalMultiplier = getSeasonalFlowMultiplier(month);
  const baseFlow = parseFloat(rand(0.3, 8.0).toFixed(3));  // Base flow before seasonal adjustment
  const flow     = parseFloat((baseFlow * seasonalMultiplier).toFixed(3));  // Actual flow (m³/s)
  const head     = parseFloat(rand(10, 90.0).toFixed(1));   // m
  const efficiency = parseFloat(rand(0.75, 0.92).toFixed(4));
  const theoretical = (RHO * G * flow * head * efficiency) / 1000; // kWh

  const r = Math.random();
  let generatedKwh, label;

  if (r < 0.80) {
    // ─── NORMAL ──────────────────────────────────────────────────
    generatedKwh = theoretical * rand(0.85, 1.15);
    label = 'normal';
  } else if (r < 0.90) {
    // ─── FRAUD: carbon-credit inflation ──────────────────────────
    generatedKwh = theoretical * rand(2.0, 10.0);
    label = 'fraud_inflate';
  } else if (r < 0.95) {
    // ─── FRAUD: underreport to avoid taxes ───────────────────────
    generatedKwh = theoretical * rand(0.20, 0.55);
    label = 'fraud_underreport';
  } else {
    // ─── SENSOR FAULT: completely implausible ────────────────────
    generatedKwh = rand(0, 50000);
    label = 'sensor_fault';
  }

  return {
    reading: {
      flowRate_m3_per_s:  flow,
      headHeight_m:        head,
      generatedKwh:        parseFloat(generatedKwh.toFixed(2)),
      pH:                  parseFloat(rand(6.2, 8.8).toFixed(2)),
      turbidity_ntu:       parseFloat(rand(1, 60).toFixed(1)),
      temperature_celsius: parseFloat(rand(5, 32).toFixed(1))
    },
    label,
    theoreticalKwh: parseFloat(theoretical.toFixed(2)),
    month,
    seasonalMultiplier: parseFloat(seasonalMultiplier.toFixed(2))
  };
}

/**
 * Generate N labelled samples distributed across 12 months.
 * @param {number} n - Total samples
 * @returns {Array<{ reading, label, theoreticalKwh, month, seasonalMultiplier }>}
 */
function generateDataset(n = 2000) {
  const dataset = [];
  const samplesPerMonth = Math.floor(n / 12);
  const remainder = n % 12;

  // Generate samples for each month
  for (let month = 1; month <= 12; month++) {
    const monthSamples = samplesPerMonth + (month <= remainder ? 1 : 0);
    for (let i = 0; i < monthSamples; i++) {
      dataset.push(generateReading(month));
    }
  }

  return dataset;
}

/**
 * Split dataset into training (normal only) and validation (all labels).
 * Isolation Forest is unsupervised — trained only on normal data.
 */
function splitDataset(dataset) {
  const normal     = dataset.filter(d => d.label === 'normal');
  const anomalies  = dataset.filter(d => d.label !== 'normal');
  const trainSize  = Math.floor(normal.length * 0.80);
  return {
    train:    normal.slice(0, trainSize),
    valNormal:normal.slice(trainSize),
    valAnomalies: anomalies
  };
}

module.exports = { 
  generateReading, 
  generateDataset, 
  splitDataset,
  getSeasonalFlowMultiplier  // Exported for testing
};
