import { FastifyInstance } from "fastify"
import fp from "fastify-plugin"

/**
 * This plugins enables the use of CORS in a Fastify application.
 *
 * @see https://github.com/fastify/fastify-cors
 */
module.exports = fp(async (fastify: FastifyInstance) => {
	await fastify.register(import("@fastify/cors"))
})
