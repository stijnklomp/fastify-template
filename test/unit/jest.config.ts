import type { Config } from "jest"

import { coreConfig, coverageConfig } from "../jest.config"

const config: Config = {
	...coreConfig,
	...coverageConfig,
	displayName: "unit",
	moduleNameMapper: {
		...coreConfig.moduleNameMapper,
		"^@/context$": "<rootDir>/test/unit/context.ts",
	},
	rootDir: "../../",
	setupFilesAfterEnv: [
		"<rootDir>/jest.setup.ts",
		"<rootDir>/test/unit/context.ts",
	],
	testMatch: ["**/?(*.)+(spec|test).[jt]s"],
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
