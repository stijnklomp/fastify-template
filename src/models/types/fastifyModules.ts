import { FastifyRequest } from "fastify"
import { Static } from "@sinclair/typebox"

export type RequestSchemaTypes<
	T extends {
		body?: any
		querystring?: any
		params?: any
		headers?: any
	},
> = FastifyRequest<{
	Body: Static<T["body"]>
	Querystring: Static<T["querystring"]>
	Params: Static<T["params"]>
	Headers: Static<T["headers"]>
}>
