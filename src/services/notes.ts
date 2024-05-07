import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import {
	getNotesValidationSchema,
	createNoteValidationSchema,
} from "@/validators/notes"
import notesRepository from "@/repositories/notes"

export const getNotes = async (
	data: StaticRequestSchemaTypes<
		typeof getNotesValidationSchema
	>["querystring"],
) => await notesRepository.getNotes(data)

export const createNote = async (
	data: StaticRequestSchemaTypes<typeof createNoteValidationSchema>["body"],
) => await notesRepository.createNote(data)

export default {
	getNotes,
	createNote,
}
