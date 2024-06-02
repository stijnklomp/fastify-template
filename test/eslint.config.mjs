import tseslint from "typescript-eslint"
import * as typescriptRules from "stijnklomp-linting-formatting-config/typescript/typescriptRules.js"
import typescriptEslintParser from "@typescript-eslint/parser"

import typescriptCustomRules from "../typescriptRules.mjs"
import globals from "globals"

export default {
	files: ["test/**/*.ts"],
	languageOptions: {
		parser: typescriptEslintParser,
		parserOptions: {
			project: "test/tsconfig.json",
			sourceType: "module",
			tsconfigRootDir: ".",
		},
	},
	name: "test",
	rules: {
		"@typescript-eslint/unbound-method": "off",
	},
}
