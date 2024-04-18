import { FastifyPluginAsync } from "fastify"

// eslint-disable-next-line @typescript-eslint/require-await
const root: FastifyPluginAsync = async (fastify): Promise<void> => {
	fastify.get("/", () => ({ root: true }))
}

export default root
