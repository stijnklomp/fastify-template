import tseslint from "typescript-eslint"
import config from "stijnklomp-linting-formatting-config/dist/index.js"
import { includeIgnoreFile } from "@eslint/compat"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, ".gitignore")

const finalConfig = config({
	strict: true,
	tsconfigRootDir: __dirname,
	typescript: true,
})

const addedConfigs = [
	{
		files: ["test/unit/**/*.ts"],
		name: "Typescript -> Unit tests",
		rules: {
			"@typescript-eslint/no-unsafe-assignment": "off", // Disabled for tests to avoid verbose type casting when using Jest mocks
			"@typescript-eslint/unbound-method": "off",
		},
	},
]

finalConfig.push(...addedConfigs)

finalConfig.push(includeIgnoreFile(gitignorePath), {
	ignores: [
		".husky/*",
		"prisma/*",
		"rabbitmq/*",
		"test/acceptance/reports/*",
		"test/combined-coverage/*",
		"secrets/*",
		".prettierrc.js",
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

export default tseslint.config(finalConfig)
