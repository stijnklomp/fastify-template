import { describe, test, afterEach, expect, mock } from "bun:test"

import { startApp } from "@/helper"

const mockCacheClient = mock()
const mockQueueClient = mock()

await mock.module("@/common/prisma", () => ({
	prisma: mock(),
}))
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

	test("should start the server without errors", async () => {
		const app = await startApp()

		expect(mockCacheClient).toHaveBeenCalled()
		expect(mockQueueClient).toHaveBeenCalled()

		expect(app.server.listening)

		await app.close()
	})
})
