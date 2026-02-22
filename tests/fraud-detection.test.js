// tests/fraud-detection.test.js
// Fraud Detection System Tests

const Workflow = require('../src/workflow');

describe('Fraud Detection', () => {
  let workflow;

  beforeEach(async () => {
    workflow = new Workflow({
      projectId: 'FRAUD-TEST-001',
      location: 'Test Site',
      capacity_mw: 50,
      projectType: 'hydropower',
      enableHedera: false,
      autoApproveThreshold: 0.90,
      manualReviewThreshold: 0.50,
      deviceProfile: {
        capacity: 10000,
        maxFlow: 20,
        maxHead: 500,
        minEfficiency: 0.70
      }
    });
    
    await workflow.initialize('FRAUD-TEST-001', 'TEST-DEVICE-001', 0.82);
  });

  afterEach(async () => {
    await workflow.cleanup();
  });

  describe('Anti-Gaming Tests', () => {
    describe('Attack Vector 1: Data Replay Attacks', () => {
      it('should reject duplicate telemetry with same timestamp', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 2000,
          pH: 7.0,
        };

        // First submission should succeed
        const result1 = await workflow.submitReading(telemetry);
        expect(['APPROVED', 'FLAGGED']).toContain(result1.verificationStatus);

        // Replay attack - same timestamp should be REJECTED
        const result2 = await workflow.submitReading(telemetry);
        expect(result2.verificationStatus).toBe('REJECTED');
        expect(result2.fraudDetected).toBe(true);
        expect(result2.fraudReasons).toContain('REPLAY_ATTACK_DUPLICATE_TIMESTAMP');
      });

      it('should allow same timestamp for different devices', async () => {
        const timestamp = new Date().toISOString();
        
        const telemetry1 = {
          timestamp,
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 2000,
          pH: 7.0,
        };

        const workflow2 = new Workflow({
          projectId: 'FRAUD-TEST-002',
          enableHedera: false,
          deviceProfile: {
            capacity: 10000,
            maxFlow: 20,
            maxHead: 500,
            minEfficiency: 0.70
          }
        });
        await workflow2.initialize('FRAUD-TEST-002', 'TEST-DEVICE-002', 0.82);

        const result1 = await workflow.submitReading(telemetry1);
        const result2 = await workflow2.submitReading(telemetry1);

        expect(['APPROVED', 'FLAGGED']).toContain(result1.verificationStatus);
        expect(['APPROVED', 'FLAGGED']).toContain(result2.verificationStatus);
        
        await workflow2.cleanup();
      });
    });

    describe('Attack Vector 2: Physics-Breaking Values', () => {
      it('should reject impossible energy generation (exceeds theoretical max)', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 50000,  // ❌ Impossibly high
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        expect(result.verificationStatus).toBe('REJECTED');
        expect(result.fraudDetected).toBe(true);
        expect(result.fraudReasons[0]).toContain('PHYSICS_VIOLATION');
      });

      it('should reject negative flow rates', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: -5.0,  // ❌ Negative
          headHeight_m: 50,
          generatedKwh: 2000,
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        expect(result.verificationStatus).toBe('REJECTED');
        expect(result.fraudDetected).toBe(true);
        expect(result.fraudReasons).toContain('NEGATIVE_VALUES_DETECTED');
      });

      it('should reject negative head height', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: 5.0,
          headHeight_m: -50,  // ❌ Negative
          generatedKwh: 2000,
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        expect(result.verificationStatus).toBe('REJECTED');
        expect(result.fraudDetected).toBe(true);
        expect(result.fraudReasons).toContain('NEGATIVE_VALUES_DETECTED');
      });

      it('should reject negative generation', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: -1000,  // ❌ Negative
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        expect(result.verificationStatus).toBe('REJECTED');
        expect(result.fraudDetected).toBe(true);
        expect(result.fraudReasons).toContain('NEGATIVE_VALUES_DETECTED');
      });
    });

    describe('Attack Vector 3: Timestamp Manipulation', () => {
      it('should detect backdated telemetry (>1 hour old)', async () => {
        const oldTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
        
        const telemetry = {
          timestamp: oldTimestamp,
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 2000,
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        expect(result.verificationStatus).toBe('REJECTED');
        expect(result.fraudDetected).toBe(true);
        expect(result.fraudReasons[0]).toContain('BACKDATED_TELEMETRY');
      });

      it('should detect future-dated telemetry (>5 minutes ahead)', async () => {
        const futureTimestamp = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes ahead
        
        const telemetry = {
          timestamp: futureTimestamp,
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 2000,
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        expect(result.verificationStatus).toBe('REJECTED');
        expect(result.fraudDetected).toBe(true);
        expect(result.fraudReasons[0]).toContain('FUTURE_DATED_TELEMETRY');
      });

      it('should accept recent timestamps within tolerance', async () => {
        const recentTimestamp = new Date(Date.now() - 30 * 1000).toISOString(); // 30 seconds ago
        
        const telemetry = {
          timestamp: recentTimestamp,
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 2000,
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        expect(['APPROVED', 'FLAGGED']).toContain(result.verificationStatus);
        expect(result.fraudDetected).toBe(false);
      });
    });

    describe('Attack Vector 4: Device Capacity Violations', () => {
      it('should flag generation exceeding device capacity', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 12000,  // ❌ Exceeds 10 MWh capacity
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        // Should be rejected due to physics violation (exceeds capacity by 50%+)
        expect(['FLAGGED', 'REJECTED']).toContain(result.verificationStatus);
        
        // Only check verificationResults if fraud wasn't detected (early rejection)
        if (result.verificationResults && result.verificationResults.consistency) {
          expect(result.verificationResults.consistency.details.capacity.status).toBe('EXCEEDS');
        }
      });

      it('should accept generation within capacity', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 2000,  // ✅ Within capacity
          pH: 7.0,
        };

        const result = await workflow.submitReading(telemetry);

        expect(['APPROVED', 'FLAGGED']).toContain(result.verificationStatus);
      });
    });

    describe('Legitimate Data Acceptance', () => {
      it('should approve realistic hydropower data', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: 5.0,
          headHeight_m: 50,
          generatedKwh: 2000,
          pH: 7.0,
          turbidity_ntu: 10,
          temperature_celsius: 18,
        };

        const result = await workflow.submitReading(telemetry);

        expect(['APPROVED', 'FLAGGED']).toContain(result.verificationStatus);
        expect(result.fraudDetected).toBe(false);
        expect(result.carbonCredits).toBeDefined();
      });

      it('should handle edge cases within acceptable ranges', async () => {
        const telemetry = {
          timestamp: new Date().toISOString(),
          flowRate_m3_per_s: 19.5,  // Near max flow
          headHeight_m: 480,         // Near max head
          generatedKwh: 8000,        // High but within capacity
          pH: 6.5,                   // Lower bound
          turbidity_ntu: 45,         // Higher turbidity
          temperature_celsius: 28,   // Warmer water
        };

        const result = await workflow.submitReading(telemetry);

        expect(['APPROVED', 'FLAGGED']).toContain(result.verificationStatus);
      });
    });
  });
});

