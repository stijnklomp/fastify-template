import { createNoteHandler, getNotesHandler } from "@/controllers/notes"
import {
	getNotesValidationSchema,
	createNoteValidationSchema,
} from "@/validators/notes"
import { FastifyInstance } from "fastify"

export default async (fastify: FastifyInstance) => {
	fastify.route({
		method: "GET",
		url: "/notes",
		schema: getNotesValidationSchema,
		handler: getNotesHandler,
	})

	fastify.route({
		method: "POST",
		url: "/notes",
		schema: createNoteValidationSchema,
		handler: createNoteHandler,
	})
}
