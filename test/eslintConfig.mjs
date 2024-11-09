import typescriptEslintParser from "@typescript-eslint/parser"

export default [
	// TODO: Add this for integration & feature?
	{
		files: ["test/**/*.ts"],
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				project: "./tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: import.meta.dirname,
			},
		},
		name: "Test",
	},
	{
		files: ["test/unit/**/*.ts"],
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				project: "unit/tsconfig.json",
				sourceType: "module",
				tsconfigRootDir: import.meta.dirname,
			},
		},
		name: "Unit",
		rules: {
			"@typescript-eslint/unbound-method": "off",
		},
	},
]
