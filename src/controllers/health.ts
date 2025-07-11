import { FastifyRequest, FastifyReply } from "fastify"

import { logger, formatError } from "@/common/logger"
import { prisma as prismaClient } from "@/common/prisma"

export const livenessHandler = async (
	req: FastifyRequest,
	res: FastifyReply,
) => {
	res.code(200).send()
}

const dbConnection = async () => {
	const prisma = prismaClient()

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
