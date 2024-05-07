import { expect, jest, describe, it, afterEach } from "@jest/globals"
import redisAdapter from "@/adapters/redis"

import redisService from "@/services/redis"

type RedisClientFunction = (...args: any[]) => any

type MockedAdaptersFunction = jest.Mock<RedisClientFunction>

jest.mock("@/adapters/redis", () => {
	// Return an object with the expected structure
	return {
		getPrimary: jest.fn(),
	}
})

const mockedAdapters =
	redisAdapter.getPrimary as unknown as MockedAdaptersFunction

describe("Redis Service Tests", () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("getClient", () => {
		it("should get redis client successfully", () => {
			mockedAdapters.mockReturnValue({})

			const client = redisService.getClient()

			expect(client).toStrictEqual({})
		})
	})

	describe("set", () => {
		it("should set in redis", async () => {
			const mockGetRedisClient = jest
				.spyOn(redisService, "getClient")
				.mockReturnValue({
					set: jest.fn().mockReturnValue({
						test: "value",
					}),
				} as any)

			const set = await redisService.set("test", "value")

			expect(mockGetRedisClient).toHaveBeenCalledTimes(1)
			expect(set).toStrictEqual({
				test: "value",
			})
		})
	})

	describe("get", () => {
		it("should get from redis", async () => {
			const mockGetRedisClient = jest
				.spyOn(redisService, "getClient")
				.mockReturnValue({
					get: jest.fn().mockReturnValue({
						test: "value",
					}),
				} as any)

			const set = await redisService.get("test")

			expect(mockGetRedisClient).toHaveBeenCalledTimes(1)
			expect(set).toStrictEqual({
				test: "value",
			})
		})
	})

	describe("del", () => {
		it("should delete from redis", async () => {
			const mockGetRedisClient = jest
				.spyOn(redisService, "getClient")
				.mockReturnValue({
					del: jest.fn().mockReturnValue({
						test: "value",
					}),
				} as any)

			const set = await redisService.del("test")

			expect(mockGetRedisClient).toHaveBeenCalledTimes(1)
			expect(set).toStrictEqual({
				test: "value",
			})
		})
	})
})
