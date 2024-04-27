import { FastifyTypebox } from "@/src/models/types/fastifyModules"
import { createNoteHandler, getNotesHandler } from "@/controllers/notes"
import {
	createNoteValidationSchema,
	getNotesValidationSchema,
} from "@/validators/notes"

export default async (fastify: FastifyTypebox) => {
	fastify.route({
		method: "GET",
		url: "/notes",
		schema: getNotesValidationSchema,
		// validatorCompiler: ({ schema }: any) => {
		// 	return (data) => schema.validate(data)
		// },
		handler: getNotesHandler,
	})

	fastify.route({
		method: "POST",
		url: "/notes",
		schema: createNoteValidationSchema,
		// validatorCompiler: ({ schema }: any) => {
		// 	return (data) => schema.validate(data)
		// },
		handler: createNoteHandler,
	})
}
