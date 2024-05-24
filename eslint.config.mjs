/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import typescriptEslintParser from "@typescript-eslint/parser"
import jsoncEslintParser from "jsonc-eslint-parser"
import typescriptCustomRules from "./typescriptRules.mjs"
import * as eslintRules from "stijnklomp-linting-formatting-config/eslintRules.js"
import * as typescriptRules from "stijnklomp-linting-formatting-config/typescript/typescriptRules.js"
// import prettierSettings from "stijnklomp-linting-formatting-config/prettier/prettierRules.js"
import globals from "globals"

// import eslintConfigPrettier from "eslint-config-prettier"

export default tseslint.config(
	eslint.configs.recommended,
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
		rules: {
			...eslintRules.default.rules,
			"@typescript-eslint/unbound-method": "off",
		},
	},
	{
		ignores: ["./dist/", "./.husky/", "./prisma/", "./rabbitmq/"],
	},
	{
		files: ["**/*.ts"],
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
		rules: {
			"@typescript-eslint/no-unnecessary-condition": "off",
		},
	},
	eslintPluginPrettierRecommended,
)

// export default tseslint.config(
// 	eslint.configs.recommended,
// 	...tseslint.configs.recommended,
// 	{
// 		env: {
// 			node: true,
// 		},
// 		extends: [
// 			"plugin:jsonc/recommended-with-jsonc",
// 			`${__dirname}/node_modules/stijnklomp-linting-formatting-config/eslintRules.js`,
// 			`${__dirname}/node_modules/stijnklomp-linting-formatting-config/jestRules.js`,
// 			`${__dirname}/node_modules/stijnklomp-linting-formatting-config/typescript/typescriptRules.js`,
// 			"prettier",
// 		],
// 		ignorePatterns: ["esbuild.mjs", "jest.config.cjs"],
// 		overrides: [
// 			{
// 				files: ["*.json", "*.json5", "*.jsonc"],
// 				parser: "jsonc-eslint-parser",
// 				parserOptions: {
// 					project: "./tsconfig.json",
// 				},
// 				rules: {
// 					"@typescript-eslint/no-unnecessary-condition": "off",
// 				},
// 			},
// 			{
// 				files: ["src/**/*.ts"],
// 				parser: "@typescript-eslint/parser",
// 				parserOptions: {
// 					project: "./tsconfig.json",
// 					sourceType: "module",
// 					tsconfigRootDir: __dirname,
// 				},
// 				rules: typescriptFileRules,
// 			},
// 		],
// 		parserOptions: {
// 			project: "./tsconfig.json",
// 		},
// 		plugins: ["@typescript-eslint", "prettier", "@stylistic"],
// 		root: true,
// 		settings: {
// 			"prettier/prettier": require("stijnklomp-linting-formatting-config/prettier/prettierRules.js"),
// 		},
// 	}
// )
