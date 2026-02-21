'use strict';

/**
 * Integration Tests for All New Features
 * Version: 1.4.0
 * Tests: Forecasting, Clustering, Active Learning, Multi-Plant, Renewable Validation
 */

const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const { Forecaster } = require('../../src/ml/Forecaster');
const { MLAnomalyDetector } = require('../../src/ml/MLAnomalyDetector');
const { FeedbackStore } = require('../../src/storage/FeedbackStore');
const { RenewableAdapter } = require('../../src/renewable/RenewableAdapter');

describe('🔮 Forecasting Integration', () => {
  let forecaster;

  before(() => {
    forecaster = new Forecaster({ seasonLength: 24 });
  });

  it('should train with sufficient data', () => {
    const readings = [];
    for (let i = 0; i < 72; i++) {
      readings.push(1000 + Math.sin(i / 24 * 2 * Math.PI) * 200);
    }
    
    forecaster.train(readings);
    expect(forecaster.trained).to.be.true;
  });

  it('should generate predictions', () => {
    const predictions = forecaster.predict(24);
    expect(predictions).to.be.an('array');
    expect(predictions).to.have.lengthOf(24);
    predictions.forEach(p => {
      expect(p).to.have.property('value');
      expect(p).to.have.property('upper');
      expect(p).to.have.property('lower');
    });
  });

  it('should detect underperformance', () => {
    const result = forecaster.checkUnderperformance(600, 0);
    expect(result).to.have.property('isUnderperforming');
    expect(result).to.have.property('severity');
  });

  it('should serialize and deserialize', () => {
    const json = forecaster.toJSON();
    const restored = Forecaster.fromJSON(json);
    expect(restored.trained).to.equal(forecaster.trained);
  });
});

describe('🧩 Clustering Integration', () => {
  let detector;

  before(() => {
    detector = new MLAnomalyDetector({ autoTrain: true });
  });

  it('should track anomalies', () => {
    const anomalousReading = {
      flowRate_m3_per_s: 2.5,
      headHeight_m: 45,
      generatedKwh: 8500, // 10x inflated
      pH: 7.0,
      turbidity_ntu: 10,
      temperature_celsius: 18
    };

    const result = detector.detect(anomalousReading);
    expect(result.isAnomaly).to.be.true;

    const stats = detector.getAnomalyStats();
    expect(stats.count).to.be.at.least(1);
  });

  it('should cluster anomalies when sufficient data', () => {
    // Generate 10 anomalies
    for (let i = 0; i < 10; i++) {
      detector.detect({
        flowRate_m3_per_s: 2.5,
        headHeight_m: 45,
        generatedKwh: 5000 + i * 100,
        pH: 7.0,
        turbidity_ntu: 10,
        temperature_celsius: 18
      });
    }

    const clusters = detector.clusterAnomalies(50);
    expect(clusters).to.have.property('clusters');
    expect(clusters.clusters).to.be.an('array');
  });
});

describe('🎓 Active Learning Integration', () => {
  let feedbackStore;

  before(async () => {
    feedbackStore = new FeedbackStore('./test-data/feedback-test.json');
    await feedbackStore.load();
    await feedbackStore.clear(); // Start fresh
  });

  it('should add feedback entries', async () => {
    const entry = await feedbackStore.addFeedback({
      readingId: 'test-001',
      originalLabel: 'anomaly',
      correctLabel: 'normal',
      confidence: 0.65
    });

    expect(entry).to.have.property('id');
    expect(entry).to.have.property('timestamp');
  });

  it('should calculate confusion matrix', async () => {
    // Add more samples
    await feedbackStore.addFeedback({
      readingId: 'test-002',
      originalLabel: 'anomaly',
      correctLabel: 'anomaly',
      confidence: 0.95
    });

    await feedbackStore.addFeedback({
      readingId: 'test-003',
      originalLabel: 'normal',
      correctLabel: 'anomaly',
      confidence: 0.45
    });

    const stats = feedbackStore.getStats();
    expect(stats).to.have.property('precision');
    expect(stats).to.have.property('recall');
    expect(stats).to.have.property('accuracy');
    expect(stats).to.have.property('f1Score');
  });

  it('should provide actionable insights', async () => {
    const insights = feedbackStore.getInsights();
    expect(insights).to.have.property('summary');
    expect(insights).to.have.property('recommendations');
    expect(insights).to.have.property('needsRetraining');
  });

  it('should export training data', async () => {
    const trainingData = feedbackStore.exportForTraining();
    expect(trainingData).to.be.an('array');
    trainingData.forEach(sample => {
      expect(sample).to.have.property('label');
      expect(sample).to.have.property('weight');
    });
  });
});

describe('🌞 Solar Validation', () => {
  let adapter;

  before(() => {
    adapter = new RenewableAdapter('solar');
  });

  it('should validate normal solar readings', () => {
    const reading = {
      irradiance: 800,
      panelArea: 100,
      generatedKwh: 14.4, // 18% efficiency
      panelTemperature_c: 45,
      timestamp: new Date('2026-02-21T12:00:00Z').toISOString()
    };

    const result = adapter.validateSolar(reading);
    expect(result.valid).to.be.true;
    expect(result.errors).to.be.empty;
  });

  it('should detect impossibly high efficiency', () => {
    const reading = {
      irradiance: 800,
      panelArea: 100,
      generatedKwh: 25, // >30% efficiency - impossible
      panelTemperature_c: 25,
      timestamp: new Date('2026-02-21T12:00:00Z').toISOString()
    };

    const result = adapter.validateSolar(reading);
    expect(result.valid).to.be.false;
    expect(result.errors).to.have.lengthOf.at.least(1);
  });

  it('should flag nighttime generation', () => {
    const reading = {
      irradiance: 500,
      panelArea: 100,
      generatedKwh: 10,
      panelTemperature_c: 25,
      timestamp: new Date('2026-02-21T02:00:00Z').toISOString() // 2 AM
    };

    const result = adapter.validateSolar(reading);
    expect(result.valid).to.be.false;
  });
});

describe('🌬️ Wind Validation', () => {
  let adapter;

  before(() => {
    adapter = new RenewableAdapter('wind');
  });

  it('should validate normal wind readings', () => {
    const reading = {
      windSpeed: 12,
      generatedKwh: 1500,
      rotorDiameter: 90,
      bladeRPM: 15,
      hubHeight_m: 80
    };

    const result = adapter.validateWind(reading);
    expect(result.valid).to.be.true;
    expect(result.errors).to.be.empty;
  });

  it('should detect Betz limit violation', () => {
    const reading = {
      windSpeed: 10,
      generatedKwh: 10000, // Way too high
      rotorDiameter: 90,
      bladeRPM: 15,
      hubHeight_m: 80
    };

    const result = adapter.validateWind(reading);
    expect(result.valid).to.be.false;
    expect(result.errors.some(e => e.includes('Betz'))).to.be.true;
  });

  it('should flag generation below cut-in speed', () => {
    const reading = {
      windSpeed: 2, // Below 3 m/s cut-in
      generatedKwh: 500,
      rotorDiameter: 90,
      bladeRPM: 2,
      hubHeight_m: 80
    };

    const result = adapter.validateWind(reading);
    expect(result.valid).to.be.false;
  });
});

describe('🌳 Biomass Validation', () => {
  let adapter;

  before(() => {
    adapter = new RenewableAdapter('biomass');
  });

  it('should validate normal biomass readings', () => {
    const reading = {
      fuelFlowRate_kg_per_s: 0.5,
      generatedKwh: 1750, // ~70% efficiency
      combustionTemp_c: 900,
      fuelMoisture_percent: 12,
      ashContent_percent: 2,
      co2Emissions_g_per_kwh: 850,
      noxEmissions_ppm: 100
    };

    const result = adapter.validateBiomass(reading);
    expect(result.valid).to.be.true;
    expect(result.errors).to.be.empty;
  });

  it('should detect impossible efficiency', () => {
    const reading = {
      fuelFlowRate_kg_per_s: 0.5,
      generatedKwh: 5000, // >100% efficiency
      combustionTemp_c: 900,
      fuelMoisture_percent: 10,
      ashContent_percent: 2
    };

    const result = adapter.validateBiomass(reading);
    expect(result.valid).to.be.false;
  });

  it('should warn about high moisture content', () => {
    const reading = {
      fuelFlowRate_kg_per_s: 0.5,
      generatedKwh: 1500,
      combustionTemp_c: 850,
      fuelMoisture_percent: 35, // High moisture
      ashContent_percent: 2
    };

    const result = adapter.validateBiomass(reading);
    expect(result.warnings).to.have.lengthOf.at.least(1);
  });
});

describe('🏆 End-to-End Integration', () => {
  it('should handle complete workflow', async () => {
    // 1. Train forecaster
    const forecaster = new Forecaster({ seasonLength: 24 });
    const readings = Array(72).fill(0).map((_, i) => 1000 + Math.sin(i / 12 * Math.PI) * 200);
    forecaster.train(readings);

    // 2. Detect anomalies and cluster
    const detector = new MLAnomalyDetector({ autoTrain: true });
    for (let i = 0; i < 5; i++) {
      detector.detect({
        flowRate_m3_per_s: 2.5,
        headHeight_m: 45,
        generatedKwh: 5000,
        pH: 7.0,
        turbidity_ntu: 10,
        temperature_celsius: 18
      });
    }

    // 3. Collect feedback
    const feedbackStore = new FeedbackStore('./test-data/e2e-feedback.json');
    await feedbackStore.load();
    await feedbackStore.addFeedback({
      readingId: 'e2e-001',
      originalLabel: 'anomaly',
      correctLabel: 'normal'
    });

    // 4. Validate renewable sources
    const solarAdapter = new RenewableAdapter('solar');
    const solarResult = solarAdapter.validateSolar({
      irradiance: 900,
      panelArea: 100,
      generatedKwh: 16.2,
      panelTemperature_c: 35,
      timestamp: new Date('2026-02-21T14:00:00Z').toISOString()
    });

    // Verify all components worked
    expect(forecaster.trained).to.be.true;
    expect(detector.getAnomalyStats().count).to.be.at.least(5);
    expect(feedbackStore.getStats().total).to.be.at.least(1);
    expect(solarResult.valid).to.be.true;
  });
});

console.log('✅ All integration tests defined. Run with: npm test');
