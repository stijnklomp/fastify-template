import { type Static } from "@sinclair/typebox"

import { prisma } from "@/common/prisma"
import { getNotesSchema, createNoteSchema } from "@/models/schemas/notes"

export const getNotesRepo = async (
	data: Static<typeof getNotesSchema.querystring>,
) =>
	prisma.note.findMany({
		skip: data.page - 1,
		take: data.perPage,
	})

export const createNoteRepo = async (
	data: Static<typeof createNoteSchema.body>,
) =>
	prisma.note.create({
		data,
	})
