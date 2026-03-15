import { type FastifyInstance } from "fastify"

import healthRoute from "./health"
import notesRoute from "./v1/notes"

export const registerRoutes = async (fastify: FastifyInstance) => {
	await fastify.register(healthRoute)

	await fastify.register(notesRoute, {
		prefix: "/v1",
	})
}
