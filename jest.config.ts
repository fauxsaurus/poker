export default {
	coverageThreshold: {
		global: {
			statements: 85,
			branches: 85,
			functions: 85,
			lines: 85,
		},
	},
	preset: 'ts-jest',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	testEnvironment: 'jsdom',
}
