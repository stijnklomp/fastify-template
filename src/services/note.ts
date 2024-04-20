import { CreateNote, GetNote } from "@/serializers/notes"
import { createNoteRepository, getNotesRepository } from "@/repositories/notes"

export const createNoteService = async (data: CreateNote) =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	await createNoteRepository(data)

export const getNotesService = async (data: GetNote) =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	await getNotesRepository(data)
