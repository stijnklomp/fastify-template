import { Note } from "@prisma/client"

export const noteDb: Note = {
	createdAt: new Date(),
	id: 1,
	note: "This is a test note",
	owner: "Test user",
	updatedAt: new Date(),
}
