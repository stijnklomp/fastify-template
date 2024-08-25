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

	it.only("should get notes", async () => {
		prismaMock.note.findMany.mockResolvedValue([noteDb])

		const notes = await noteRepository.getNotes(data)

		expect(notes).toStrictEqual([noteDb])
	})
})

describe("createNote", () => {
	const data: StaticRequestSchemaTypes<
		typeof notesValidator.createNote
	>["body"] = {
		owner: "Test user",
		note: "This is a test note",
	}

	it("should create note", async () => {
		prismaMock.note.create.mockResolvedValue(noteDb)

		const note = await noteRepository.createNote(data)

		expect(note).toStrictEqual(noteDb)
	})
})
