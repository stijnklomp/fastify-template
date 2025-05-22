import { FastifyInstance } from "fastify"

import { createNoteHandler, getNotesHandler } from "@/controllers/notes"
import { getNotes, createNote } from "@/models/validators/notes"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: getNotesHandler,
		method: "GET",
		schema: getNotes,
		url: "/notes",
	})

	fastify.route({
		handler: createNoteHandler,
		method: "POST",
		schema: createNote,
		url: "/notes",
	})
}
