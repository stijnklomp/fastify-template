import { coreConfig, coverageConfig } from "../jest.config.ts"

const config = {
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
		...(coreConfig.setupFilesAfterEnv ?? []),
		"<rootDir>/test/context.ts",
		"<rootDir>/test/unit/jest.setup.ts",
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
