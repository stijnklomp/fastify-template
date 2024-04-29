import { FastifyReply } from "fastify"
import {
	getNotesValidationSchema,
	createNoteValidationSchema,
} from "@/validators/notes"
import { logger } from "@/lib/logger"
import { createNoteService, getNotesService } from "@/services/notes"
import { FastifyRequestSchemaTypes } from "@/src/models/types/schemaBuilderTypeExtractor"

export const getNotesHandler = async (
	req: FastifyRequestSchemaTypes<typeof getNotesValidationSchema>,
	res: FastifyReply,
) => {
	try {
		const notes = await getNotesService(req.query)

		await res.code(201).send({
			notes,
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({
			message: "Internal Server Error",
		})
	}
}

export const createNoteHandler = async (
	req: FastifyRequestSchemaTypes<typeof createNoteValidationSchema>,
	res: FastifyReply,
) => {
	try {
		const note = await createNoteService(req.body)

		await res.code(200).send({
			message: "Note Created",
			note,
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({
			message: "Internal Server Error",
		})
	}
}

export default {
	getNotesHandler,
	createNoteHandler,
}
