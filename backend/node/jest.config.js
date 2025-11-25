module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  // Coverage thresholds - valores actuales para evitar regresión
  // TODO: Incrementar gradualmente hacia 70% en todas las métricas
  coverageThreshold: {
    global: {
      branches: 29,    // Actual: 29.85%
      functions: 45,   // Actual: 45.26%
      lines: 50,       // Actual: 50.74%
      statements: 49   // Actual: 49.9%
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  verbose: true,
  testTimeout: 10000
};
