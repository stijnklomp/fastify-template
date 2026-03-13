import { Type } from "@sinclair/typebox"

const noteBase = Type.Object({
	note: Type.String({ maxLength: 300 }),
	owner: Type.String({ maxLength: 100 }),
})

const noteSchema = Type.Intersect([
	noteBase,
	Type.Object({
		createdAt: Type.String({ format: "date-time" }),
		id: Type.Number(),
		updatedAt: Type.String({ format: "date-time" }),
	}),
])

export const getNotesSchema = {
	querystring: Type.Object({
		page: Type.Number({ minimum: 1 }),
		perPage: Type.Number({ maximum: 100 }),
	}),
	response: {
		200: Type.Object({
			notes: Type.Array(noteSchema),
		}),
		500: { $ref: "HttpError" },
	},
}

export const createNoteSchema = {
	body: noteBase,
	response: {
		201: Type.Object({
			message: Type.String(),
			note: noteSchema,
		}),
		500: { $ref: "HttpError" },
	},
}
