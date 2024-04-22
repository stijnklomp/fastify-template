import fp from "fastify-plugin"
import helmet from "@fastify/helmet"

/**
 * This plugins adds important security headers for Fastify.
 *
 * @see https://github.com/fastify/fastify-helmet
 */
export default fp<object>(async (fastify, _options, done) => {
	console.log("beginning of helmet plugin")
	await fastify.register(helmet, {
		crossOriginResourcePolicy: false,
	})
	console.log("end of helmet plugin")
	done()
})
