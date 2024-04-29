import { CreateNote, GetNote } from "@/serializers/notes"
import { getNotesRepository, createNoteRepository } from "@/repositories/notes"

export const getNotesService = async (data: GetNote) =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	await getNotesRepository(data)

export const createNoteService = async (data: CreateNote) =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	await createNoteRepository(data)

export default {
	getNotesService,
	createNoteService,
}
