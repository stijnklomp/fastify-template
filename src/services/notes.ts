import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import {
	getNotesValidationSchema,
	createNoteValidationSchema,
} from "@/validators/notes"
import { getNotesRepository, createNoteRepository } from "@/repositories/notes"

export const getNotesService = async (
	data: StaticRequestSchemaTypes<
		typeof getNotesValidationSchema
	>["querystring"],
) => await getNotesRepository(data)

export const createNoteService = async (
	data: StaticRequestSchemaTypes<typeof createNoteValidationSchema>["body"],
) => await createNoteRepository(data)

export default {
	getNotesService,
	createNoteService,
}
