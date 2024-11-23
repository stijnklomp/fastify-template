import { checkHealthyHandler } from "@/controllers/health"
import { FastifyInstance } from "fastify"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: checkHealthyHandler,
		method: "GET",
		url: "/health",
	})
}
