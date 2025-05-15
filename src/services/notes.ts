import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import noteValidator from "@/models/validators/notes"
import notesRepository from "@/repositories/notes"

export const getNotes = async (
	data: StaticRequestSchemaTypes<
		typeof noteValidator.getNotes
	>["querystring"],
) => await notesRepository.getNotes(data)

export const createNote = async (
	data: StaticRequestSchemaTypes<typeof noteValidator.createNote>["body"],
) => await notesRepository.createNote(data)

export default {
	createNote,
	getNotes,
}
