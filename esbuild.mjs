import path from "node:path"
import { cp } from "node:fs/promises"
import * as esbuild from "esbuild"
import esbuildPluginPino from "esbuild-plugin-pino"
import serve from '@es-exec/esbuild-plugin-serve'

/** esbuild plugin to copy static folder to outdir */
function esbuildPluginFastifySwaggerUi() {
	return {
		name: "@fastify/swagger-ui",
		setup(build) {
			const { outdir } = build.initialOptions
			const fastifySwaggerUi = path.dirname(
				require.resolve("@fastify/swagger-ui"),
			)
			const source = path.join(fastifySwaggerUi, "static")
			const dest = path.join(outdir, "static")

			build.onEnd(async () => cp(source, dest, { recursive: true }))
		},
	}
}

void (async function () {
	const options = {
		entryPoints: ["src/app.ts"],
		logLevel: "info",
		outdir: "dist",
		bundle: true,
		minify: true,
		minifyIdentifiers: true,
		minifyWhitespace: true,
		platform: "node",
		format: "cjs",
		sourcemap: false,
		tsconfig: "tsconfig.production.json",
		plugins: [
			esbuildPluginPino({ transports: ["pino-pretty"] }),
			// esbuildPluginFastifySwaggerUi(),
		],
	}
	const args = process.argv.slice(2)

	if (args.includes("dev")) {
		console.log("Running in dev mode");
		const ctx = await esbuild.context({
			...options,
			plugins: [
				...options.plugins,
				serve({
					main: "dist/app.js"
				})
			]
		})
		await ctx.watch();
	} else {
		console.log("Building for production");
		esbuild.build(options)
	}
})()
