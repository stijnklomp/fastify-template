import path from "node:path"
import { cp } from "node:fs/promises"
import * as esbuild from "esbuild"
import esbuildPluginPino from "esbuild-plugin-pino"
import serve from "@es-exec/esbuild-plugin-serve"
import fs from "fs"
import { glob } from "glob"
import { createRequire } from "module"

/**
 * Retrieve the file path to a module folder
 * @param {string} moduleEntry
 * @param {string} fromFile
 */
const getModuleDir = (moduleEntry) => {
	const packageName = moduleEntry.includes("/")
		? moduleEntry.startsWith("@")
			? moduleEntry.split("/").slice(0, 2).join("/")
			: moduleEntry.split("/")[0]
		: moduleEntry
	const require = createRequire(import.meta.url)
	const lookupPaths = require.resolve
		.paths(moduleEntry)
		.map((p) => path.join(p, packageName))
	for (const path of lookupPaths) {
		try {
			require(path)

			return path
		} catch (e) {}
	}

	return undefined
}

/**
 * ESBuild plugin to copy static folder to outdir
 */
function esbuildPluginFastifySwaggerUi() {
	return {
		name: "@fastify/swagger-ui",
		setup(build) {
			const { outdir } = build.initialOptions
			const fastifySwaggerUi = getModuleDir("@fastify/swagger-ui")
			const source = path.join(fastifySwaggerUi, "static")
			const dest = path.join(outdir, "static")

			build.onEnd(async () => cp(source, dest, { recursive: true }))
		},
	}
}

void (async function () {
	const tsfiles = await glob("src/**/*.ts")

	const options = {
		bundle: true,
		entryPoints: tsfiles,
		format: "cjs",
		logLevel: "info",
		minify: true,
		minifyIdentifiers: true,
		minifyWhitespace: true,
		outdir: "dist",
		platform: "node",
		plugins: [
			esbuildPluginPino({ transports: ["pino-pretty"] }), // DOES THIS NEED TO BE HERE FOR PRODUCTION? OR IS IT ONLY NECESSARY FOR DEVELOPMENT?
			esbuildPluginFastifySwaggerUi(),
		],
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
				...options.plugins,
				serve({
					main: "dist/app.js",
				}),
			],
		})
		await ctx.watch()
	} else {
		// eslint-disable-next-line no-console
		console.log("Building for production")
		esbuild.build(options)
	}
})()
