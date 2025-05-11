import { EventEmitter } from "events"
import amqplib from "amqplib"

import { mockProcessExit, restoreProcessExit, runAsyncHandlers } from "@/helper"
import { logger } from "@/common/logger"

jest.mock("amqplib")

let mockConnect: jest.Mock<Promise<amqplib.ChannelModel>>
let mockClose: jest.Mock<Promise<void>, []>
let mockCreateChannel: jest.Mock

const mockConnectWithResolvedValues = () => {
	const mockChannel = { dummy: "channel" }
	mockClose = jest.fn().mockResolvedValue(undefined)
	mockCreateChannel = jest.fn().mockResolvedValue(mockChannel)
	mockConnect = amqplib.connect as jest.Mock<Promise<amqplib.ChannelModel>>
	mockConnect.mockResolvedValue({
		close: mockClose,
		createChannel: mockCreateChannel,
	} as unknown as amqplib.ChannelModel)
}

describe("RabbitMQ service", () => {
	afterEach(() => {
		jest.clearAllMocks()
		jest.restoreAllMocks()
	})

	describe("init", () => {
		beforeEach(() => {
			mockConnectWithResolvedValues()
		})

		let onSpy: jest.SpiedFunction<typeof process.on>

		it("should initialize and connect the RabbitMQ client", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import("@/services/rabbitMQ")

				onSpy = jest.spyOn(process, "on")

				await isolatedRabbitMQ.init()

				expect(mockConnect).toHaveBeenCalledWith(
					"amqp://guest:guest@0.0.0.0:5671",
				)
				expect(onSpy).toHaveBeenCalledWith(
					"SIGINT",
					expect.any(Function),
				)
				expect(mockClose).not.toHaveBeenCalled()
			})
		})

		it("should use environment variables when connecting", async () => {})

		it("should not create new connection if already initialized", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import("@/services/rabbitMQ")
				await isolatedRabbitMQ.init()
				await isolatedRabbitMQ.init()

				expect(mockConnect).toHaveBeenCalledOnce()
			})
		})

		it("should log and exit on connection error", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import("@/services/rabbitMQ")

				mockProcessExit()

				mockConnect.mockRejectedValue(new Error())

				await isolatedRabbitMQ.init()

				expect(mockConnect).toHaveBeenCalled()
				expect(logger.error).toHaveBeenCalledWith(
					"Error initializing RabbitMQ:",
					expect.any(Error),
				)

				restoreProcessExit()
			})
		})

		it.each([
			["declareExchange", () => rabbitmq.get("")],
			["declareQueue", () => rabbitmq.set("", "")],
			["publish", () => rabbitmq.del("")],
			["consume", () => rabbitmq.del("")],
		])(
			`should not allow '%s' method without an initialized connection`,
			async (_, fn) => {},
		)

		describe("cleanup", () => {
			let processEmitter: EventEmitter

			beforeEach(() => {
				mockProcessExit()
				process.exit = jest.fn() as never

				processEmitter = new EventEmitter()
				onSpy = jest
					.spyOn(process, "on")
					.mockImplementation((event, handler) => {
						processEmitter.on(event, handler)

						return process
					})
			})

			afterEach(() => {
				restoreProcessExit()
				jest.restoreAllMocks()
			})

			it.each(["SIGINT", "SIGTERM"] as const)(
				"should close connection on %s",
				async (signal) => {
					await jest.isolateModulesAsync(async () => {
						const isolatedRabbitMQ = await import(
							"@/services/rabbitMQ"
						)
						await isolatedRabbitMQ.init()

						processEmitter.emit(signal)

						await runAsyncHandlers()

						expect(onSpy).toHaveBeenCalledWith(
							signal,
							expect.any(Function),
						)
						expect(mockClose).toHaveBeenCalledOnce()
						expect(process.exit).toHaveBeenCalledWith(0)
					})
				},
			)
		})
	})

	describe("declareChannel", () => {
		it("should initialize connection and create a new channel", async () => {
			await jest.isolateModulesAsync(async () => {
				mockConnectWithResolvedValues()
				const isolatedRabbitMQ = await import("@/services/rabbitMQ")
				const response =
					await isolatedRabbitMQ.declareChannel("testChannel")
				expect(response).toBe(true)
				expect(amqplib.connect).toHaveBeenCalled()
				expect(mockCreateChannel).toHaveBeenCalled()
			})
		})

		it("should not overwrite/add a channel when provided with an existing key", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import("@/services/rabbitMQ")
				await isolatedRabbitMQ.declareChannel("testChannel")
				const response =
					await isolatedRabbitMQ.declareChannel("testChannel")
				expect(response).toBe(true)
				expect(mockCreateChannel).toHaveBeenCalledOnce()
			})
		})

		it("should return false if createChannel throws", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import("@/services/rabbitMQ")
				mockCreateChannel.mockRejectedValueOnce(new Error("Failed"))
				const response =
					await isolatedRabbitMQ.declareChannel("errorChannel")
				expect(response).toBe(false)
			})
		})
	})
})
