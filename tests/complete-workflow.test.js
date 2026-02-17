/**
 * Complete Workflow Tests — Jest (rewritten from tape, fixed projectId/deviceId)
 */
'use strict';
const Workflow = require('../src/workflow');

describe('Workflow Initialization', () => {
  test('initialize sets projectId, deviceId, gridEmissionFactor', async () => {
    const wf = new Workflow();
    const result = await wf.initialize('HYDRO-PROJECT-001', 'TURBINE-001', 0.8);
    expect(result.success).toBe(true);
    expect(result.projectId).toBe('HYDRO-PROJECT-001');
    expect(result.deviceId).toBe('TURBINE-001');
    expect(result.gridEmissionFactor).toBe(0.8);
    expect(wf.projectId).toBe('HYDRO-PROJECT-001');
    expect(wf.deviceId).toBe('TURBINE-001');
    expect(wf.gridEmissionFactor).toBe(0.8);
  });

  test('initialize without projectId throws', async () => {
    const wf = new Workflow();
    await expect(wf.initialize(null, 'TURBINE-001', 0.8)).rejects.toThrow('projectId is required');
  });

  test('initialize without deviceId throws', async () => {
    const wf = new Workflow();
    await expect(wf.initialize('PROJ-001', null, 0.8)).rejects.toThrow('deviceId is required');
  });
});

describe('Complete Workflow - Happy Path', () => {
  let wf;
  beforeEach(async () => {
    wf = new Workflow();
    await wf.initialize('HYDRO-PROJECT-001', 'TURBINE-001', 0.8);
  });

  test('submitReading returns success with transactionId', async () => {
    const telemetry = {
      deviceId: 'TURBINE-001',
      timestamp: new Date().toISOString(),
      flowRate: 2.5, head: 45, generatedKwh: 900
    };
    const result = await wf.submitReading(telemetry);
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeTruthy();
    expect(result.timestamp).toBeTruthy();
  });

  test('submitReading without initialization throws', async () => {
    const wf2 = new Workflow();
    await expect(wf2.submitReading({ deviceId: 'T1' })).rejects.toThrow('not initialized');
  });
});

describe('Complete Workflow - Invalid Telemetry', () => {
  let wf;
  beforeEach(async () => {
    wf = new Workflow();
    await wf.initialize('HYDRO-PROJECT-001', 'TURBINE-001', 0.8);
  });

  test('submitReading still resolves even with bad physics data', async () => {
    const result = await wf.submitReading({ deviceId: 'T1', flowRate: 999, head: -10, generatedKwh: 1e8 });
    expect(result.success).toBe(true);
  });
});

describe('Batch Processing', () => {
  let wf;
  beforeEach(async () => {
    wf = new Workflow();
    await wf.initialize('HYDRO-PROJECT-001', 'TURBINE-001', 0.8);
  });

  test('Multiple readings all submit successfully', async () => {
    const readings = Array.from({ length: 3 }, (_, i) => ({
      deviceId: 'TURBINE-001',
      timestamp: new Date().toISOString(),
      flowRate: 2.5, head: 45, generatedKwh: 900 + i * 10
    }));
    const results = await Promise.all(readings.map(r => wf.submitReading(r)));
    expect(results).toHaveLength(3);
    results.forEach(r => expect(r.success).toBe(true));
  });
});

describe('Aggregation', () => {
  let wf;
  beforeEach(async () => {
    wf = new Workflow();
    await wf.initialize('HYDRO-PROJECT-001', 'TURBINE-001', 0.8);
  });

  test('generateMonitoringReport returns report with correct projectId', async () => {
    const report = await wf.generateMonitoringReport({ totalReadings: 10, approvedReadings: 9 });
    expect(report.success).toBe(true);
    expect(report.projectId).toBe('HYDRO-PROJECT-001');
    expect(report.totalReadings).toBe(10);
  });

  test('generateMonitoringReport without initialization throws', async () => {
    const wf2 = new Workflow();
    await expect(wf2.generateMonitoringReport()).rejects.toThrow('not initialized');
  });
});

describe('Hedera Integration', () => {
  test('deployDeviceDID returns valid DID', async () => {
    const wf = new Workflow();
    const result = await wf.deployDeviceDID('TURBINE-001');
    expect(result.success).toBe(true);
    expect(result.did).toMatch(/^did:hedera:/);
    expect(result.topicId).toMatch(/^0\.0\./);
  });

  test('deployDeviceDID without deviceId throws', async () => {
    const wf = new Workflow();
    await expect(wf.deployDeviceDID(null)).rejects.toThrow('deviceId is required for DID deployment');
  });

  test('createRECToken returns tokenId', async () => {
    const wf = new Workflow();
    const result = await wf.createRECToken('Hydro REC Token', 'HREC');
    expect(result.success).toBe(true);
    expect(result.tokenId).toMatch(/^0\.0\./);
    expect(result.name).toBe('Hydro REC Token');
  });

  test('createRECToken without name throws', async () => {
    const wf = new Workflow();
    await expect(wf.createRECToken(null, 'HREC')).rejects.toThrow('tokenName is required');
  });

  test('createRECToken without symbol throws', async () => {
    const wf = new Workflow();
    await expect(wf.createRECToken('Token', null)).rejects.toThrow('tokenSymbol is required');
  });
});

describe('Error Recovery', () => {
  test('retrySubmission succeeds after initialization', async () => {
    const wf = new Workflow({ retryAttempts: 3, retryDelay: 0 });
    await wf.initialize('PROJ-001', 'T1', 0.8);
    const result = await wf.retrySubmission({ deviceId: 'T1', flowRate: 2.5 });
    expect(result.success).toBe(true);
    expect(result.attempt).toBeDefined();
  });

  test('retrySubmission fails if not initialized', async () => {
    const wf = new Workflow({ retryAttempts: 2, retryDelay: 0 });
    await expect(wf.retrySubmission({ deviceId: 'T1' })).rejects.toThrow('not initialized');
  });
});

describe('Reset', () => {
  test('reset clears state', async () => {
    const wf = new Workflow();
    await wf.initialize('PROJ-001', 'T1', 0.8);
    wf.reset();
    expect(wf.initialized).toBe(false);
    expect(wf.projectId).toBeNull();
    expect(wf.deviceId).toBeNull();
  });
});

describe('Performance', () => {
  test('1000 readings submit in < 5s', async () => {
    const wf = new Workflow();
    await wf.initialize('PROJ-001', 'T1', 0.8);
    const readings = Array.from({ length: 1000 }, (_, i) => ({
      deviceId: 'T1',
      flowRate: 2.5, head: 45, generatedKwh: 900 + i
    }));
    const start = Date.now();
    await Promise.all(readings.map(r => wf.submitReading(r)));
    expect(Date.now() - start).toBeLessThan(5000);
  });
});
