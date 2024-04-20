export const createNoteValidationSchema = Joi.object().keys({
	owner: Joi.string().max(100).required().messages({
		"string.max": "Owner cannot exceed 100 characters",
		"any.required": "Owner is required",
	}),
	note: Joi.string().max(300).required().messages({
		"string.max": "Note cannot exceed 300 characters",
		"any.required": "Note is required",
	}),
})

export const getNotesValidationSchema = Joi.object().keys({
	page: Joi.number().required(),
	perPage: Joi.number().required().max(100).messages({
		"number.max": "Maximum Per Page is 100",
		"any.required": "Per Page is required",
	}),
})
