/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-check

import tseslint from "typescript-eslint"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import typescriptEslintParser from "@typescript-eslint/parser"
import jsoncEslintParser from "jsonc-eslint-parser"
import typescriptCustomRules from "./typescriptRules.mjs"
import * as eslintRules from "stijnklomp-linting-formatting-config/eslintRules.js"
import * as typescriptRules from "stijnklomp-linting-formatting-config/typescript/typescriptRules.js"
import globals from "globals"

import * as testConfig from "./test/eslint.config.mjs"

export default tseslint.config(
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				project: true,
				sourceType: "module",
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.node,
			},
		},
		name: "default",
		rules: {
			...eslintRules.default.rules,
			"@typescript-eslint/unbound-method": "off",
		},
	},
	{
		ignores: ["./dist/", "./.husky/", "./prisma/", "./rabbitmq/"],
		name: "ignores",
	},
	{
		files: ["**/*.ts"],
		name: "Typescript",
		rules: {
			...typescriptRules.default.overrides[0].rules,
			...typescriptCustomRules,
		},
	},
	{
		files: ["*.json", "*.json5", "*.jsonc"],
		ignores: [
			"package.json",
			"package-lock.json",
			".lintstagedrc.json",
			"tsconfig.json",
			"tsconfig.production.json",
			"typedoc.json",
		],
		languageOptions: {
			parser: jsoncEslintParser,
			parserOptions: {
				project: true,
			},
		},
		name: "JSON",
		rules: {
			"@typescript-eslint/no-unnecessary-condition": "off",
		},
	},
	{
		...eslintPluginPrettierRecommended,
		name: "ESLint-Prettier plugin"
	},
	// @ts-ignore
	testConfig.default,
)
