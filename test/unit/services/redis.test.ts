import redisAdapter from "@/adapters/redis"

import redisService from "@/services/redis"

// import { RedisModules } from "@redis/client/dist/lib/commands"
// import { createClient, RedisClientType } from "redis"
// type Test = RedisClientType<RedisModules, any, any>

// import { mock } from "jest-mock-extended"

// type Test = ReturnType<typeof redisAdapter.getPrimary>

const mockedRedisAdapterGetPrimary = redisAdapter.getPrimary as jest.Mock<
	ReturnType<typeof redisAdapter.getPrimary>
>

jest.mock("@/adapters/redis", () => ({
	getPrimary: jest.fn(),
}))

describe("Redis service", () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("getClient", () => {
		it("should get redis client", () => {
			redisService.getClient()
			expect(mockedRedisAdapterGetPrimary).toHaveBeenCalled()
		})
	})

	const mockedValue = {
		test: "value",
	}
	const mock = jest.fn().mockReturnValue(mockedValue)

	describe("set", () => {
		it("should set in redis", async () => {
			mockedRedisAdapterGetPrimary.mockImplementation(
				jest.fn().mockReturnValue({
					set: mock,
				}),
			)
			const result = await redisService.set(
				Object.keys(mockedValue)[0],
				Object.values(mockedValue)[0],
			)

			expect(mock).toHaveBeenCalledTimes(1)
			expect(result).toStrictEqual(mockedValue)
		})
	})

	describe("get", () => {
		it("should get from redis", async () => {
			mockedRedisAdapterGetPrimary.mockImplementation(
				jest.fn().mockReturnValue({
					get: mock,
				}),
			)
			const result = await redisService.get(Object.keys(mockedValue)[0])

			expect(mock).toHaveBeenCalledTimes(1)
			expect(result).toStrictEqual(mockedValue)
		})
	})

	describe("del", () => {
		it("should delete from redis", async () => {
			mockedRedisAdapterGetPrimary.mockImplementation(
				jest.fn().mockReturnValue({
					del: mock,
				}),
			)
			const result = await redisService.del(Object.keys(mockedValue)[0])

			expect(mock).toHaveBeenCalledTimes(1)
			expect(result).toStrictEqual(mockedValue)
		})
	})
})
