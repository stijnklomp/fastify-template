import { type Static } from "@sinclair/typebox"

import { prismaClient } from "@/common/prisma"
import { getNotesSchema, createNoteSchema } from "@/models/schemas/notes"

export const getNotesRepo = async (
	data: Static<typeof getNotesSchema.querystring>,
) =>
	prismaClient().note.findMany({
		skip: data.page - 1,
		take: data.perPage,
	})

export const createNoteRepo = async (
	data: Static<typeof createNoteSchema.body>,
) =>
	prismaClient().note.create({
		data,
	})
