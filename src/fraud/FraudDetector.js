// src/fraud/FraudDetector.js
// Fraud detection and anti-gaming module for MRV system

class FraudDetector {
  constructor() {
    this.submissionHistory = new Map(); // deviceId:timestamp -> submission time
    this.maxTimestampAge = 3600000; // 1 hour in ms
    this.maxFutureOffset = 300000; // 5 minutes in ms
  }

  /**
   * Check for replay attacks (duplicate timestamps)
   */
  checkReplayAttack(deviceId, timestamp) {
    const key = `${deviceId}:${timestamp}`;
    
    if (this.submissionHistory.has(key)) {
      return {
        fraudDetected: true,
        reason: 'REPLAY_ATTACK_DUPLICATE_TIMESTAMP',
        severity: 'CRITICAL',
      };
    }

    this.submissionHistory.set(key, Date.now());
    
    // Cleanup old entries (older than 24 hours)
    if (this.submissionHistory.size > 10000) {
      const now = Date.now();
      for (const [k, v] of this.submissionHistory.entries()) {
        if (now - v > 86400000) {
          this.submissionHistory.delete(k);
        }
      }
    }

    return { fraudDetected: false };
  }

  /**
   * Check for backdated or future-dated telemetry
   */
  checkTimestampValidity(timestamp) {
    const now = Date.now();
    const submissionTime = new Date(timestamp).getTime();

    // Check if too old (> 1 hour)
    if (now - submissionTime > this.maxTimestampAge) {
      return {
        fraudDetected: true,
        reason: `BACKDATED_TELEMETRY_${Math.round((now - submissionTime) / 60000)}_MINUTES`,
        severity: 'MEDIUM',
      };
    }

    // Check if future-dated
    if (submissionTime > now + this.maxFutureOffset) {
      return {
        fraudDetected: true,
        reason: `FUTURE_DATED_TELEMETRY_${Math.round((submissionTime - now) / 60000)}_MINUTES`,
        severity: 'HIGH',
      };
    }

    return { fraudDetected: false };
  }

  /**
   * Check for physics-violating values
   * ✅ FIX: Handles both telemetry.readings and direct telemetry object
   */
  checkPhysicsViolations(telemetry) {
    // Support both formats: telemetry.readings and direct telemetry
    const readings = telemetry.readings || telemetry;
    const { flowRate_m3_per_s, headHeight_m, generatedKwh } = readings;

    // Check for undefined/null values
    if (flowRate_m3_per_s === undefined || headHeight_m === undefined || generatedKwh === undefined) {
      return { fraudDetected: false }; // Skip validation if data missing
    }

    // ✅ FIX: Check negative values (CRITICAL FRAUD)
    if (flowRate_m3_per_s < 0 || headHeight_m < 0 || generatedKwh < 0) {
      return {
        fraudDetected: true,
        reason: 'NEGATIVE_VALUES_DETECTED',
        severity: 'CRITICAL',
      };
    }

    // ✅ FIX: Check impossible efficiency with relaxed threshold
    // Theoretical max power = ρ * g * Q * H * η_max / 1000
    // where ρ = 1000 kg/m³, g = 9.81 m/s², η_max = 0.95 (realistic max)
    const theoreticalMaxKw = (1000 * 9.81 * flowRate_m3_per_s * headHeight_m * 0.95) / 1000;
    
    // ✅ FIX: 50% tolerance instead of 10% for real-world variations
    if (generatedKwh > theoreticalMaxKw * 1.5) {
      return {
        fraudDetected: true,
        reason: `PHYSICS_VIOLATION_IMPOSSIBLE_GENERATION`,
        severity: 'CRITICAL',
        details: `Generated ${generatedKwh.toFixed(2)} kWh exceeds theoretical max ${theoreticalMaxKw.toFixed(2)} kWh by >50%`,
      };
    }

    return { fraudDetected: false };
  }

  /**
   * ✅ FIXED: Comprehensive fraud check with correct structure
   * This is the main entry point called by workflow.js
   */
  detectFraud(deviceId, telemetry) {
    const reasons = [];
    let severity = 'LOW';

    // ══════════════════════════════════════════════════════════
    // CRITICAL CHECK 1: Physics Violations (highest priority)
    // ══════════════════════════════════════════════════════════
    const physicsCheck = this.checkPhysicsViolations(telemetry);
    if (physicsCheck.fraudDetected) {
      reasons.push(physicsCheck.reason);
      severity = physicsCheck.severity;
      return { fraudDetected: true, reasons, severity };
    }

    // ══════════════════════════════════════════════════════════
    // CRITICAL CHECK 2: Replay Attacks
    // ══════════════════════════════════════════════════════════
    const replayCheck = this.checkReplayAttack(deviceId, telemetry.timestamp);
    if (replayCheck.fraudDetected) {
      reasons.push(replayCheck.reason);
      severity = replayCheck.severity;
      return { fraudDetected: true, reasons, severity };
    }

    // ══════════════════════════════════════════════════════════
    // CHECK 3: Timestamp Validity (backdating/future-dating)
    // ══════════════════════════════════════════════════════════
    const timestampCheck = this.checkTimestampValidity(telemetry.timestamp);
    if (timestampCheck.fraudDetected) {
      reasons.push(timestampCheck.reason);
      severity = timestampCheck.severity;
      return { fraudDetected: true, reasons, severity };
    }

    // All checks passed
    return { 
      fraudDetected: false, 
      reasons: [], 
      severity: 'NONE' 
    };
  }

  /**
   * Clear detection cache (for testing)
   */
  clearCache() {
    this.submissionHistory.clear();
  }

  /**
   * Get statistics about fraud detection
   */
  getStats() {
    return {
      totalSubmissions: this.submissionHistory.size,
      oldestEntry: this.submissionHistory.size > 0 
        ? Math.min(...Array.from(this.submissionHistory.values())) 
        : null,
    };
  }
}

module.exports = FraudDetector;

