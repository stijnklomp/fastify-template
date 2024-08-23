import type { Config } from "jest"

import { coreConfig, coverageConfig } from "../jest.config"

const config: Config = {
	...coreConfig,
	...coverageConfig,
	displayName: "feature",
	moduleNameMapper: {
		...coreConfig.moduleNameMapper,
		"^@/context$": "<rootDir>/test/context.ts",
	},
	rootDir: "../../",
	setupFilesAfterEnv: [
		"<rootDir>/jest.setup.ts",
		"<rootDir>/test/context.ts",
	],
	testMatch: ["**/?(*.)+(spec|test).[jt]s"],
	transform: {
		"^.+\\.(t|j)s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/test/feature/tsconfig.json",
			},
		],
	},
}

export default config
