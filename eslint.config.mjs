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
	tsconfigRootDir: ".",
	typescript: true,
})

finalConfig.push({
	files: ["dagger/**/*.ts"],
	rules: {
		"@typescript-eslint/require-await": "off",
	},
})

finalConfig.push(includeIgnoreFile(gitignorePath), {
	ignores: [".husky/*", "prisma/*", "rabbitmq/*", "dagger/sdk/*"],
})

export default tseslint.config(finalConfig)
