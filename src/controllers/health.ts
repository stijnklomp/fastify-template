import { type FastifyRequest, type FastifyReply } from "fastify"

import { logger } from "@/common/logger"
import { createPrismaClient } from "@/common/prisma"

export const livenessHandler = async (
	_req: FastifyRequest,
	res: FastifyReply,
) => {
	res.code(204).send()
}

const dbConnection = async () => {
	const prisma = createPrismaClient()

	await prisma.$connect()
	logger.info("Database connection healthy")
	await prisma.$disconnect()
}

export const readinessHandler = async (
	_req: FastifyRequest,
	res: FastifyReply,
) => {
	try {
		await dbConnection()

		await res.code(204).send()
	} catch (err) {
		logger.error(err)
		await res.code(503).send({
			message: "Internal Server Error",
		})
	}
}
