import {
	describe,
	test,
	beforeEach,
	afterEach,
	expect,
	mock,
	spyOn,
} from "bun:test"
import { createClient } from "redis"

import { logger } from "@/common/logger"
import {
	processExitMock,
	restoreEnvVars,
	restoreProcessExitMock,
} from "@/utils/process"
import { createCacheClient } from "@/infrastructure/cache"

let mockConnect: ReturnType<typeof mock<RedisClient["connect"]>>
let mockOn: ReturnType<typeof mock<RedisClient["on"]>>
type RedisClient = Awaited<ReturnType<typeof createClient>>
let mockClient: RedisClient
const mockCreateClient = mock(createClient)

await mock.module("redis", () => ({
	createClient: mockCreateClient,
}))

describe("Cache service", () => {
	beforeEach(() => {
		mockConnect = mock().mockResolvedValue(undefined)
		mockOn = mock()
		mockClient = {
			connect: mockConnect,
			on: mockOn,
		} as unknown as RedisClient
		mockCreateClient.mockReturnValue(mockClient)
	})

	afterEach(() => {
		mock.clearAllMocks()
	})

	describe("init", () => {
		test("should initialize and connect cache client", async () => {
			await createCacheClient().init()

			expect(mockCreateClient).toHaveBeenCalledWith({
				password: process.env.CACHE_PASSWORD ?? "",
				socket: {
					host: process.env.CACHE_HOST ?? "localhost",
					port: Number(process.env.CACHE_PORT ?? "6379"),
				},
			})
			expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function))
			expect(mockOn).toHaveBeenCalledWith("connect", expect.any(Function))
			expect(mockConnect).toHaveBeenCalled()
		})

		test("should use environment variables when connecting", async () => {
			const host = "localhost"
			const password = "a123"
			const port = "1234"
			process.env.CACHE_HOST = host
			process.env.CACHE_PASSWORD = password
			process.env.CACHE_PORT = port

			await createCacheClient().init()

			expect(mockCreateClient).toHaveBeenCalledWith({
				password,
				socket: {
					host,
					port: Number(port),
				},
			})
			expect(mockConnect).toHaveBeenCalled()

			restoreEnvVars()
		})

		test("should log info on successful connect", async () => {
			type ConnectCallback = () => void
			let connectHandler: ConnectCallback | undefined
			mockOn.mockImplementation((event, cb: ConnectCallback) => {
				if (event === "connect") connectHandler = cb

				return mockClient
			})

			await createCacheClient().init()
			connectHandler?.()

			expect(mockCreateClient).toHaveBeenCalled()
			expect(mockConnect).toHaveBeenCalled()
			expect(logger.info).toHaveBeenCalledWith(
				expect.stringContaining("Cache client connected on port"),
			)
		})

		test("should exit on connection error", async () => {
			const mockProcessExit = processExitMock()

			type ErrorCallback = (err: Error) => void
			let errorHandler: ErrorCallback | undefined

			mockOn.mockImplementation((event, cb: ErrorCallback) => {
				if (event === "error") errorHandler = cb

				return mockClient
			})
			spyOn(process, "exit").mockImplementation(() => undefined as never)

			await createCacheClient().init()

			const error = new Error("Connection failed")
			errorHandler?.(error)

			expect(logger.error).toHaveBeenCalledWith(error)
			expect(mockProcessExit).toHaveBeenCalledWith(1)

			restoreProcessExitMock()
		})

		test.each(["SIGINT", "SIGTERM"] as const)(
			"should not allow '%s' method without an initialized client",
			(method) => {
				const cacheClient = createCacheClient()

				// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
				expect(() => (cacheClient as any)[method]("", "")).toThrow(
					Error,
				)
			},
		)

		describe("set", () => {
			test("should set in cache", async () => {
				const key = "entry"
				const mockSet = mock().mockReturnValue(key)
				const mockClient2 = {
					connect: mockConnect,
					on: mockOn,
					set: mockSet,
				} as unknown as RedisClient
				mockCreateClient.mockReturnValue(mockClient2)

				const cacheClient = createCacheClient()
				await cacheClient.init()
				const result = await cacheClient.set(key, "OK")

				expect(mockSet).toHaveBeenCalledTimes(1)
				expect(result).toStrictEqual(key)
			})
		})

		describe("get", () => {
			test("should get from cache", async () => {
				const value = "OK"
				const mockGet = mock().mockReturnValue(value)
				const mockClient2 = {
					connect: mockConnect,
					get: mockGet,
					on: mockOn,
				} as unknown as RedisClient
				mockCreateClient.mockReturnValue(mockClient2)

				const cacheClient = createCacheClient()
				await cacheClient.init()
				const result = await cacheClient.get("key")

				expect(mockGet).toHaveBeenCalledTimes(1)
				expect(result).toStrictEqual(value)
			})
		})

		describe("del", () => {
			test("should delete from cache", async () => {
				const value = 1
				const mockDel = mock().mockReturnValue(value)
				const mockClient2 = {
					connect: mockConnect,
					del: mockDel,
					on: mockOn,
				} as unknown as RedisClient
				mockCreateClient.mockReturnValue(mockClient2)

				const cacheClient = createCacheClient()
				await cacheClient.init()
				const result = await cacheClient.del("key")

				expect(mockDel).toHaveBeenCalledTimes(1)
				expect(result).toStrictEqual(value)
			})
		})
	})
})
