import tseslint from "typescript-eslint"

import * as mainConfig from "../eslint.config.js"
import typescriptCustomRules from "../typescriptRules.js"
import globals from "globals"
import { languageOptions } from "eslint-plugin-prettier/recommended"

export default tseslint(
	...mainConfig,
	{
		languageOptions: {
			...globals.jest,
		},
	},
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				project: "test/tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: ".",
			},
		},
		rules: {
			// ...typescriptCustomRules,
			"@typescript-eslint/unbound-method": "none",
		},
	},
)

// module.exports = tseslint({
// 	...mainConfig,
// 	env: {
// 		...mainConfig.env,
// 		jest: true,
// 	},
// 	overrides: [
// 		...mainConfig.overrides,
// 		{
// 			files: [".eslintrc.js", "**/*.ts"],
// 			parser: "@typescript-eslint/parser",
// 			parserOptions: {
// 				project: "test/tsconfig.json",
// 				sourceType: "module",
// 				tsconfigRootDir: ".",
// 			},
// 			rules: {
// 				...typescriptCustomRules,
// 				"@typescript-eslint/unbound-method": "none",
// 			},
// 		},
// 	],
// })
