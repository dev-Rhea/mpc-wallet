/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'], // 테스트 파일 위치
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts'],
  verbose: true,
  forceExit: true, // 테스트 종료 후 강제 종료 (DB 연결 등)
  clearMocks: true,
};
