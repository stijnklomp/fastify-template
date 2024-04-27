import S from "fluent-json-schema"

export const createNoteValidationSchema = {
	body: S.object()
		.prop("owner", S.string().maxLength(100).required())
		.prop("note", S.string().maxLength(300).required()),
}

export const getNotesValidationSchema = {
	query: S.object()
		.prop("page", S.number().required())
		.prop("perPage", S.number().maximum(100).required()),
}
