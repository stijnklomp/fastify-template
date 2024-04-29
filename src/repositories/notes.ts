import { prisma } from "@/utils/prisma"
import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import {
	getNotesValidationSchema,
	createNoteValidationSchema,
} from "@/validators/notes"

export const getNotesRepository = async (
	data: StaticRequestSchemaTypes<typeof getNotesValidationSchema>,
) =>
	prisma.note.findMany({
		skip: data.querystring.page - 1,
		take: data.querystring.perPage,
	})

export const createNoteRepository = async (
	data: StaticRequestSchemaTypes<typeof createNoteValidationSchema>,
) =>
	prisma.note.create({
		data: data.body,
	})

export default {
	getNotesRepository,
	createNoteRepository,
}
