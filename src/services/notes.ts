import { type Static } from "@sinclair/typebox"

import { getNotesSchema, createNoteSchema } from "@/models/schemas/notes"
import { getNotesRepo, createNoteRepo } from "@/repositories/notes"

export const getNotesService = async (
	data: Static<typeof getNotesSchema.querystring>,
) => await getNotesRepo(data)

export const createNoteService = async (
	data: Static<typeof createNoteSchema.body>,
) => await createNoteRepo(data)
