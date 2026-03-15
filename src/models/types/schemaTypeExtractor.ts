import { type FastifyRequest, type FastifyReply } from "fastify"
import { type Static, type TSchema } from "@sinclair/typebox"

/**
 * Generic helper: infer request/response types from a "@sinclair/typebox" schema
 */
export type RouteHandler<
	S extends {
		querystring?: TSchema
		body?: TSchema
		params?: TSchema
		headers?: TSchema
		response?: Record<number, TSchema | { $ref: string }>
	},
> = (
	req: FastifyRequest<{
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Querystring: S["querystring"] extends TSchema
			? Static<S["querystring"]>
			: undefined
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Body: S["body"] extends TSchema ? Static<S["body"]> : undefined
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Params: S["params"] extends TSchema ? Static<S["params"]> : undefined
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Headers: S["headers"] extends TSchema ? Static<S["headers"]> : undefined
	}>,
	res: FastifyReply,
) => Promise<void>
