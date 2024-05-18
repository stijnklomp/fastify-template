const { pathsToModuleNameMapper } = require("ts-jest")
const { compilerOptions } = require("./tsconfig")
const jestMockExtended = require("jest-mock-extended")

module.exports = {
	clearMocks: true,
	collectCoverageFrom: ["<rootDir>/src/**/*.{cjs,mjs,js,ts}"],
	coverageDirectory: "<rootDir>/test/unit/coverage",
	coveragePathIgnorePatterns: [
		"<rootDir>/node_modules/",
		"<rootDir>/.husky/",
		"<rootDir>/dist/",
		"<rootDir>/doc/",
	],
	coverageReporters: ["text", "json"],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
	moduleDirectories: ["<rootDir>/node_modules"],
	moduleFileExtensions: ["ts", "js", "json"],
	moduleNameMapper: {
		...pathsToModuleNameMapper({
			...compilerOptions.paths,
		}),
		"^@/fixtures/(.*)$": "<rootDir>/test/fixtures/$1",
		"^@/helper$": "<rootDir>/test/helper.ts",
	},
	modulePaths: [compilerOptions.baseUrl],
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "<rootDir>/test/unit/reports",
				outputName: "junit.xml",
			},
		],
	],
	rootDir: ".",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testEnvironment: "node",
	testMatch: ["**/?(*.)+(spec|test).[jt]s"],
	transform: {
		"^.+\\.(t|j)s$": [
			"ts-jest",
			{
				tsconfig: "./test/tsconfig.json",
			},
		],
	},
}
