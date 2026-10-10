const shared = {
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

module.exports = {
    projects: [
        {
            ...shared,
            displayName: 'app',
            preset: 'jest-expo',
            testPathIgnorePatterns: [ '/node_modules/', '\\.live\\.test\\.tsx?$' ],
        },
        {
            ...shared,
            displayName: 'live',
            testEnvironment: 'node',
            testMatch: [ '<rootDir>/src/**/*.live.test.ts' ],
            transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
            transformIgnorePatterns: [ 'node_modules/(?!.*(?:expo|@expo)/)' ],
        },
    ],
    collectCoverageFrom: [ 'src/**/*.{ts,tsx}', '!src/elements/flag/flags.ts' ],
};
