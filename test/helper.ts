import fastifySetup, { FastifyServerOptions, FastifyInstance } from "fastify"
import autoLoad from "@fastify/autoload"
import path from "path"

import { options } from "@/src/app"

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
