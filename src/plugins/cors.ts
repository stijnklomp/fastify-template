import fp from "fastify-plugin"
import cors from "@fastify/cors"

/**
 * This plugins enables the use of CORS in a Fastify application.
 *
 * @see https://github.com/fastify/fastify-cors
 */
export default fp<object>(async (fastify, _options, done) => {
	console.log("beginning of cors plugin")
	await fastify.register(cors)
	console.log("end of cors plugin")
	done()
})
