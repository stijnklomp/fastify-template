module.exports = {
	env: {
		jest: true,
		node: true,
	},
	extends: [
		"plugin:jsonc/recommended-with-jsonc",
		"./node_modules/stijnklomp-linting-formatting-config/eslintRules.js",
		"./node_modules/stijnklomp-linting-formatting-config/jestRules.js",
		"./node_modules/stijnklomp-linting-formatting-config/typescript/typescriptRules.js",
		"prettier",
	],
	ignorePatterns: ["esbuild.mjs"],
	overrides: [
		{
			files: ["*.json", "*.json5", "*.jsonc"],
			parser: "jsonc-eslint-parser",
			rules: {
				"@typescript-eslint/no-unnecessary-condition": "off",
			},
		},
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "prettier", "@stylistic"],
	parserOptions: {
		// ecmaVersion: 2021,
		project: "./tsconfig.json",
		sourceType: "module",
		tsconfigRootDir: __dirname,
	},
	root: true,
	rules: {
		"@typescript-eslint/naming-convention": [
			"error",
			{
				selector: "variable",
				format: ["camelCase", "PascalCase", "UPPER_CASE"],
				leadingUnderscore: "allow",
			},
			{
				selector: "function",
				format: ["camelCase", "PascalCase"],
			},
			{
				selector: "typeLike",
				format: ["PascalCase"],
			},
		],
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{ varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
		],
		"prettier/prettier": 2,
		quotes: ["error", "double"],
		semi: [
			"error",
			"never",
			{ beforeStatementContinuationChars: "always" },
		],
		"@stylistic/no-multiple-empty-lines": [
			"error",
			{ max: 1, maxBOF: 0, maxEOF: 0 },
		],
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/require-await": "off",
	},
	settings: {
		"prettier/prettier": require("./node_modules/stijnklomp-linting-formatting-config/prettier/prettierRules.js"),
	},
}
