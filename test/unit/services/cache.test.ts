import { createClient, RedisClientType } from "redis"

import cacheService from "@/src/services/cache"
import { logger } from "@/src/common/logger"

jest.mock("redis", () => ({
	createClient: jest.fn(),
}))

const mockedCreateClient = createClient as jest.Mock<RedisClientType>

describe("Cache service", () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("init", () => {
		const mockClient = {
			connect: jest.fn().mockResolvedValue("connected-client"),
			on: jest.fn(),
		} as unknown as RedisClientType

		beforeEach(() => {
			jest.clearAllMocks()

			mockedCreateClient.mockImplementation(() => mockClient)
			// (createClient as jest.Mock).mockReturnValue(mockClient)
		})

		it("should initialize and connect the redis client", async () => {
			const client = await cacheService.init()

			expect(createClient).toHaveBeenCalledWith({
				password: process.env.CACHE_PASSWORD ?? "",
				socket: {
					host: process.env.CACHE_HOST ?? "localhost",
					port: Number(process.env.CACHE_PORT ?? "6379"),
				},
			})

			expect(mockClient.on).toHaveBeenCalledWith(
				"error",
				expect.any(Function),
			)
			expect(mockClient.on).toHaveBeenCalledWith(
				"connect",
				expect.any(Function),
			)
			expect(mockClient.connect).toHaveBeenCalled()
			expect(client).toBe("connected-client")
		})

		it("should log and exit on connection error", () => {
			const mockExit = jest
				.spyOn(process, "exit")
				.mockImplementation(() => {
					throw new Error("process.exit called")
				})

			let errorHandler: (err: Error) => void = () => {}

			mockClient.on.mockImplementation((event, cb) => {
				if (event === "error") errorHandler = cb
			})

			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			cacheService.init()
			const testError = new Error("Connection failed")
			expect(() => {
				errorHandler(testError)
			}).toThrow("process.exit called")

			expect(logger.error).toHaveBeenCalledWith(
				"Cache client error",
				testError,
			)
			expect(mockExit).toHaveBeenCalledWith(1)
			mockExit.mockRestore()
		})

		it("should log info on successful connect", async () => {
			let connectHandler: () => void = () => {}

			mockClient.on.mockImplementation((event, cb) => {
				if (event === "connect") connectHandler = cb
			})

			await cacheService.init()
			connectHandler()

			expect(logger.info).toHaveBeenCalledWith(
				expect.stringContaining("Cache client connected on port"),
			)
		})
	})

	// const mockedValue = {
	// 	test: "value",
	// }
	// const mock = jest.fn().mockReturnValue(mockedValue)

	// describe("set", () => {
	// 	it("should set in cache", async () => {
	// 		mockedCacheAdapterGetPrimary.mockImplementation(
	// 			jest.fn().mockReturnValue({
	// 				set: mock,
	// 			}),
	// 		)
	// 		const result = await cacheService.set(
	// 			Object.keys(mockedValue)[0],
	// 			Object.values(mockedValue)[0],
	// 		)

	// 		expect(mock).toHaveBeenCalledTimes(1)
	// 		expect(result).toStrictEqual(mockedValue)
	// 	})
	// })

	// describe("get", () => {
	// 	it("should get from cache", async () => {
	// 		mockedCacheAdapterGetPrimary.mockImplementation(
	// 			jest.fn().mockReturnValue({
	// 				get: mock,
	// 			}),
	// 		)
	// 		const result = await cacheService.get(Object.keys(mockedValue)[0])

	// 		expect(mock).toHaveBeenCalledTimes(1)
	// 		expect(result).toStrictEqual(mockedValue)
	// 	})
	// })

	// describe("del", () => {
	// 	it("should delete from cache", async () => {
	// 		mockedCacheAdapterGetPrimary.mockImplementation(
	// 			jest.fn().mockReturnValue({
	// 				del: mock,
	// 			}),
	// 		)
	// 		const result = await cacheService.del(Object.keys(mockedValue)[0])

	// 		expect(mock).toHaveBeenCalledTimes(1)
	// 		expect(result).toStrictEqual(mockedValue)
	// 	})
	// })
})
