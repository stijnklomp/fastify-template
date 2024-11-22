import tseslint from "typescript-eslint"
import config from "stijnklomp-linting-formatting-config/dist/index.js"

export default tseslint.config(
	...config({
		strict: true,
		tsconfigRootDir: ".",
		typescript: true,
	}),
)
