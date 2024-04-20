import { FastifyInstance } from "fastify"
import { createNoteHandler, getNotesHandler } from "@/controllers/notes"
import {
	createNoteValidationSchema,
	getNotesValidationSchema,
} from "@/validators/notes"

export default (fastify: FastifyInstance) => {
	fastify.route({
		method: "GET",
		url: "/",
		schema: {
			querystring: getNotesValidationSchema,
		},
		// validatorCompiler: ({ schema }: any) => {
		// 	return (data) => schema.validate(data)
		// },
		handler: getNotesHandler,
	})

	fastify.route({
		method: "POST",
		url: "/",
		schema: {
			body: createNoteValidationSchema,
		},
		// validatorCompiler: ({ schema }: any) => {
		// 	return (data) => schema.validate(data)
		// },
		handler: createNoteHandler,
	})
}
