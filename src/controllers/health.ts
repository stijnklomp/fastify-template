import { FastifyReply } from "fastify"
import { PrismaClient } from "@prisma/client"

import notesValidator from "@/models/validators/notes"
import { logger, formatError } from "@/common/logger"
import { FastifyRequestSchemaTypes } from "@/models/types/schemaBuilderTypeExtractor"

const dbConnection = async () => {
	const prisma = new PrismaClient()

	await prisma.$connect().then(async () => {
		logger.info("Database connection healthy")
		await prisma.$disconnect()
	})
}

export const checkHealthyHandler = async (
	req: FastifyRequestSchemaTypes<typeof notesValidator.getNotes>,
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
