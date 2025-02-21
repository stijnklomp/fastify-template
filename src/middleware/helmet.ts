import fp from "fastify-plugin"
import helmet from "@fastify/helmet"

/**
 * This plugins adds important security headers for Fastify.
 *
 * @see https://github.com/fastify/fastify-helmet
 */
export default fp(async (fastify) => {
	await fastify.register(helmet, {
		crossOriginResourcePolicy: false,
	})
})
