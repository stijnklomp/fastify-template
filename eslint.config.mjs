import tseslint from "typescript-eslint"

import config from "stijnklomp-linting-formatting-config/dist/index.js"
const finalConfig = config({
	typescript: true,
	strict: true,
	tsconfigRootDir: ".",
	configs: {
		markdownCodeBlocks: false,
		stylistic: false,
		jest: false,
	},
})

// delete finalConfig[finalConfig.length - 1]
// delete finalConfig[finalConfig.length - 2]
// delete finalConfig[finalConfig.length - 3]
// delete finalConfig[finalConfig.length - 4]
// delete finalConfig[finalConfig.length - 5]
// delete finalConfig[finalConfig.length - 6]
// delete finalConfig[finalConfig.length - 7]
// delete finalConfig[finalConfig.length - 8]
// delete finalConfig[finalConfig.length - 9]
// delete finalConfig[finalConfig.length - 10]
// delete finalConfig[finalConfig.length - 11]
// delete finalConfig[finalConfig.length - 12]
// delete finalConfig[finalConfig.length - 13]
// delete finalConfig[finalConfig.length - 14]
// delete finalConfig[finalConfig.length - 15]
// delete finalConfig[finalConfig.length - 16]
// delete finalConfig[finalConfig.length - 17]
// delete finalConfig[finalConfig.length - 18]
// delete finalConfig[finalConfig.length - 19]
// delete finalConfig[finalConfig.length - 20]
// delete finalConfig[finalConfig.length - 21]
// delete finalConfig[finalConfig.length - 22]

console.log(...finalConfig)
export default tseslint.config(...finalConfig, {
	ignores: ["typedoc.config.mjs"],
	// rules: {
	// 	"no-unused-vars": "off",
	// 	// "@typescript-eslint/no-unused-vars": [
	// 	// 	"error",
	// 	// 	{ "argsIgnorePattern": "^_" }
	// 	// ]
	// }
})
// console.log(...config({
// 	typescript: true,
// 	strict: true,
// 	tsconfigRootDir: "."
// }))
// export default tseslint.config(...config({
// 	typescript: true,
// 	strict: true,
// 	tsconfigRootDir: "."
// }))
