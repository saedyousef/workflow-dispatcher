module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^\./(dom|main|utils|workflow|types)\\.js$': '<rootDir>/src/$1.ts',
    '^../src/(dom|main|utils|workflow|types)\\.js$': '<rootDir>/src/$1.ts'
  }
};
