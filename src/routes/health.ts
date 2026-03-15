import { type FastifyInstance } from "fastify"

import { livenessHandler, readinessHandler } from "@/controllers/health"
import { livenessSchema, readinessSchema } from "@/models/schemas/health"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: livenessHandler,
		method: "GET",
		schema: livenessSchema,
		url: "/healthz",
	})

	fastify.route({
		handler: readinessHandler,
		method: "GET",
		schema: readinessSchema,
		url: "/readyz",
	})
}
