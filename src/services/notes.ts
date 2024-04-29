import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import {
	getNotesValidationSchema,
	createNoteValidationSchema,
} from "@/validators/notes"
import { getNotesRepository, createNoteRepository } from "@/repositories/notes"

export const getNotesService = async (
	data: StaticRequestSchemaTypes<typeof getNotesValidationSchema>,
) => await getNotesRepository(data.querystring)

export const createNoteService = async (
	data: StaticRequestSchemaTypes<typeof createNoteValidationSchema>,
) => await createNoteRepository(data.body)

export default {
	getNotesService,
	createNoteService,
}
