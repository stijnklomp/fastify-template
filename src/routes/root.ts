import { FastifyPluginAsync } from "fastify"

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
	// eslint-disable-next-line prefer-arrow-callback
	fastify.get("/", async function (request, reply) {
		return { root: true }
	})
}

export default root
