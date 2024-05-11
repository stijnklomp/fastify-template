// const typescriptFileRules = {
// 	"@typescript-eslint/naming-convention": [
// 		"error",
// 		{
// 			selector: "variable",
// 			format: ["camelCase", "PascalCase", "UPPER_CASE"],
// 			leadingUnderscore: "allow",
// 		},
// 		{
// 			selector: "function",
// 			format: ["camelCase", "PascalCase"],
// 		},
// 		{
// 			selector: "typeLike",
// 			format: ["PascalCase"],
// 		},
// 	],
// 	"no-unused-vars": "off",
// 	"@typescript-eslint/no-unused-vars": [
// 		"error",
// 		{ varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
// 	],
// 	"prettier/prettier": 2,
// 	quotes: ["error", "double"],
// 	semi: [
// 		"error",
// 		"never",
// 		{ beforeStatementContinuationChars: "always" },
// 	],
// 	"@stylistic/no-multiple-empty-lines": [
// 		"error",
// 		{ max: 1, maxBOF: 0, maxEOF: 0 },
// 	],
// 	"@typescript-eslint/interface-name-prefix": "off",
// 	"@typescript-eslint/explicit-function-return-type": "off",
// 	"@typescript-eslint/explicit-module-boundary-types": "off",
// 	"@typescript-eslint/no-explicit-any": "off",
// 	"@typescript-eslint/require-await": "off",
// }

// eslint-disable-next-line @typescript-eslint/no-var-requires
const typescriptFileRules = require("./typescriptRules.cjs")

module.exports = {
	env: {
		node: true,
	},
	extends: [
		"plugin:jsonc/recommended-with-jsonc",
		`${__dirname}/node_modules/stijnklomp-linting-formatting-config/eslintRules.js`,
		`${__dirname}/node_modules/stijnklomp-linting-formatting-config/jestRules.js`,
		`${__dirname}/node_modules/stijnklomp-linting-formatting-config/typescript/typescriptRules.js`,
		"prettier",
	],
	ignorePatterns: ["esbuild.mjs", "jest.config.cjs"],
	overrides: [
		{
			files: ["*.json", "*.json5", "*.jsonc"],
			parser: "jsonc-eslint-parser",
			parserOptions: {
				project: "./tsconfig.json",
			},
			rules: {
				"@typescript-eslint/no-unnecessary-condition": "off",
			},
		},
		{
			files: ["src/**/*.ts"],
			parser: "@typescript-eslint/parser",
			parserOptions: {
				project: "./tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: __dirname,
			},
			rules: typescriptFileRules,
		},
	],
	parserOptions: {
		project: "./tsconfig.json",
	},
	plugins: ["@typescript-eslint", "prettier", "@stylistic"],
	root: true,
	settings: {
		"prettier/prettier": require("./node_modules/stijnklomp-linting-formatting-config/prettier/prettierRules.js"),
	},
}
