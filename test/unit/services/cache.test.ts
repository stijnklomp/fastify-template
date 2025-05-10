import { createClient, RedisClientType } from "redis"

import { runAsyncHandlers } from "@/helper"
import cacheService from "@/src/services/cache"
import { logger } from "@/src/common/logger"

jest.mock("redis", () => ({
	createClient: jest.fn(),
}))

const mockedCreateClient = createClient as jest.Mock<RedisClientType>

describe("Cache service", () => {
	afterEach(() => {
		jest.clearAllMocks()
		jest.restoreAllMocks()
	})

	describe("init", () => {
		const mockConnect = jest.fn().mockResolvedValue("connected-client")
		const mockOn = jest.fn()
		const mockClient = {
			connect: mockConnect,
			on: mockOn,
		} as unknown as RedisClientType

		beforeEach(() => {
			mockedCreateClient.mockImplementation(() => mockClient)
			// (createClient as jest.Mock).mockReturnValue(mockClient)
		})

		it("should initialize and connect the cache client", async () => {
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

		it("should log info on successful connect", async () => {
			type ConnectCallback = () => void
			let connectHandler: ConnectCallback | undefined

			mockOn.mockImplementation((event, cb: ConnectCallback) => {
				if (event === "connect") connectHandler = cb
			})

			await cacheService.init()
			connectHandler?.()

			expect(logger.info).toHaveBeenCalledWith(
				expect.stringContaining("Cache client connected on port"),
			)
		})

		it("should log and exit on connection error", () => {
			type ErrorCallback = (err: Error) => void
			let errorHandler: ErrorCallback | undefined

			mockOn.mockImplementation((event, cb: ErrorCallback) => {
				if (event === "error") errorHandler = cb
			})
			jest.spyOn(process, "exit").mockImplementation(
				() => undefined as never,
			)

			void cacheService.init()

			errorHandler?.(new Error("Connection failed"))

			expect(logger.error).toHaveBeenCalledWith(
				"Cache client error",
				expect.any(Error),
			)
			expect(process.exit).toHaveBeenCalledWith(1)
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
