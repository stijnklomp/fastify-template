import { describe, test, afterEach, expect, mock } from "bun:test"

import { startApp } from "@/helper"
import { prismaMock } from "@/context"

const mockCache = {
	init: mock(),
}
const mockRabbitMQ = mock()

await mock.module("@/infrastructure/cache", () => ({
	cacheClient: mockCache,
}))
await mock.module("@/infrastructure/rabbitMQ", () => ({
	init: mockRabbitMQ,
}))

describe("server", () => {
	afterEach(() => {
		mock.clearAllMocks()
	})

	test("should respond with 2xx on healthy state", async () => {
		const app = await startApp()

		const response = await app.inject({
			method: "GET",
			url: "/healthz",
		})

		expect(mockCache.init).toHaveBeenCalled()
		expect(mockRabbitMQ).toHaveBeenCalled()

		expect(response.statusCode).toEqual(204)
		expect(response.payload).toBe("")

		await app.close()
	})

	test("should respond with 2xx on ready state", async () => {
		prismaMock.$connect.mockResolvedValue()

		const app = await startApp()

		const response = await app.inject({
			method: "GET",
			url: "/readyz",
		})

		expect(mockCache.init).toHaveBeenCalled()
		expect(mockRabbitMQ).toHaveBeenCalled()

		expect(response.statusCode).toEqual(204)
		expect(response.payload).toBe("")

		await app.close()
	})
})
