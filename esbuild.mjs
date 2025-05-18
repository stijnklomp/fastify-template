import * as esbuild from "esbuild"
import esbuildPluginPino from "esbuild-plugin-pino"
import serve from "@es-exec/esbuild-plugin-serve"
import { glob } from "glob"

void (async function () {
	const tsfiles = await glob("src/**/*.ts")

	const options = {
		bundle: true,
		entryPoints: tsfiles,
		// external: ["elastic-apm-node"],
		format: "cjs",
		logLevel: "info",
		minify: true,
		minifyIdentifiers: true,
		minifyWhitespace: true,
		outdir: "dist",
		platform: "node",
		sourcemap: false,
		tsconfig: "tsconfig.production.json",
	}
	const args = process.argv.slice(2)

	if (args.includes("dev")) {
		// eslint-disable-next-line no-console
		console.log("Running in dev mode")
		const ctx = await esbuild.context({
			...options,
			plugins: [
				esbuildPluginPino({
					formatters: true,
					transports: ["pino-pretty"],
				}),
				serve({
					main: "dist/app.js",
				}),
			],
		})
		await ctx.watch()
	} else {
		// eslint-disable-next-line no-console
		console.log("Building for production")
		esbuild.build({
			...options,
			plugins: [
				esbuildPluginPino({
					formatters: true,
					transports: [],
				}),
			],
		})
	}
})()
