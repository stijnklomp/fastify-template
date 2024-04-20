import { createNote, getNote } from "@/types/notes"
import {
	createNote as repoCreateNote,
	getNotes as repoGetNotes,
} from "@/repositories"

export const createNote = async (data: createNote) => await repoCreateNote(data)

export const getNotes = async (data: getNote) => await repoGetNotes(data)
