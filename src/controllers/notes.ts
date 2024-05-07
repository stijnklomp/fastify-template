import { FastifyReply } from "fastify"
import notesValidator from "@/validators/notes"
import { logger } from "@/lib/logger"
import notesService from "@/services/notes"
import { FastifyRequestSchemaTypes } from "@/src/models/types/schemaBuilderTypeExtractor"

export const getNotesHandler = async (
	req: FastifyRequestSchemaTypes<typeof notesValidator.getNotes>,
	res: FastifyReply,
) => {
	try {
		const notes = await notesService.getNotes({ ...req.query })

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
	req: FastifyRequestSchemaTypes<typeof notesValidator.createNote>,
	res: FastifyReply,
) => {
	try {
		const note = await notesService.createNote({ ...req.body }) // needs looking at

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
