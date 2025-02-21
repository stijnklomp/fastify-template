import { FastifyRequest } from "fastify"
import { Static, TSchema } from "@sinclair/typebox"

type RequestParams = {
	body?: TSchema
	querystring?: TSchema
	params?: TSchema
	headers?: TSchema
}

type RequestProperty<
	T extends RequestParams,
	K extends keyof T,
> = T[K] extends infer I extends TSchema ? Static<I> : undefined

export type StaticRequestSchemaTypes<T extends RequestParams> = {
	[K in keyof T]: RequestProperty<T, K>
}

export type FastifyRequestSchemaTypes<T extends RequestParams> =
	FastifyRequest<{
		// Disable naming convention rule because `@sinclair/typebox` uses Pascal case
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Body: RequestProperty<T, "body">
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Querystring: RequestProperty<T, "querystring">
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Params: RequestProperty<T, "params">
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Headers: RequestProperty<T, "headers">
	}>
