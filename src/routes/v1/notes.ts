import { type FastifyInstance } from "fastify"

import { getNotesHandler, createNoteHandler } from "@/controllers/notes"
import { getNotesSchema, createNoteSchema } from "@/models/schemas/notes"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: getNotesHandler,
		method: "GET",
		schema: getNotesSchema,
		url: "/notes",
	})

	fastify.route({
		handler: createNoteHandler,
		method: "POST",
		schema: createNoteSchema,
		url: "/notes",
	})
}
