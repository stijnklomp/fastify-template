import { prisma } from "@/src/common/prisma"
import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import notesValidator from "@/src/models/validators/notes"

export const getNotes = async (
	data: StaticRequestSchemaTypes<
		typeof notesValidator.getNotes
	>["querystring"],
) =>
	prisma.note.findMany({
		skip: data.page - 1,
		take: data.perPage,
	})

export const createNote = async (
	data: StaticRequestSchemaTypes<typeof notesValidator.createNote>["body"],
) =>
	prisma.note.create({
		data,
	})

export default {
	createNote,
	getNotes,
}
