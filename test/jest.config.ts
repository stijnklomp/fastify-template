import type { Config } from "jest"
import { pathsToModuleNameMapper } from "ts-jest"

import { compilerOptions } from "../tsconfig.json"

export const coreConfig: Config = {
	clearMocks: true,
	moduleDirectories: ["<rootDir>/node_modules"],
	moduleFileExtensions: ["ts", "js", "json"],
	moduleNameMapper: {
		...pathsToModuleNameMapper(compilerOptions.paths),
		"^@/fixtures/(.*)$": "<rootDir>/test/fixtures/$1",
		"^@/helper$": "<rootDir>/test/helper.ts",
	},
	modulePaths: [compilerOptions.baseUrl],
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testEnvironment: "node",
}

export const coverageConfig: Config = {
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
}

const config: Config = {
	...coreConfig,
	projects: ["<rootDir>/test/unit"],
	rootDir: "../",
}

export default config
