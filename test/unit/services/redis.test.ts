import redisAdapter from "@/adapters/redis"

import redisService from "@/services/redis"

// import { RedisModules } from "@redis/client/dist/lib/commands"
// import { createClient, RedisClientType } from "redis"
// type Test = RedisClientType<RedisModules, any, any>

// import { mock } from "jest-mock-extended"

// type Test = ReturnType<typeof redisAdapter.getPrimary>

const mockedDependency = redisAdapter.getPrimary as jest.Mock<
	ReturnType<typeof redisAdapter.getPrimary>
>

jest.mock("@/adapters/redis", () => ({
	getPrimary: jest.fn(),
}))

describe("Redis Service Tests", () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("getClient", () => {
		it("should get redis client", () => {
			expect(redisAdapter.getPrimary).toHaveBeenCalled()
		})
	})

	describe("set", () => {
		it.only("should set in redis", async () => {
			// const setMock = jest
			// 	.fn<ReturnType<typeof redisAdapter.getPrimary>["set"], []>()
			// 	.mockReturnValue({
			// 		test: "value",
			// 	})
			const setMock = jest.fn().mockReturnValue({
				test: "value",
			})
			mockedDependency.mockImplementation(
				jest.fn().mockReturnValue({
					set: setMock,
				}),
			)
			const set = await redisService.set("test", "value")

			expect(setMock).toHaveBeenCalledTimes(1)
			expect(set).toStrictEqual({
				test: "value",
			})
		})
	})

	describe("get", () => {
		it("should get from redis", async () => {
			const mockGetRedisClient = jest
				.spyOn(redisService, "getClient")
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
