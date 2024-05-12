import { FastifyInstance } from "fastify"

import { build } from "@/helper"

jest.mock("@/utils/prisma", () => ({
	prisma: {
		$connect: jest.fn().mockResolvedValue({}),
		$disconnect: jest.fn(),
	},
}))

describe("server", () => {
	const initServer = build()
	let app: FastifyInstance

	beforeAll(() => {
		app = initServer()
	})

	it("should start the server without errors", async () => {
		const res = await app.inject({
			method: "GET",
			url: "/health",
		})
		expect(res.statusCode).toEqual(204)
		expect(res.payload).toBe("")
	})
})
