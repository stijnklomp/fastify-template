import { checkHealthyHandler } from "@/controllers/health"
import { FastifyInstance } from "fastify"

export default async (fastify: FastifyInstance) => {
	fastify.route({
		method: "GET",
		url: "/health",
		handler: checkHealthyHandler,
	})
}
