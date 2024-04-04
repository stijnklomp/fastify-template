module.exports = {
	env: {
		jest: true,
		node: true
	},
	extends: [
		"plugin:jsonc/recommended-with-jsonc",
		"./node_modules/stijnklomp-linting-formatting-config/eslintRules.js",
		"./node_modules/stijnklomp-linting-formatting-config/jestRules.js",
		"./node_modules/stijnklomp-linting-formatting-config/typescript/typescriptRules.js",
		"prettier"
	],
	overrides: [
		{
			files: ["*.json", "*.json5", "*.jsonc"],
			parser: "jsonc-eslint-parser",
			rules: {
				"@typescript-eslint/no-unnecessary-condition": "off"
			}
		}
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "prettier", "@stylistic"],
	parserOptions: {
		// ecmaVersion: 2021,
		project: "./tsconfig.json",
		sourceType: "module",
		tsconfigRootDir: __dirname
	},
	root: true,
	rules: {
		"prettier/prettier": 2,
		quotes: ["error", "double"],
		semi: [
			"error",
			"never",
			{ beforeStatementContinuationChars: "always" }
		],
		"@stylistic/no-multiple-empty-lines": [
			"error",
			{ max: 1, maxBOF: 0, maxEOF: 0 }
		],
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "off"
	},
	settings: {
		"prettier/prettier": require("./node_modules/stijnklomp-linting-formatting-config/prettier/prettierRules.js")
	}
}
