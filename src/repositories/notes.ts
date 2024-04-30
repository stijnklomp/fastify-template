import { prisma } from "@/utils/prisma"
import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import {
	getNotesValidationSchema,
	createNoteValidationSchema,
} from "@/validators/notes"

export const getNotesRepository = async (
	data: StaticRequestSchemaTypes<
		typeof getNotesValidationSchema
	>["querystring"],
) =>
	prisma.note.findMany({
		skip: data.page - 1,
		take: data.perPage,
	})

export const createNoteRepository = async (
	data: StaticRequestSchemaTypes<typeof createNoteValidationSchema>["body"],
) =>
	prisma.note.create({
		data,
	})

export default {
	getNotesRepository,
	createNoteRepository,
}
