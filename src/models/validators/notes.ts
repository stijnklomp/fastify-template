import { Type } from "@sinclair/typebox"

export const getNotes = {
	querystring: Type.Object({
		page: Type.Number(),
		perPage: Type.Number({ maximum: 100 }),
	}),
}

export const createNote = {
	body: Type.Object({
		owner: Type.String({ maxLength: 100 }),
		note: Type.String({ maxLength: 300 }),
	}),
}

export default {
	getNotes,
	createNote,
}
