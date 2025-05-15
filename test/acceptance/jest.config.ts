import type { Config } from "jest"

import { coreConfig, coverageConfig } from "../jest.config"

const config: Config = {
	...coreConfig,
	...coverageConfig,
	displayName: "acceptance",
	moduleNameMapper: {
		...coreConfig.moduleNameMapper,
	},
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "<rootDir>/test/acceptance/reports",
				outputName: "junit.xml",
			},
		],
	],
	rootDir: "../../",
	setupFilesAfterEnv: [...(coreConfig.setupFilesAfterEnv ?? [])],
	testMatch: ["<rootDir>/test/acceptance/**/(*.)+(spec|test).[jt]s"],
	transform: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"^.+\\.(t|j)s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/test/acceptance/tsconfig.json",
			},
		],
	},
}

export default config
