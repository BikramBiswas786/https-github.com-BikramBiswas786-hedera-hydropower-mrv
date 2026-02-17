/**
 * Anomaly Detector Module
 * Validates physics constraints for hydropower readings
 */
module.exports = class AnomalyDetector {
  constructor(config) {
    this.config = config || {};
  }
  validatePhysicsConstraints(reading) {
    if (!reading) {
      return { isValid: false, reason: 'No reading provided' };
    }
    // Flow rate validation (0-1000 m³/s reasonable range)
    if (reading.flowRate > 1000) {
      return { 
        isValid: false, 
        reason: 'Physics constraint violation: Flow rate exceeds maximum (1000 m³/s)' 
      };
    }
    // Head validation (must be non-negative)
    if (reading.head < 0) {
      return { 
        isValid: false, 
        reason: 'Physics constraint violation: Negative head not physically possible' 
      };
    }
    // Efficiency validation (0-1.0 range, typically 0.70-0.95)
    if (reading.efficiency !== undefined && reading.efficiency !== null) {
      if (reading.efficiency > 1.0 || reading.efficiency < 0) {
        return { 
          isValid: false, 
          reason: 'Physics constraint violation: Efficiency must be between 0 and 1.0' 
        };
      }
    }
    return { isValid: true };
  }
  detectAnomalies(reading) {
    const anomalies = [];
    // Check for statistical anomalies
    if (reading.flowRate > 500) {
      anomalies.push({ type: 'high_flow', severity: 'warning' });
    }
    if (reading.efficiency && reading.efficiency < 0.70) {
      anomalies.push({ type: 'low_efficiency', severity: 'warning' });
    }
    return { 
      anomalies, 
      severity: anomalies.length > 0 ? 'warning' : 'none' 
    };
  }
};
