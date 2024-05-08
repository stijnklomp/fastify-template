import { FastifyInstance } from "fastify"

import { build } from "../helper"

describe("server", () => {
	let app: FastifyInstance

	beforeAll(async () => {
		app = await build()
	})

	afterAll(async () => {
		await app.close()
	})

	it("should start the server without errors", async () => {
		const res = await app.inject({
			method: "GET",
			url: "/health",
		})
		expect(JSON.parse(res.payload)).toEqual({})
		// assert.deepStrictEqual(JSON.parse(res.payload), { root: true })
		expect(res.statusCode).toEqual(200)
	})
})
