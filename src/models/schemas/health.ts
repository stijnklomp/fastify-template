import { Type } from "@sinclair/typebox"

export const livenessSchema = {
	response: {
		204: Type.Null(),
	},
}

export const readinessSchema = {
	response: {
		204: Type.Null(),
		503: { $ref: "HttpError" },
	},
}
