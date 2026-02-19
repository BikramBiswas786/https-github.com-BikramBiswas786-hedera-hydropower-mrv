'use strict';

/**
 * Jest configuration — hedera-hydropower-mrv
 * Runs all *.test.js and *.integration.test.js files under tests/
 */

module.exports = {
  testEnvironment: 'node',

  // Match standard test files across all subdirs
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.integration.test.js'
  ],

  // Ignore non-test files
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/tests/fixtures/'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.min.js'
  ],

  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70
    }
  },

  coverageReporters: ['text', 'lcov', 'html'],

  // Timeout: 30s default, individual tests can override
  testTimeout: 30000,

  // Verbose output so CI logs are readable
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true
};
