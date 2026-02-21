'use strict';

/**
 * Synthetic Training Data Generator
 * ──────────────────────────────────
 * Generates realistic labelled hydropower telemetry readings for
 * training / validating the Isolation Forest anomaly detector.
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
 * Generate a single synthetic reading.
 * @returns {{ reading: object, label: string, theoreticalKwh: number }}
 */
function generateReading() {
  const flow       = parseFloat(rand(0.5,  15.0).toFixed(3));   // m³/s
  const head       = parseFloat(rand(10,   90.0).toFixed(1));   // m
  const efficiency = parseFloat(rand(0.75,  0.92).toFixed(4));
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
      turbidity_ntu:       parseFloat(rand(1,   60).toFixed(1)),
      temperature_celsius: parseFloat(rand(5,   32).toFixed(1))
    },
    label,
    theoreticalKwh: parseFloat(theoretical.toFixed(2))
  };
}

/**
 * Generate N labelled samples.
 * @param {number} n
 * @returns {Array<{ reading, label, theoreticalKwh }>}
 */
function generateDataset(n = 2000) {
  const dataset = [];
  for (let i = 0; i < n; i++) {
    dataset.push(generateReading());
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

module.exports = { generateReading, generateDataset, splitDataset };
