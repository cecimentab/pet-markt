/* eslint-disable */
const { readFileSync } = require('fs');

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8'),
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@pet-markt/pet-markt-be',
  preset: '../../jest.preset.cjs',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^(\\.{1,2}/)+prisma/db$': '<rootDir>/src/prisma/__mocks__/db.ts',
    '^@prisma/orm-postgres/orm-client$':
      '<rootDir>/src/prisma/__mocks__/orm-client.ts',
  },
  coverageDirectory: 'test-output/jest/coverage',
};
