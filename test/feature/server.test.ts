import { describe, test, afterEach, expect, mock } from "bun:test"

import { startApp } from "@/utils/process"
import { prismaMock } from "@/context"

const mockCacheClient = mock()
const mockQueueClient = mock()

await mock.module("@/infrastructure/cache", () => ({
	cacheClient: { init: mockCacheClient },
}))
await mock.module("@/infrastructure/rabbitMQ", () => ({
	queueClient: { init: mockQueueClient },
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

		expect(mockCacheClient).toHaveBeenCalled()
		expect(mockQueueClient).toHaveBeenCalled()

		expect(response.statusCode).toEqual(204)
		expect(response.payload).toBe("")

		await app.close()
	})

	test("should respond with 2xx on ready state", async () => {
		prismaMock.$connect = mock().mockResolvedValue(undefined)

		const app = await startApp()

		const response = await app.inject({
			method: "GET",
			url: "/readyz",
		})

		expect(mockCacheClient).toHaveBeenCalled()
		expect(mockQueueClient).toHaveBeenCalled()

		expect(response.statusCode).toEqual(204)
		expect(response.payload).toBe("")

		await app.close()
	})
})
