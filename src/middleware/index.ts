import { type FastifyInstance } from "fastify"

import helmetMiddleware from "./helmet"
import sensibleMiddleware from "./sensible"

export const registerMiddleware = async (fastify: FastifyInstance) => {
	await fastify.register(helmetMiddleware)
	await fastify.register(sensibleMiddleware)
}
