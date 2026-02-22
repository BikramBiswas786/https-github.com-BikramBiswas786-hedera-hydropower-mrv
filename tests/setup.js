// Jest setup file for CI environment

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.CI = process.env.CI || 'true';

// Mock console methods to reduce noise
if (process.env.CI) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error, // Keep error for debugging
  };
}

// Set default test timeout
jest.setTimeout(30000);

// Mock Hedera credentials if not present
if (!process.env.HEDERA_OPERATOR_ID) {
  process.env.HEDERA_OPERATOR_ID = '0.0.TEST';
}
if (!process.env.HEDERA_OPERATOR_KEY) {
  process.env.HEDERA_OPERATOR_KEY = '302e020100300506032b657004220420' + '0'.repeat(64);
}
if (!process.env.HEDERA_NETWORK) {
  process.env.HEDERA_NETWORK = 'testnet';
}
