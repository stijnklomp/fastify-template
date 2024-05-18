import { prismaMock } from "../context"
import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import notesValidator from "@/validators/notes"
import { CREATE_NOTE_TYPE, GET_NOTE_TYPE } from "../../main/dto/request/note"
import noteRepository from "@/repositories/notes"
import prisma from "@/utils/prisma"
import { noteDb } from "@/fixtures/note.fixture"

jest.mock("../../main/utils/prisma", () => ({
	__esModule: true,
	default: prismaMock,
}))

const mockNoteFindMany = prisma.note.findMany as jest.MockedFunction<
	typeof prisma.note.findMany
>

// const mockNoteCreate = prisma.note.create as jest.MockedFunction<
// 	typeof prisma.note.create
// >
// const mockNoteCreate = jest.mocked<typeof prisma.note.create>
const mockNoteCreate = jest.mocked(prisma.note.create)

afterEach(() => {
	jest.clearAllMocks()
})

describe("getNotes", () => {
	const data: StaticRequestSchemaTypes<
		typeof notesValidator.getNotes
	>["querystring"] = {
		page: 1,
		perPage: 10,
	}

	it("should get notes", async () => {
		mockNoteFindMany.mockReturnValue([noteDb])

		const notes = await noteRepository.getNotes(data)

		expect(notes).toStrictEqual([noteDb])
	})
})

describe("createNote", () => {
	const data: StaticRequestSchemaTypes<
		typeof notesValidator.createNote
	>["body"] = {
		owner: "Test User",
		note: "This is a test note",
	}

	it("should create note", async () => {
		mockNoteCreate.mockReturnValue(noteDb)

		const note = await noteRepository.createNote(data)

		expect(note).toStrictEqual(noteDb)
	})
})
