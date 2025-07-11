import { FastifyInstance } from "fastify"

import { livenessHandler, readinessHandler } from "@/controllers/health"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: livenessHandler,
		method: "GET",
		url: "/healthz",
	})

	fastify.route({
		handler: readinessHandler,
		method: "GET",
		url: "/readyz",
	})
}
