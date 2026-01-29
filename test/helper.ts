import fastifySetup, {
	type FastifyServerOptions,
	type FastifyInstance,
} from "fastify"
import autoLoad from "@fastify/autoload"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, beforeAll, jest } from "bun:test"

import { options } from "@/src/app"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const build = (overrideOptions: Partial<FastifyServerOptions> = {}) => {
	let fastify: FastifyInstance

	beforeAll(async () => {
		fastify = fastifySetup({
			...options,
			...overrideOptions,
		})

		await fastify.register(autoLoad, {
			dir: path.join(__dirname, "../src/plugins"),
		})
		await fastify.register(autoLoad, {
			dir: path.join(__dirname, "../src/routes"),
		})
	})

	afterAll(async () => {
		await fastify.close()
	})

	return () => fastify
}

/**
 * Give any asynchronous handlers a tick to run.
 */
export const runAsyncHandlers = async () => new Promise((r) => setImmediate(r))

let originalProcessExit: typeof process.exit

export const mockProcessExit = () => {
	originalProcessExit = process.exit.bind(process)
	process.exit = jest.fn() as never
}

/**
 * @remarks Called after `mockProcessExit`.
 */
export const restoreProcessExit = () => {
	process.exit = originalProcessExit
}

const originalEnv = { ...process.env }

export const restoreEnvVars = () => (process.env = originalEnv)
