import { Note } from "@prisma/client"

export const noteDb: Note = {
	id: 1,
	owner: "Test user",
	note: "This is a test note",
	createdAt: new Date(),
	updatedAt: new Date(),
}
