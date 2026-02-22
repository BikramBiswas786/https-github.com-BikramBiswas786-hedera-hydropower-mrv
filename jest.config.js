module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).js'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // Only mock @hashgraph/sdk — do NOT mock MLAnomalyDetector
  // (the real IsolationForest auto-trains on startup with synthetic data)
  moduleNameMapper: {
    '@hashgraph/sdk': '<rootDir>/tests/__mocks__/@hashgraph/sdk.js'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/vercel-ui/',
    // Uses mocha + chai (not Jest) — incompatible runner
    'test/integration/',
    // Requires ml/scripts/predict.py (Python) — not available in CI
    'ml/tests/'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**'
  ]
};
