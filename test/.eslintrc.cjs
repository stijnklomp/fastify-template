/* eslint-disable @typescript-eslint/no-var-requires */
const mainConfig = require("../.eslintrc.cjs")
const typescriptFileRules = require("../typescriptRules.cjs")

module.exports = {
	...mainConfig,
	env: {
		...mainConfig.env,
		jest: true,
	},
	overrides: [
		...mainConfig.overrides,
		{
			files: [".eslintrc.cjs", "**/*.ts"],
			parser: "@typescript-eslint/parser",
			parserOptions: {
				project: "test/tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: ".",
			},
			rules: typescriptFileRules,
		},
	],
}
