import { coreConfig, coverageConfig } from "../jest.config.ts"

const config = {
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
		"^.+\\.(t|j)s$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/test/acceptance/tsconfig.json",
			},
		],
	},
}

export default config
