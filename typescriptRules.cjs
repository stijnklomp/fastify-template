module.exports = {
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
}