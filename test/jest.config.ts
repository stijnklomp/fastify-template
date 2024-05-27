import type { Config } from "jest"
import { pathsToModuleNameMapper } from "ts-jest"
// import jestMockExtended from "jest-mock-extended"

import { compilerOptions } from "../tsconfig.json"

export const mainConfig: Config = {
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
	// testMatch: ["**/?(*.)+(spec|test).[jt]s"],
	// transform: {
	// 	"^.+\\.(t|j)s$": [
	// 		"ts-jest",
	// 		{
	// 			tsconfig: "./test/tsconfig.json",
	// 		},
	// 	],
	// },
}

const config: Config = {
	...mainConfig,
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
	projects: ["<rootDir>/test/unit"],
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
	rootDir: "../",
}

export default config
