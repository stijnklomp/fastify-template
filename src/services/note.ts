import { CREATE_NOTE_TYPE, GET_NOTE_TYPE } from "../dto/request/note"
import { noteRepository } from "../repositories/"

export const createNote = async (data: CREATE_NOTE_TYPE) =>
	await noteRepository.createNote(data)

export const getNotes = async (data: GET_NOTE_TYPE) =>
	await noteRepository.getNotes(data)
