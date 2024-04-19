import { FastifyReply, FastifyRequest } from "fastify"
import { logger } from "@/lib/logger"

import { CREATE_NOTE_TYPE, GET_NOTE_TYPE } from "@/types/note"
import { noteService } from "@/services/note"

export const createNoteHandler = async (
	req: FastifyRequest<{
		Body: CREATE_NOTE_TYPE
	}>,
	res: FastifyReply,
) => {
	try {
		const note = await noteService.createNote(req.body)

		res.code(200).send({
			message: "Note Created",
			note,
		})
	} catch (err) {
		logger.error(err)
		res.code(500).send({
			message: "Internal Server Error",
		})
	}
}

export const getNotesHandler = async (
	req: FastifyRequest<{
		Querystring: GET_NOTE_TYPE
	}>,
	res: FastifyReply,
) => {
	try {
		const notes = await noteService.getNotes(req.query)

		res.code(201).send({
			notes,
		})
	} catch (err) {
		logger.error(err)
		res.code(500).send({
			message: "Internal Server Error",
		})
	}
}
