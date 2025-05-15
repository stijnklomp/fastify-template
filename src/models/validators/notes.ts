import { Type } from "@sinclair/typebox"

export const getNotes = {
	querystring: Type.Object({
		page: Type.Number({ minimum: 1 }),
		perPage: Type.Number({ maximum: 100 }),
	}),
}

export const createNote = {
	body: Type.Object({
		note: Type.String({ maxLength: 300 }),
		owner: Type.String({ maxLength: 100 }),
	}),
}

export default {
	createNote,
	getNotes,
}
