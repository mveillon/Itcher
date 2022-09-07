module.exports = {
    transform: {'^.+\\.ts?$': 'ts-jest'},
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    resolver: "jest-ts-webcompat-resolver",
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts",
        "!<rootDir>/node_modules/**",
        "!tests/**/*"
    ],
    roots: ['<rootDir>/src', '<rootDir>/tests']
};