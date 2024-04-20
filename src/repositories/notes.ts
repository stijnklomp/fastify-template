import { CreateNote, GetNote } from "/@types"
import { prisma } from "@/utils"

export const createNote = async (data: CreateNote) =>
	prisma.note.create({
		data,
	})

export const getNotes = async (data: GetNote) =>
	prisma.note.findMany({
		skip: data.page - 1,
		take: data.perPage,
	})
