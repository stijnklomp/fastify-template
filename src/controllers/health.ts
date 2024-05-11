import { FastifyReply } from "fastify"
import notesValidator from "@/validators/notes"
import { logger } from "@/lib/logger"
import { prisma } from "@/utils/prisma"
import { FastifyRequestSchemaTypes } from "@/src/models/types/schemaBuilderTypeExtractor"

console.log(prisma)
console.log(prisma.$connect)
const dbConnection = prisma.$connect().then(async () => {
	logger.info("Database connection healthy")
	await prisma.$disconnect()
})

export const checkHealthyHandler = async (
	req: FastifyRequestSchemaTypes<typeof notesValidator.getNotes>,
	res: FastifyReply,
) => {
	try {
		await dbConnection

		await res.code(204).send()
	} catch (err) {
		logger.error(err)
		logger.error(typeof err)
		await res.code(503).send() // Todo: Extract message from error and add it to the response
	}
}
