import { mock } from "bun:test"
import type { FastifyReply, FastifyRequest } from "fastify"

type MockRequestOptions = {
	body?: unknown
	params?: Record<string, unknown>
	query?: Record<string, unknown>
	headers?: Record<string, string | string[]>
	method?: string
	url?: string
	ip?: string
}

export const createMockRequest = (
	opts: MockRequestOptions = {},
): FastifyRequest => {
	const {
		body,
		params = {},
		query = {},
		headers = {},
		method = "GET",
		url = "/",
		ip = "127.0.0.1",
	} = opts

	const request: Partial<FastifyRequest> = {
		body,
		headers,
		ip,
		method,
		params,
		query,
		url,
	}

	return request as FastifyRequest
}

export const createMockResponse = () => {
	let statusCode: number | undefined
	let payload: unknown

	const response = {
		code: mock((code: number) => {
			statusCode = code

			return response
		}),
		getHeader: mock((_key: string) => {
			return undefined
		}),
		header: mock(() => {
			return response
		}),
		send: mock((data?: unknown) => {
			payload = data

			return response
		}),
	}

	return {
		payload: () => payload,
		reply: response as unknown as FastifyReply,
		statusCode: () => statusCode,
	}
}
