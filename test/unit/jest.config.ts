import type { Config } from "jest"

import { coreConfig, coverageConfig } from "../jest.config"

const config: Config = {
	...coreConfig,
	...coverageConfig,
	coverageDirectory: "<rootDir>/test/unit/coverage",
	displayName: "unit",
	moduleNameMapper: {
		...coreConfig.moduleNameMapper,
		"^@/context$": "<rootDir>/test/context.ts",
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
	rootDir: "../../",
	setupFilesAfterEnv: [
		"<rootDir>/jest.setup.ts",
		"<rootDir>/test/context.ts",
	],
	testMatch: ["<rootDir>/test/unit/**/(*.)+(spec|test).[jt]s"],
	transform: {
		"^.+\\.(t|j)s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/test/unit/tsconfig.json",
			},
		],
	},
}

export default config
