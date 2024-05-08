import Fastify, { FastifyServerOptions } from "fastify"
import AutoLoad from "@fastify/autoload"
import path from "path"

import { options } from "@/src/app"

export const build = async (
	overrideOptions: Partial<FastifyServerOptions> = {},
) => {
	const fastify = Fastify({
		...options,
		...overrideOptions,
	})

	await fastify.register(AutoLoad, {
		dir: path.join(__dirname, "../src/plugins"),
	})
	await fastify.register(AutoLoad, {
		dir: path.join(__dirname, "../src/routes"),
	})

	return fastify
}
