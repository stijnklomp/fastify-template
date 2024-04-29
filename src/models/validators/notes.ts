import { Type } from "@sinclair/typebox"

export const getNotesValidationSchema = {
	querystring: Type.Object({
		page: Type.Number(),
		perPAge: Type.Number({ maximum: 100 }),
	}),
}

export const createNoteValidationSchema = {
	body: Type.Object({
		owner: Type.String({ maxLength: 100 }),
		note: Type.String({ maxLength: 300 }),
	}),
}
