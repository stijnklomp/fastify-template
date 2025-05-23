import { prismaMock } from "@/context"
import { StaticRequestSchemaTypes } from "@/types/schemaBuilderTypeExtractor"
import notesValidator from "@/validators/notes"
import noteRepository from "@/repositories/notes"
import { noteDb } from "@/fixtures/note.fixture"

describe("getNotes", () => {
	const data: StaticRequestSchemaTypes<
		typeof notesValidator.getNotes
	>["querystring"] = {
		page: 1,
		perPage: 10,
	}

	it("should get notes", async () => {
		jest.spyOn(prismaMock.note, "findMany").mockResolvedValue([noteDb])

		const notes = await noteRepository.getNotes(data)

		expect(notes).toStrictEqual([noteDb])
	})
})

describe("createNote", () => {
	const data: StaticRequestSchemaTypes<
		typeof notesValidator.createNote
	>["body"] = {
		note: "This is a test note",
		owner: "Test user",
	}

	it("should create note", async () => {
		jest.spyOn(prismaMock.note, "create").mockResolvedValue(noteDb)

		const note = await noteRepository.createNote(data)

		expect(note).toStrictEqual(noteDb)
	})
})
