import { createNoteHandler, getNotesHandler } from "@/controllers/notes"
import { getNotes, createNote } from "@/validators/notes"
import { FastifyInstance } from "fastify"

export default async (fastify: FastifyInstance) => {
	fastify.route({
		method: "GET",
		url: "/notes",
		schema: getNotes,
		handler: getNotesHandler,
	})

	fastify.route({
		method: "POST",
		url: "/notes",
		schema: createNote,
		handler: createNoteHandler,
	})
}
