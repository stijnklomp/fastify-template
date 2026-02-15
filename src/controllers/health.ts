import { type FastifyRequest, type FastifyReply } from "fastify"

import { logger, formatError } from "@/common/logger"
import { prisma as prismaClient } from "@/common/prisma"

export const livenessHandler = async (
	req: FastifyRequest,
	res: FastifyReply,
) => {
	res.code(204).send()
}

const dbConnection = async () => {
	const prisma = prismaClient()

	console.log("dbConnection prisma:", prisma)

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
		console.log("readinessHandler 1")
		await dbConnection()
		console.log("readinessHandler 2")

		await res.code(204).send()
	} catch (err) {
		console.log("readinessHandler 3:", err)
		logger.error("Unable to connect to database:", formatError(err))
		await res.code(503).send()
	}
}
