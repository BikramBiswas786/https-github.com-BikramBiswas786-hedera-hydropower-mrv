const assert = require('assert');
const FraudDetector = require('../../ml/src/fraud_detector');
describe('ML Fraud Detector Unit Tests', function() {
  let detector;
  before(async function() {
    this.timeout(10000);
    detector = new FraudDetector();
    await detector.initialize();
  });
  it('should initialize successfully', function() {
    assert.ok(detector);
    console.log('Model loaded:', detector.isModelLoaded());
  });
  it('should detect normal reading', async function() {
    const result = await detector.predict({
      waterFlow: 125, powerOutput: 95, efficiency: 0.88
    });
    console.log('Normal:', result.isFraud, 'Score:', result.score.toFixed(3));
    assert.strictEqual(result.isFraud, false);
  });
  it('should detect fraud reading', async function() {
    const result = await detector.predict({
      waterFlow: 250, powerOutput: 45, efficiency: 0.25
    });
    console.log('Fraud:', result.isFraud, 'Score:', result.score.toFixed(3));
    assert.strictEqual(result.isFraud, true);
  });
});
