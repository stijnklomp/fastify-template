/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FastifyReply, FastifyRequest } from "fastify"

import { logger } from "@/lib/logger"
import { CreateNote, GetNote } from "@/serializers/notes"
import { createNoteService, getNotesService } from "@/services/notes"

export const createNoteHandler = async (
	req: FastifyRequest<{
		Body: CreateNote
	}>,
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

export const getNotesHandler = async (
	req: FastifyRequest<{
		Querystring: GetNote
	}>,
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
