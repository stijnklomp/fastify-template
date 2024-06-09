/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// @ts-check

import jseslint from "@eslint/js"
import tseslint from "typescript-eslint"
// import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import typescriptEslintParser from "@typescript-eslint/parser"
import eslintPluginJsonc from "eslint-plugin-jsonc"
import eslintPluginYml from "eslint-plugin-yml"
import * as eslintRules from "stijnklomp-linting-formatting-config/eslintRules.js"
import * as typescriptRules from "stijnklomp-linting-formatting-config/typescript/typescriptRules.js"
import globals from "globals"

import typescriptCustomRules from "./typescriptRules.mjs"
import * as testConfig from "./test/eslint.config.mjs"

const jsFileExts = ["**/*.js", "**/*.mjs", "**/*.cjs", "**/*.ts"]
const tsFileExts = ["**/*.ts"]
const jsTsFileExts = [...jsFileExts, ...tsFileExts]

export default tseslint.config(
	{
		files: jsFileExts,
		rules: jseslint.configs.recommended.rules,
		...tseslint.configs.disableTypeChecked,
	},
	// @ts-expect-error: Imported config will not have all of the correct associated types recognized by tseslint.config
	...tseslint.configs.recommendedTypeChecked.map((config) => ({
		...config,
		files: jsTsFileExts,
		name: "TSEslint recommended",
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				project: "./tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: import.meta.dirname,
			},
		},
	})),
	...tseslint.configs.stylisticTypeChecked.map((config) => ({
		...config,
		files: jsTsFileExts,
		name: "TSEslint stylistic",
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				project: "./tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: import.meta.dirname,
			},
		},
	})),
	...eslintPluginJsonc.configs["flat/recommended-with-jsonc"].map(
		(config) => ({
			...config,
			files: ["**/*.json", "**/*.json5", "**/*.jsonc"],
			name: "JSON",
		}),
	),
	...eslintPluginYml.configs["flat/recommended"].map((config) => ({
		...config,
		files: ["**/*.yml", "**/*.yaml"],
		name: "YAML",
		rules: {
			"yml/no-empty-mapping-value": "off",
		},
	})),
	{
		files: tsFileExts,
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				project: "./tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.node,
			},
		},
		name: "Typescript",
		rules: {
			...eslintRules.default.rules,
			"@typescript-eslint/unbound-method": "off",
			...typescriptRules.default.overrides[0].rules,
			...typescriptCustomRules,
		},
	},
	{
		ignores: ["./dist/", "./.husky/", "./prisma/", "./rabbitmq/"],
		name: "ignores",
	},
	// {
	// 	...eslintPluginPrettierRecommended,
	// 	name: "ESLint-Prettier recommended",
	// },
	testConfig.default,
)
