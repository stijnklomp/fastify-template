import config from "stijnklomp-linting-formatting-config/dist/index.js"
import { includeIgnoreFile } from "@eslint/compat"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const finalConfig = config({
	strict: true,
	tsconfigRootDir: __dirname,
	typescript: true,
})

const addedConfigs = [
	{
		files: ["**/*.ts", "**/*.js"],
		rules: {
			"@typescript-eslint/naming-convention": [
				"error",
				{
					format: ["camelCase"],
					selector: "default",
				},
				{
					format: ["camelCase", "UPPER_CASE"],
					selector: "variable",
				},
				{
					format: ["camelCase"],
					leadingUnderscore: "allow",
					selector: "parameter",
				},
				{
					format: ["PascalCase"],
					selector: "typeLike",
				},
				{
					selector: "objectLiteralProperty",
					format: null,
					filter: {
						regex: "^[0-9]+$",
						match: true,
					},
				},
			],
		},
	},
]
finalConfig.push(...addedConfigs)

const gitignorePath = path.resolve(__dirname, ".gitignore")
finalConfig.push(includeIgnoreFile(gitignorePath), {
	ignores: [
		"test/**/reports/**",
		"test/**/coverage/**",
		".prettierrc.js",
		"typedoc.config.js",
		"prisma.config.ts",
		"eslint.config.js",
	],
})

finalConfig.push({
	languageOptions: {
		parserOptions: {
			project: null,
			projectService: true,
			tsconfigRootDir: __dirname,
		},
	},
	name: "Override @typescript-eslint parserOptions",
})

export default finalConfig
