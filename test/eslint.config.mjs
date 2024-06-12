import typescriptEslintParser from "@typescript-eslint/parser"

export default [
	{
		files: ["test/**/*.ts"],
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				project: "test/tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: ".",
			},
		},
		name: "Test",
		rules: {
			"@typescript-eslint/unbound-method": "off",
		},
	},
]
