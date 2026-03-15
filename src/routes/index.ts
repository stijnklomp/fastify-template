import { type FastifyInstance } from "fastify"

import healthRoutes from "./health"
import notesRoute from "./v1/notes"

export const registerRoutes = async (fastify: FastifyInstance) => {
	await fastify.register(healthRoutes)

	await fastify.register(notesRoute, {
		prefix: "/v1",
	})
}
