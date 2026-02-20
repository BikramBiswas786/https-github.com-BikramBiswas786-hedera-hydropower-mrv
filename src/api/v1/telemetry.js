/**
 * Telemetry API v1 - REST endpoint for sensor data submission
 * Enterprise-grade endpoint with validation and Hedera integration
 */

const express = require('express');
const Workflow = require('../../workflow');
const { authenticateAPI } = require('../../middleware/auth');
const router = express.Router();

/**
 * POST /v1/telemetry - Submit sensor reading for verification
 * 
 * Request body:
 * {
 *   "plant_id": "PLANT-HP-001",
 *   "device_id": "TURBINE-001",
 *   "timestamp": "2026-02-20T10:30:00Z",
 *   "readings": {
 *     "flow_rate_m3s": 2.5,
 *     "head_height_m": 45.0,
 *     "power_output_kw": 900,
 *     "water_quality": {
 *       "ph": 7.2,
 *       "turbidity_ntu": 10,
 *       "temperature_c": 18
 *     }
 *   }
 * }
 * 
 * Response (200 OK):
 * {
 *   "verification_id": "VER-20260220-001",
 *   "status": "APPROVED",
 *   "trust_score": 0.9850,
 *   "hedera_tx_id": "0.0.6255927@1708387201.123456789",
 *   "hashscan_url": "https://hashscan.io/testnet/transaction/...",
 *   "carbon_credits_eligible_tco2e": 0.738,
 *   "timestamp": "2026-02-20T10:30:00Z"
 * }
 */
router.post('/telemetry', authenticateAPI, async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['plant_id', 'device_id', 'readings'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `Missing required field: ${field}`,
          code: 'MISSING_FIELD',
          field
        });
      }
    }

    const { plant_id, device_id, timestamp, readings } = req.body;

    // Validate readings structure
    if (!readings || typeof readings !== 'object') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'readings must be an object',
        code: 'INVALID_READINGS'
      });
    }

    // Validate numeric values
    const numericFields = {
      'flow_rate_m3s': readings.flow_rate_m3s,
      'head_height_m': readings.head_height_m,
      'power_output_kw': readings.power_output_kw
    };

    for (const [field, value] of Object.entries(numericFields)) {
      if (value !== undefined && (typeof value !== 'number' || value < 0)) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `${field} must be a positive number`,
          code: 'INVALID_VALUE',
          field
        });
      }
    }

    // Validate water quality if provided
    if (readings.water_quality) {
      const wq = readings.water_quality;
      if (wq.ph !== undefined && (wq.ph < 0 || wq.ph > 14)) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'pH must be between 0 and 14',
          code: 'INVALID_PH'
        });
      }
      if (wq.turbidity_ntu !== undefined && wq.turbidity_ntu < 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'turbidity_ntu must be non-negative',
          code: 'INVALID_TURBIDITY'
        });
      }
    }

    // Initialize workflow
    const workflow = new Workflow();
    await workflow.initialize(
      plant_id,
      device_id,
      parseFloat(process.env.EF_GRID || '0.82')
    );

    // Convert API format to internal format
    const telemetry = {
      flowRate: readings.flow_rate_m3s || 0,
      head: readings.head_height_m || 0,
      generatedKwh: readings.power_output_kw ? readings.power_output_kw * (5 / 60) : 0, // Convert kW to kWh (5-min interval)
      pH: readings.water_quality?.ph || 7.0,
      turbidity: readings.water_quality?.turbidity_ntu || 10,
      temperature: readings.water_quality?.temperature_c || 20,
      efficiency: readings.efficiency || 0.85,
      timestamp: timestamp || new Date().toISOString()
    };

    // Submit reading with retry
    const result = await workflow.retrySubmission(telemetry);

    // Calculate carbon credits
    const carbonCredits = telemetry.generatedKwh * (process.env.EF_GRID || 0.82) / 1000; // MWh * EF

    // Build HashScan URL
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const hashscanUrl = result.transactionId
      ? `https://hashscan.io/${network}/transaction/${result.transactionId}`
      : null;

    // Return structured response
    res.status(200).json({
      verification_id: result.attestation?.attestationId || `VER-${Date.now()}`,
      status: result.verificationStatus,
      trust_score: result.trustScore,
      hedera_tx_id: result.transactionId,
      hashscan_url: hashscanUrl,
      carbon_credits_eligible_tco2e: carbonCredits,
      timestamp: telemetry.timestamp,
      attempt: result.attempt,
      checks: result.attestation?.checks,
      org_id: req.org_id // From auth middleware
    });

    // Cleanup
    await workflow.cleanup();

  } catch (error) {
    console.error('Telemetry submission error:', error);
    
    // Categorize errors
    if (error.message.includes('not initialized')) {
      return res.status(500).json({
        error: 'Workflow initialization failed',
        message: error.message,
        code: 'WORKFLOW_INIT_FAILED'
      });
    }

    if (error.message.includes('Hedera')) {
      return res.status(503).json({
        error: 'Hedera network error',
        message: 'Failed to submit to blockchain after retries',
        code: 'HEDERA_ERROR',
        details: error.message
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /v1/health - Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'hedera-hydropower-mrv-api'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;