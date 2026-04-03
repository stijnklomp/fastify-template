import { describe, test, beforeEach, afterEach, expect, mock } from "bun:test"

import { newPrismaMock } from "@/context"
import { createMockRequest, createMockResponse } from "@/utils/http"
import { livenessHandler, readinessHandler } from "@/controllers/health"
import { loggerMocks } from "test/setup"

describe("Cache service", () => {
	beforeEach(() => {
		newPrismaMock.$connect.mockClear()
		newPrismaMock.$disconnect.mockClear()
	})

	afterEach(() => {
		mock.clearAllMocks()
	})

	describe("livenessHandler", () => {
		test("should respond with a 204 code", async () => {
			const req = createMockRequest()
			const { reply, statusCode } = createMockResponse()

			await livenessHandler(req, reply)

			expect(statusCode()).toBe(204)
		})
	})

	describe("readinessHandler", () => {
		test("should respond with a 204 code", async () => {
			const req = createMockRequest()
			const { reply, statusCode } = createMockResponse()

			await readinessHandler(req, reply)

			expect(newPrismaMock.$connect).toHaveBeenCalled()
			expect(loggerMocks.info).toHaveBeenCalledWith(
				"Database connection healthy",
			)
			expect(newPrismaMock.$disconnect).toHaveBeenCalled()
			expect(statusCode()).toBe(204)
		})

		test("should respond with a 503 code", async () => {
			const error = new Error("Database username or password invalid")
			newPrismaMock.$connect.mockRejectedValue(error)

			const req = createMockRequest()
			const { reply, statusCode, payload } = createMockResponse()

			await readinessHandler(req, reply)

			expect(newPrismaMock.$connect).toHaveBeenCalled()
			expect(newPrismaMock.$disconnect).not.toHaveBeenCalled()
			expect(loggerMocks.error).toHaveBeenCalledWith(error)
			expect(statusCode()).toBe(503)
			expect(payload()).toEqual({
				message: "Internal Server Error",
			})
		})
	})
})
