module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/code/'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/code/'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 30000
};
