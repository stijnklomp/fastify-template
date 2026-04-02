import { describe, test, afterEach, expect, mock } from "bun:test"

import { loggerMocks } from "test/setup"
import { listenMock } from "@/context"
import {
	startApp,
	processExitMock,
	restoreProcessExitMock,
} from "@/utils/process"

const writeFileSyncMock = mock()
const mockCacheClient = mock()
const mockQueueClient = mock()

await mock.module("node:fs", () => ({
	writeFileSync: writeFileSyncMock,
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
		const app = await startApp({
			writeOpenapi: true,
		})

		expect(mockCacheClient).toHaveBeenCalled()
		expect(mockQueueClient).toHaveBeenCalled()
		expect(listenMock).toHaveBeenCalledWith({
			host: "0.0.0.0",
			port: 3000,
		})
		expect(loggerMocks.info).toHaveBeenCalledWith(
			"Server listening on port 3000",
		)

		await app.close()
	})

	test("should write OpenAPI spec on non-production", async () => {
		const originalNodeEnv = process.env.NODE_ENV
		process.env.NODE_ENV = "development"

		const app = await startApp({})

		expect(listenMock).toHaveBeenCalledWith({
			host: "0.0.0.0",
			port: 3000,
		})
		expect(writeFileSyncMock).toHaveBeenCalled()
		const args = writeFileSyncMock.mock.calls[0] as unknown[]
		expect(args[0]).toBe("./openapi.yaml")
		expect(typeof args[1]).toBe("string")
		expect(args[1]).toMatch(/^[\s\S]*:.*/m) // Check for key:value YAML format

		await app.close()

		if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv
	})

	test("should not write OpenAPI spec on production", async () => {
		const originalNodeEnv = process.env.NODE_ENV
		process.env.NODE_ENV = "production"

		const app = await startApp({})

		expect(mockCacheClient).toHaveBeenCalled()
		expect(mockQueueClient).toHaveBeenCalled()
		expect(listenMock).toHaveBeenCalledWith({
			host: "0.0.0.0",
			port: 3000,
		})
		expect(writeFileSyncMock).not.toHaveBeenCalled()

		await app.close()

		if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv
	})

	test("should exit on error", async () => {
		const mockProcessExit = processExitMock()
		const error = new Error("Cache username or password invalid")
		mockCacheClient.mockRejectedValue(error)

		await startApp()

		expect(mockCacheClient).toHaveBeenCalled()
		expect(listenMock).not.toHaveBeenCalled()
		expect(loggerMocks.error).toHaveBeenCalledWith(error)
		expect(mockProcessExit).toHaveBeenCalled()

		restoreProcessExitMock()
		mockCacheClient.mockRestore()
	})
})
