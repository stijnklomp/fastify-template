import { FastifyInstance } from "fastify"

import { build } from "@/helper"

// jest.mock("@/utils/prisma", jest.fn(() => ({
// 		prisma: jest.fn(() => ({
// 			$connect: jest.fn().mockResolvedValue({}),
// 			$disconnect: jest.fn(),
// 		}))
// 	})),
// )
jest.mock(
	"@/utils/prisma",
	jest.fn().mockReturnValue(() => ({
		prisma: jest.fn(() => ({
			$connect: jest.fn().mockResolvedValue({}),
			$disconnect: jest.fn(),
		})),
	})),
)

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
		expect(res.statusCode).toEqual(200)
		expect(JSON.parse(res.payload)).toEqual({})
		// assert.deepStrictEqual(JSON.parse(res.payload), { root: true })
	})
})
