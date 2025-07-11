import { FastifyRequest, FastifyReply } from "fastify"
import { PrismaClient } from "@prisma/client"

import { logger, formatError } from "@/common/logger"

export const livenessHandler = async (
	req: FastifyRequest,
	res: FastifyReply,
) => {
	res.code(200).send("OK")
}

const dbConnection = async () => {
	const prisma = new PrismaClient()

	await prisma.$connect().then(async () => {
		logger.info("Database connection healthy")
		await prisma.$disconnect()
	})
}

export const readinessHandler = async (
	req: FastifyRequest,
	res: FastifyReply,
) => {
	try {
		await dbConnection()

		await res.code(204).send()
	} catch (err) {
		logger.error("Unable to connect to database:", formatError(err))
		await res.code(503).send()
	}
}
