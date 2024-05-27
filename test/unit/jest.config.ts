import type { Config } from "jest"
import { pathsToModuleNameMapper } from "ts-jest"

import { mainConfig } from "../jest.config"
import { compilerOptions } from "../../tsconfig.json"

const config: Config = {
	...mainConfig,
	displayName: "unit",
	moduleNameMapper: {
		...mainConfig.moduleNameMapper,
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

	// moduleNameMapper: {
	// 	...pathsToModuleNameMapper(compilerOptions.paths),
	// 	"^@/fixtures/(.*)$": "<rootDir>/test/fixtures/$1",
	// 	"^@/helper$": "<rootDir>/test/helper.ts",
	// },
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

export default config
