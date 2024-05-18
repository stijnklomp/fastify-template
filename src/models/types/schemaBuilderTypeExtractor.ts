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
		Body: RequestProperty<T, "body">
		Querystring: RequestProperty<T, "querystring">
		Params: RequestProperty<T, "params">
		Headers: RequestProperty<T, "headers">
	}>
