import type { Config } from "jest"
import { pathsToModuleNameMapper } from "ts-jest"

import { compilerOptions } from "../tsconfig.json"

export const coreConfig: Config = {
	// automock: false,
	clearMocks: true,
	moduleDirectories: ["node_modules"],
	moduleFileExtensions: ["ts", "js", "json"],
	moduleNameMapper: {
		...pathsToModuleNameMapper(compilerOptions.paths),
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"^@/fixtures/(.*)$": "<rootDir>/test/fixtures/$1",
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"^@/helper$": "<rootDir>/test/helper.ts",
	},
	modulePaths: [compilerOptions.baseUrl],
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testEnvironment: "node",
}

export const coverageConfig: Config = {
	collectCoverageFrom: ["<rootDir>/src/**/*.{cjs,mjs,js,ts}"],
	coveragePathIgnorePatterns: [
		"<rootDir>/src/app.ts",
		"<rootDir>/node_modules/",
		"<rootDir>/.husky/",
		"<rootDir>/dist/",
		"<rootDir>/doc/",
		"<rootDir>/dagger/",
	],
	coverageReporters: ["html", "text", "json"],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
}

const config: Config = {
	...coreConfig,
	projects: [
		"<rootDir>/test/unit",
		"<rootDir>/test/feature",
		"<rootDir>/test/acceptance",
	],
	rootDir: "../",
}

export default config
