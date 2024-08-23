import type { Config } from "jest"

import { coreConfig, coverageConfig } from "../jest.config"

const config: Config = {
	...coreConfig,
	...coverageConfig,
	displayName: "end-2-end",
	moduleNameMapper: {
		...coreConfig.moduleNameMapper,
	},
	rootDir: "../../",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testMatch: ["**/?(*.)+(spec|test).[jt]s"],
	transform: {
		"^.+\\.(t|j)s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/test/e2e/tsconfig.json",
			},
		],
	},
}

export default config
