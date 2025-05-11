import { createClient, RedisClientType } from "redis"

import cache from "@/services/cache"
import { logger } from "@/common/logger"

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
		const mockOn = jest.fn()
		const mockClient = {
			connect: jest.fn(),
			on: mockOn,
		} as unknown as RedisClientType

		beforeEach(() => {
			mockedCreateClient.mockImplementation(() => mockClient)
		})

		it("should initialize and connect the cache client", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedCache = await import("@/services/cache")
				await isolatedCache.init()

				expect(mockedCreateClient).toHaveBeenCalledWith({
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
			})
		})

		it("should use environment variables when connecting", async () => {})

		it("should not create new client if already initialized", async () => {
			await cache.init()
			await cache.init()

			expect(mockedCreateClient).toHaveBeenCalledOnce()
		})

		it("should log info on successful connect", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedCache = await import("@/services/cache")
				type ConnectCallback = () => void
				let connectHandler: ConnectCallback | undefined

				mockOn.mockImplementation((event, cb: ConnectCallback) => {
					if (event === "connect") connectHandler = cb
				})

				await isolatedCache.init()
				connectHandler?.()

				expect(mockClient.on).toHaveBeenCalledWith(
					"connect",
					expect.any(Function),
				)
				expect(mockClient.connect).toHaveBeenCalled()

				expect(logger.info).toHaveBeenCalledWith(
					expect.stringContaining("Cache client connected on port"),
				)
			})
		})

		it("should log and exit on connection error", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedCache = await import("@/services/cache")
				type ErrorCallback = (err: Error) => void
				let errorHandler: ErrorCallback | undefined

				mockOn.mockImplementation((event, cb: ErrorCallback) => {
					if (event === "error") errorHandler = cb
				})
				jest.spyOn(process, "exit").mockImplementation(
					() => undefined as never,
				)

				void isolatedCache.init()

				errorHandler?.(new Error("Connection failed"))

				expect(logger.error).toHaveBeenCalledWith(
					"Cache client error",
					expect.any(Error),
				)
				expect(process.exit).toHaveBeenCalledWith(1)
			})
		})

		it.each([
			["get", () => cache.get("")],
			["set", () => cache.set("", "")],
			["del", () => cache.del("")],
		])(
			`should not allow '%s' method without an initialized client`,
			async (_, fn) => {
				await expect(fn).rejects.toThrow(Error)
			},
		)
	})

	const mockedValue = {
		test: "value",
	}
	const mock = jest.fn().mockReturnValue(mockedValue)

	describe("set", () => {
		it("should set in cache", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedCache = await import("@/services/cache")
				const mockConnect = {
					set: jest.fn(),
				}
				const mockClient = {
					connect: () => mockConnect,
					on: jest.fn(),
					set: mock,
				} as unknown as RedisClientType
				mockedCreateClient.mockImplementation(() => mockClient)

				await isolatedCache.init()
				const result = await isolatedCache.set(
					Object.keys(mockedValue)[0],
					Object.values(mockedValue)[0],
				)

				expect(mock).toHaveBeenCalledTimes(1)
				expect(result).toStrictEqual(mockedValue)
			})
		})
	})

	describe("get", () => {
		it("should get from cache", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedCache = await import("@/services/cache")
				const mockConnect = {
					get: jest.fn(),
				}
				const mockClient = {
					connect: () => mockConnect,
					get: mock,
					on: jest.fn(),
				} as unknown as RedisClientType
				mockedCreateClient.mockImplementation(() => mockClient)

				await isolatedCache.init()
				const result = await isolatedCache.get(
					Object.keys(mockedValue)[0],
				)

				expect(mock).toHaveBeenCalledTimes(1)
				expect(result).toStrictEqual(mockedValue)
			})
		})
	})

	describe("del", () => {
		it("should delete from cache", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedCache = await import("@/services/cache")
				const mockConnect = {
					del: jest.fn(),
				}
				const mockClient = {
					connect: () => mockConnect,
					del: mock,
					on: jest.fn(),
				} as unknown as RedisClientType
				mockedCreateClient.mockImplementation(() => mockClient)

				await isolatedCache.init()
				const result = await isolatedCache.del(
					Object.keys(mockedValue)[0],
				)

				expect(mock).toHaveBeenCalledTimes(1)
				expect(result).toStrictEqual(mockedValue)
			})
		})
	})
})
