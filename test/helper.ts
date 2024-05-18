import Fastify, { FastifyServerOptions, FastifyInstance } from "fastify"
import AutoLoad from "@fastify/autoload"
import path from "path"

import { options } from "@/src/app"

export const build = (overrideOptions: Partial<FastifyServerOptions> = {}) => {
	let fastify: FastifyInstance

	beforeAll(async () => {
		fastify = Fastify({
			...options,
			...overrideOptions,
		})

		await fastify.register(AutoLoad, {
			dir: path.join(__dirname, "../src/plugins"),
		})
		await fastify.register(AutoLoad, {
			dir: path.join(__dirname, "../src/routes"),
		})
	})

	afterAll(async () => {
		await fastify.close()
	})

	return () => fastify
}

export const printMessage = () => "Hello world"
