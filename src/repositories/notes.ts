import { CreateNote, GetNote } from "/@serializers/notes"
import { prisma } from "@/utils/prisma"

export const createNoteRepository = async (data: CreateNote) =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	prisma.note.create({
		data,
	}) as Promise<any>

export const getNotesRepository = async (data: GetNote) =>
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	prisma.note.findMany({
		skip: data.page - 1,
		take: data.perPage,
	}) as Promise<any>
