export default {
  testEnvironment: 'jsdom',
  testTimeout: 60000,
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)', '**/tests/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^swiper/css.*$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
    'utils/misc/config$': '<rootDir>/src/utils/misc/config.jest.ts',
  },
  // Unit-coverage scope: reusable library, hooks, helpers, utils, layouts, router
  // and auth logic. The data-fetching layer (api/**) and page flows (pages/**) are
  // validated by the Cypress component + e2e suite that runs in the develop pipeline.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/index.css',
    '!src/setupTests.ts',
    '!src/utils/misc/config.ts',
    '!src/utils/misc/config.jest.ts',
    '!src/api/**',
    '!src/pages/**',
    '!src/**/interfaces/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
