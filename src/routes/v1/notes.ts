import { createNoteHandler, getNotesHandler } from "@/controllers/notes"
import { getNotes, createNote } from "@/src/models/validators/notes"
import { FastifyInstance } from "fastify"

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
