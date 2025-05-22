import { FastifyInstance } from "fastify"

import { checkHealthyHandler } from "@/controllers/health"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: checkHealthyHandler,
		method: "GET",
		url: "/health",
	})
}
