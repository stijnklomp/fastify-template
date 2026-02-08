import { mock, describe, afterEach, test, expect } from "bun:test"

import { start } from "@/src/app"

const mockCache = mock()
const mockRabbitMQ = mock()

await mock.module("@/common/prisma", () => ({
	prisma: mock(),
}))
await mock.module("@/infrastructure/cache", () => ({
	init: mockCache,
}))
await mock.module("@/infrastructure/rabbitMQ", () => ({
	init: mockRabbitMQ,
}))

describe("server", () => {
	afterEach(() => {
		mock.clearAllMocks()
	})

	test.only("should start the server without errors", async () => {
		const response = await start()

		expect(mockCache).toHaveBeenCalled()
		expect(mockRabbitMQ).toHaveBeenCalled()

		await response.close()
	})

	// test("should respond with 2xx on healthy state", async () => {
	// 	const response = await app.inject({
	// 		method: "GET",
	// 		url: "/healthz",
	// 	})

	// 	expect(response.statusCode).toEqual(200)
	// 	expect(response.payload).toBe("")
	// })

	// test("should respond with 2xx on ready state", async () => {
	// 	jest.mocked(mockPrisma.$connect).mockResolvedValue()

	// 	const response = await app.inject({
	// 		method: "GET",
	// 		url: "/readyz",
	// 	})

	// 	expect(response.statusCode).toEqual(204)
	// 	expect(response.payload).toBe("")
	// 	expect(mockPrisma.$connect).toHaveBeenCalled()
	// 	expect(mockPrisma.$disconnect).toHaveBeenCalled()
	// })
})
