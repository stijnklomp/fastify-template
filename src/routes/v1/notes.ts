import { FastifyTypebox } from "@/src/models/types/fastifyModules"
import { createNoteHandler, getNotesHandler } from "@/controllers/notes"
// import {
// 	createNoteValidationSchema,
// 	getNotesValidationSchema,
// } from "@/validators/notes"

// export default (
// 	fastify: FastifyInstance,
// 	_options: RegisterOptions,
// 	done: DoneFuncWithErrOrRes,
// ) => {

export default async (fastify: FastifyTypebox) => {
	fastify.route({
		method: "GET",
		url: "/notes",
		// schema: {
		// 	querystring: getNotesValidationSchema,
		// },
		// validatorCompiler: ({ schema }: any) => {
		// 	return (data) => schema.validate(data)
		// },
		handler: getNotesHandler,
	})

	fastify.route({
		method: "POST",
		url: "/notes",
		// schema: {
		// 	body: createNoteValidationSchema,
		// },
		// validatorCompiler: ({ schema }: any) => {
		// 	return (data) => schema.validate(data)
		// },
		handler: createNoteHandler,
	})
}
