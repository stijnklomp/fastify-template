import { logger } from "@/common/logger"
import { getNotesSchema, createNoteSchema } from "@/models/schemas/notes"
import { getNotesService, createNoteService } from "@/services/notes"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"

export const getNotesHandler: RouteHandler<typeof getNotesSchema> = async (
	req,
	res,
) => {
	try {
		const notes = await getNotesService({ ...req.query })

		await res.code(200).send({
			notes,
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({
			message: "Internal Server Error",
		})
	}
}

export const createNoteHandler: RouteHandler<typeof createNoteSchema> = async (
	req,
	res,
) => {
	try {
		const note = await createNoteService({ ...req.body })

		await res.code(201).send({
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
