import { FastifyInstance } from "fastify"

import { prismaMock } from "@/context"
import { build } from "@/helper"

describe("server", () => {
	const initServer = build()
	let app: FastifyInstance

	beforeAll(() => {
		app = initServer()
	})

	it("should start the server without errors", async () => {
		prismaMock.$connect.mockResolvedValue()

		const res = await app.inject({
			method: "GET",
			url: "/health",
		})

		expect(res.statusCode).toEqual(204)
		expect(res.payload).toBe("")
	})
})
