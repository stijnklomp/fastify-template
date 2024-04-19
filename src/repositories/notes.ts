import { CREATE_NOTE_TYPE, GET_NOTE_TYPE } from "/@types/note"
import prisma from "../utils/prisma"

export const createNote = async (data: CREATE_NOTE_TYPE) =>
	prisma.note.create({
		data,
	})

export const getNotes = async (data: GET_NOTE_TYPE) =>
	prisma.note.findMany({
		skip: data.page - 1,
		take: data.perPage,
	})
