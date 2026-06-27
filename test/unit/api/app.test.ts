import { describe, test, afterEach, expect, mock } from "bun:test"
import { Type } from "@sinclair/typebox"

import { loggerMocks } from "../../setup"
import { buildApp } from "@/api/app"

describe("error handler", () => {
	afterEach(() => {
		mock.clearAllMocks()
	})

	test("should log warn and return 400 on validation error", async () => {
		const app = buildApp()

		void app.post(
			"/test",
			{
				schema: {
					body: Type.Object({
						name: Type.String(),
					}),
				},
			},
			() => ({ ok: true }),
		)

		const res = await app.inject({
			method: "POST",
			payload: {},
			url: "/test",
		})

		expect(res.statusCode).toBe(400)
		const body = JSON.parse(res.body) as Record<string, unknown>
		expect(body).toHaveProperty("error")
		expect(loggerMocks.warn).toHaveBeenCalledWith(
			expect.anything(),
			"Request validation failed",
		)

		await app.close()
	})

	test("should log error and return 500 on unhandled error", async () => {
		const app = buildApp()

		void app.get("/crash", () => {
			throw new Error("Something went wrong")
		})

		const res = await app.inject({
			method: "GET",
			url: "/crash",
		})

		expect(res.statusCode).toBe(500)
		const body = JSON.parse(res.body) as Record<string, unknown>
		expect(body).toEqual({ error: "Something went wrong" })
		expect(loggerMocks.error).toHaveBeenCalledWith(
			expect.objectContaining({ message: "Something went wrong" }),
			"Unhandled error",
		)

		await app.close()
	})
})
