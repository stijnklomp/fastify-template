import type { Config } from "jest"

import { coreConfig, coverageConfig } from "../jest.config"

const config: Config = {
	...coreConfig,
	...coverageConfig,
	displayName: "integration",
	moduleNameMapper: {
		...coreConfig.moduleNameMapper,
	},
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "<rootDir>/test/integration/reports",
				outputName: "junit.xml",
			},
		],
	],
	rootDir: "../../",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testMatch: ["<rootDir>/test/integration/**/(*.)+(spec|test).[jt]s"],
	transform: {
		"^.+\\.(t|j)s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/test/integration/tsconfig.json",
			},
		],
	},
}

export default config
