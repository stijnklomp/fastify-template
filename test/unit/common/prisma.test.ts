import { describe, test, afterEach, expect, mock } from "bun:test"

import {
	prismaPgMock,
	prismaClientMock,
	realCreatePrismaClient,
} from "@/context"

describe("server", () => {
	afterEach(() => {
		mock.clearAllMocks()
	})

	test("should initialize and connect to database", () => {
		const results = realCreatePrismaClient()

		expect(prismaClientMock).toHaveBeenCalledWith({
			adapter: process.env.DATABASE_URL,
		})
		expect(prismaPgMock).toHaveBeenCalledWith({
			connectionString: process.env.DATABASE_URL,
		})
		expect(results).toBe(realCreatePrismaClient())
	})

	test("should throw on undefined database URL", () => {
		const originalDatabaseUrlEnv = process.env.DATABASE_URL
		process.env.DATABASE_URL = undefined
		expect(() => realCreatePrismaClient()).toThrowError(
			"DATABASE_URL environment variable is not defined",
		)

		expect(prismaClientMock).not.toHaveBeenCalled()
		expect(prismaPgMock).not.toHaveBeenCalled()

		process.env.DATABASE_URL = originalDatabaseUrlEnv
	})
})
