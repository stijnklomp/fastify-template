// @ts-check

// import jseslint from "@eslint/js"
import tseslint from "typescript-eslint"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import typescriptEslintParser from "@typescript-eslint/parser"
import eslintPluginJsonc from "eslint-plugin-jsonc"
import eslintPluginYml from "eslint-plugin-yml"
import * as eslintRules from "stijnklomp-linting-formatting-config/eslintRules.js"
import * as typescriptRules from "stijnklomp-linting-formatting-config/typescript/typescriptRules.js"
import markdown from "eslint-plugin-markdown"
import globals from "globals"

import typescriptCustomRules from "./typescriptRules.mjs"
import * as testConfig from "./test/eslintConfig.mjs"

const jsFileExts = ["**/*.js", "**/*.mjs", "**/*.cjs"]
const tsFileExts = ["**/*.ts"]
// const jsTsFileExts = [...jsFileExts, ...tsFileExts]

const nameMarkdownCodeBlocksConfigs = () => {
	const combinedNamedConfigs = []

	markdown.configs.recommended.forEach((config) => {
		combinedNamedConfigs.push({
			...config,
			name: "Markdown code blocks",
		})
	})

	return combinedNamedConfigs
}

export default tseslint.config(
	// @ts-expect-error: Imported config will not have all of the correct associated types recognized by tseslint.config
	...tseslint.configs.recommended.map((config) => ({
		...config,
		files: jsFileExts,
		name: "TSEslint recommended Javascript",
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
			},
		},
	})),
	...tseslint.configs.stylistic.map((config) => ({
		...config,
		files: jsFileExts,
		name: "TSEslint stylistic Javascript",
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
			},
		},
	})),
	...tseslint.configs.recommendedTypeChecked.map((config) => ({
		...config,
		files: tsFileExts,
		name: "TSEslint recommended Typescript",
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
		files: tsFileExts,
		name: "TSEslint stylistic Typescript",
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
			...typescriptRules.default.overrides[0].rules,
			...typescriptCustomRules,
			"@typescript-eslint/unbound-method": "off",
			"@typescript-eslint/consistent-type-definitions": ["warn", "type"],
		},
	},
	...testConfig.default,
	...nameMarkdownCodeBlocksConfigs(),
	{
		...eslintPluginPrettierRecommended,
		name: "ESLint-Prettier recommended",
	},
	{
		ignores: [
			"node_modules/",
			"dist/",
			".husky/",
			"prisma/",
			"rabbitmq/",
			"package-lock.json",
			".dockerignore",
		],
		name: "Ignores",
	},
)
