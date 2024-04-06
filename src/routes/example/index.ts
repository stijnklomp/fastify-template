import { FastifyPluginAsync } from "fastify"

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
	// eslint-disable-next-line prefer-arrow-callback
	fastify.get("/", async function (request, reply) {
		return "this is an example"
	})
}

export default example
