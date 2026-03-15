import {
	describe,
	test,
	beforeEach,
	afterEach,
	expect,
	mock,
	spyOn,
} from "bun:test"
import { EventEmitter } from "events"
import amqplib from "amqplib"

import {
	processExitMock,
	restoreEnvVars,
	restoreProcessExitMock,
	runAsyncHandlers,
} from "@/helper"
import { logger } from "@/common/logger"
import { createQueueClient } from "@/infrastructure/rabbitMQ"

let mockClose: ReturnType<typeof mock<amqplib.ChannelModel["close"]>>
let mockChannelClose: ReturnType<typeof mock<amqplib.Channel["close"]>>
let mockChannelAssertExchange: ReturnType<
	typeof mock<amqplib.Channel["assertExchange"]>
>
let mockChannelAssertQueue: ReturnType<
	typeof mock<amqplib.Channel["assertQueue"]>
>
let mockChannelBindQueue: ReturnType<typeof mock<amqplib.Channel["bindQueue"]>>
let mockChannelPublish: ReturnType<typeof mock<amqplib.Channel["publish"]>>
let mockChannelOnce: ReturnType<typeof mock<amqplib.Channel["once"]>>
let mockChannelConsume: ReturnType<typeof mock<amqplib.Channel["consume"]>>
let createdChannelMock: amqplib.Channel
let mockCreateChannel: ReturnType<
	typeof mock<amqplib.ChannelModel["createChannel"]>
>
const mockConnect = mock(amqplib.connect)

await mock.module("amqplib", () => ({
	default: {
		connect: mockConnect,
	},
}))

const exchangeDetails = {
	alternateExchange: "nonRouted",
	arguments: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"x-message-ttl": 86400000,
	},
	autoDelete: false,
	durable: true,
	internal: false,
}
const queueDetails = {
	autoDelete: false,
	deadLetterExchange: "deadLetter",
	durable: true,
	exclusive: false,
	messageTtl: 3600000,
}

describe("RabbitMQ service", () => {
	const channel = "channelA"
	const exchange = "exchangeA"
	const routingKey = "fastifyTemplate.unitTest.A"
	const message = "Message A published"
	const queue = "queueA"
	const bindings = {
		[exchange]: routingKey,
		exchangeB: "fastifyTemplate.unitTest.B",
	}

	beforeEach(() => {
		mockClose = mock().mockResolvedValue(undefined)
		mockChannelClose = mock().mockResolvedValue(undefined)
		mockChannelAssertExchange = mock().mockResolvedValue(undefined)
		mockChannelAssertQueue = mock().mockResolvedValue(undefined)
		mockChannelBindQueue = mock().mockResolvedValue(undefined)
		mockChannelPublish = mock().mockReturnValue(true)
		mockChannelOnce = mock(
			(event: string | symbol, cb: (...args: unknown[]) => void) => {
				if (event === "drain") {
					cb()
				}

				return {} as amqplib.Channel
			},
		)
		mockChannelConsume = mock().mockReturnValue(true)
		createdChannelMock = {
			assertExchange: mockChannelAssertExchange,
			assertQueue: mockChannelAssertQueue,
			bindQueue: mockChannelBindQueue,
			close: mockChannelClose,
			consume: mockChannelConsume,
			once: mockChannelOnce,
			publish: mockChannelPublish,
		} as Partial<amqplib.Channel> as amqplib.Channel
		mockCreateChannel = mock().mockResolvedValue(createdChannelMock)
		mockConnect.mockResolvedValue({
			close: mockClose,
			createChannel: mockCreateChannel,
		} as Partial<amqplib.ChannelModel> as amqplib.ChannelModel)
	})

	afterEach(() => {
		mock.clearAllMocks()
		mock.restore()
		process.removeAllListeners("SIGINT")
		process.removeAllListeners("SIGTERM")
	})

	describe("init", () => {
		test("should initialize and connect RabbitMQ client", async () => {
			const originalProcessOn = process.on.bind(process)
			const processOnMock = mock()
			process.on = processOnMock as unknown as typeof process.on

			await createQueueClient().init()

			expect(mockConnect).toHaveBeenCalledWith(
				"amqp://guest:guest@0.0.0.0:5671",
			)
			expect(processOnMock).toHaveBeenCalledWith(
				"SIGINT",
				expect.any(Function),
			)
			expect(processOnMock).toHaveBeenCalledWith(
				"SIGTERM",
				expect.any(Function),
			)
			expect(mockClose).not.toHaveBeenCalled()

			process.on = originalProcessOn
		})

		test("should use environment variables when connecting", async () => {
			const transport = "mqtt"
			const host = "localhost"
			const user = "admin"
			const password = "a123"
			const port = "1234"
			process.env.RABBIT_TRANSPORT = transport
			process.env.RABBIT_HOST = host
			process.env.RABBIT_USER = user
			process.env.RABBIT_PASSWORD = password
			process.env.RABBIT_PORT = port

			await createQueueClient().init()

			expect(mockConnect).toHaveBeenCalledWith(
				`${transport}://${user}:${password}@${host}:${port}`,
			)

			restoreEnvVars()
		})

		test("should not create new connection when already initialized", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()
			await queueClient.init()

			expect(mockConnect).toHaveBeenCalledTimes(1)
		})

		test("should exit on connection error", async () => {
			const mockProcessExit = processExitMock()

			const error = new Error("RabbitMQ username or password invalid")
			mockConnect.mockRejectedValue(error)

			await createQueueClient().init()

			expect(mockConnect).toHaveBeenCalled()
			expect(logger.error).toHaveBeenCalledWith({
				err: error,
				msg: "Error initializing RabbitMQ",
			})
			expect(mockProcessExit).toHaveBeenCalled()

			restoreProcessExitMock()
		})

		test("should initialize connection for 'publish' method", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			expect(
				queueClient.publish(channel, exchange, routingKey, message),
			).resolves.toBe(true)

			expect(mockConnect).toHaveBeenCalled()
			expect(mockChannelPublish).toHaveBeenCalled()
		})

		test("should initialize connection for 'consume' method", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			expect(
				queueClient.consume(channel, queue, bindings, () => undefined),
			).resolves.toBe(true)
			expect(mockConnect).toHaveBeenCalled()
			expect(mockChannelConsume).toHaveBeenCalled()
		})

		test("should initialize connection for 'declareChannel' method", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			expect(queueClient.declareChannel("channel")).resolves.toBe(
				createdChannelMock,
			)
			expect(mockConnect).toHaveBeenCalled()
			expect(mockCreateChannel).toHaveBeenCalled()
		})

		describe("cleanup", () => {
			let processEmitter: EventEmitter
			let onSpy: ReturnType<typeof spyOn>
			let exitMock: ReturnType<typeof processExitMock>

			beforeEach(() => {
				exitMock = processExitMock()

				processEmitter = new EventEmitter()
				onSpy = spyOn(process, "on").mockImplementation(
					(
						event: Parameters<typeof process.on>[0],
						handler: Parameters<typeof process.on>[1],
					) => {
						processEmitter.on(event, handler)

						return process
					},
				)
			})

			afterEach(() => {
				restoreProcessExitMock()
			})

			test.each(["SIGINT", "SIGTERM"] as const)(
				"should close connection on %s",
				async (signal) => {
					const queueClient = createQueueClient()
					await queueClient.init()

					processEmitter.emit(signal)

					await runAsyncHandlers()

					expect(onSpy).toHaveBeenCalledWith(
						signal,
						expect.any(Function),
					)
					expect(mockClose).toHaveBeenCalledTimes(1)
					expect(logger.info).toHaveBeenCalledWith(
						"RabbitMQ connection closed",
					)
					expect(exitMock).toHaveBeenCalledWith(0)
				},
			)

			test.each(["SIGINT", "SIGTERM"] as const)(
				"should log error message when unable to close connection on %s",
				async (signal) => {
					const error = new Error("Unable to close connection")
					mockClose.mockRejectedValue(error)

					const queueClient = createQueueClient()
					await queueClient.init()

					processEmitter.emit(signal)

					await runAsyncHandlers()

					expect(onSpy).toHaveBeenCalled()
					expect(mockClose).toHaveBeenCalled()
					expect(logger.error).toHaveBeenCalledWith({
						err: error,
						msg: `Error closing RabbitMQ connection`,
					})
					expect(exitMock).toHaveBeenCalledWith(1)
				},
			)
		})
	})

	describe("declare channel", () => {
		test("should create new channel", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			const response = await queueClient.declareChannel("channelA")

			expect(response).toBe(createdChannelMock)
			expect(mockCreateChannel).toHaveBeenCalled()
		})

		test("should not overwrite/add channel when provided with existing key", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			await queueClient.declareChannel("channelA")
			const response = await queueClient.declareChannel("channelA")

			expect(response).toBe(createdChannelMock)
			expect(mockCreateChannel).toHaveBeenCalledTimes(1)
		})

		test("should return false when createChannel throws", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			mockCreateChannel.mockRejectedValueOnce(new Error("Failed"))

			const response = await queueClient.declareChannel("errorChannel")

			expect(response).toBe(undefined)
		})
	})

	describe("publish", () => {
		describe("declareExchange", () => {
			test("should create exchange", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const response = await queueClient.publish(
					channel,
					exchange,
					routingKey,
					message,
				)

				expect(response).toBe(true)
				expect(mockChannelAssertExchange).toHaveBeenCalledWith(
					exchange,
					"topic",
					expect.objectContaining(exchangeDetails),
				)
				expect(mockChannelPublish).toHaveBeenCalled()
			})

			test("should not create exchange when channel failed to create", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const error = new Error("Unable to create channel")
				mockCreateChannel.mockRejectedValue(error)

				const response = await queueClient.publish(
					channel,
					exchange,
					routingKey,
					message,
				)

				expect(response).toBe(false)
				expect(logger.error).toHaveBeenCalledWith({
					err: error,
					msg: `Failed to create RabbitMQ channel '${channel}'`,
				})
				expect(mockChannelAssertExchange).not.toHaveBeenCalled()
				expect(mockChannelPublish).not.toHaveBeenCalled()
			})

			test("should return when unable to create exchange", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const error = new Error("Unable to assert exchange")
				mockChannelAssertExchange.mockRejectedValue(error)

				const response = await queueClient.publish(
					channel,
					exchange,
					routingKey,
					message,
				)

				expect(response).toBe(false)
				expect(mockChannelAssertExchange).toHaveBeenCalled()
				expect(logger.error).toHaveBeenCalledWith({
					err: error,
					msg: `Failed to create RabbitMQ exchange '${exchange}'`,
				})
				expect(mockChannelPublish).not.toHaveBeenCalled()
			})
		})

		test("should publish message", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			const response = await queueClient.publish(
				channel,
				exchange,
				routingKey,
				message,
			)

			expect(response).toBe(true)
			expect(mockChannelPublish).toHaveBeenCalledWith(
				exchange,
				routingKey,
				Buffer.from(message),
			)
			expect(logger.info).toHaveBeenCalledWith(
				`Successfully published RabbitMQ message to exchange '${exchange}' with routingKey '${routingKey}'`,
			)
		})

		test("should drain channel when publish is unsuccessful", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			mockChannelPublish.mockReturnValue(false)

			const response = await queueClient.publish(
				channel,
				exchange,
				routingKey,
				message,
			)

			expect(response).toBe(false)
			expect(mockChannelPublish).toHaveBeenCalled()
			expect(mockChannelOnce).toHaveBeenCalledWith(
				"drain",
				expect.any(Function),
			)
			expect(logger.error).toHaveBeenCalledWith({
				msg: `Unable to publish RabbitMQ message to exchange '${exchange}' with routingKey '${routingKey}'. Drain event received.`,
			})
		})

		test("should close channel when publish failed", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			const error = new Error("Unable to assert exchange")
			mockChannelPublish.mockImplementation(() => {
				throw error
			})

			const response = await queueClient.publish(
				channel,
				exchange,
				routingKey,
				message,
			)

			expect(response).toBe(false)
			expect(mockChannelPublish).toHaveBeenCalled()
			expect(logger.error).toHaveBeenCalledWith({
				err: error,
				msg: `Error publishing RabbitMQ message to exchange '${exchange}' with routingKey '${routingKey}'`,
			})
			expect(mockChannelClose).toHaveBeenCalled()
			expect(logger.debug).toHaveBeenCalledWith(
				`Closed channel '${channel}'`,
			)
		})

		test("should log debug message when channel failed to close", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			const error = new Error("Unable to assert exchange")
			mockChannelPublish.mockImplementation(() => {
				throw error
			})
			const closeError = new Error("Unable to assert exchange")
			mockChannelClose.mockRejectedValue(closeError)

			const response = await queueClient.publish(
				channel,
				exchange,
				routingKey,
				message,
			)

			expect(response).toBe(false)
			expect(mockChannelPublish).toHaveBeenCalled()
			expect(logger.error).toHaveBeenCalledWith({
				err: error,
				msg: `Error publishing RabbitMQ message to exchange '${exchange}' with routingKey '${routingKey}'`,
			})
			expect(mockChannelClose).toHaveBeenCalled()
			expect(logger.warn).toHaveBeenCalledWith({
				err: closeError,
				msg: `Error closing channel '${channel}'`,
			})
		})
	})

	describe("consume", () => {
		describe("declare queue", () => {
			test("should create exchange", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const response = await queueClient.consume(
					channel,
					queue,
					bindings,
					() => undefined,
				)
				expect(response).toBe(true)
				expect(mockChannelAssertExchange).toHaveBeenCalledTimes(2)
				expect(mockChannelAssertExchange).toHaveBeenNthCalledWith(
					1,
					Object.keys(bindings)[0],
					"topic",
					exchangeDetails,
				)
				expect(mockChannelAssertExchange).toHaveBeenNthCalledWith(
					2,
					Object.keys(bindings)[1],
					"topic",
					exchangeDetails,
				)
				expect(mockChannelBindQueue).toHaveBeenCalled()
			})

			test("should not create queue when exchange failed to create", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const error = new Error("Unable to create exchange")
				mockChannelAssertExchange.mockRejectedValue(error)

				const response = await queueClient.consume(
					channel,
					queue,
					bindings,
					() => undefined,
				)

				expect(response).toBe(false)
				expect(logger.error).toHaveBeenCalledTimes(2)
				expect(logger.error).toHaveBeenNthCalledWith(1, {
					err: error,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					msg: `Failed to create RabbitMQ exchange '${Object.keys(bindings)[0]!}'`,
				})
				expect(logger.error).toHaveBeenNthCalledWith(2, {
					err: error,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					msg: `Failed to create RabbitMQ exchange '${Object.keys(bindings)[1]!}'`,
				})
				expect(mockChannelAssertExchange).toHaveBeenCalledTimes(2)
				expect(mockChannelAssertQueue).not.toHaveBeenCalled()
				expect(mockChannelBindQueue).not.toHaveBeenCalled()
				expect(mockChannelConsume).not.toHaveBeenCalled()
			})

			test("should create queue", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const response = await queueClient.consume(
					channel,
					queue,
					bindings,
					() => undefined,
				)

				expect(response).toBe(true)
				expect(mockChannelAssertExchange).toHaveBeenCalled()
				expect(mockChannelAssertQueue).toHaveBeenCalledWith(queue, {
					autoDelete: queueDetails.autoDelete,
					deadLetterExchange: queueDetails.deadLetterExchange,
					durable: queueDetails.durable,
					exclusive: queueDetails.exclusive,
					messageTtl: queueDetails.messageTtl,
				})
				expect(mockChannelBindQueue).toHaveBeenCalledTimes(2)
				expect(mockChannelBindQueue).toHaveBeenNthCalledWith(
					1,
					queue,
					exchange,
					routingKey,
				)
				expect(mockChannelBindQueue).toHaveBeenNthCalledWith(
					2,
					queue,
					"exchangeB",
					"fastifyTemplate.unitTest.B",
				)
				expect(logger.info).toHaveBeenCalledWith(
					`Started consuming RabbitMQ messages on queue '${queue}'`,
				)
			})

			test("should not create queue when channel failed to create", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const error = new Error("Unable to create channel")
				mockCreateChannel.mockRejectedValue(error)

				const response = await queueClient.consume(
					channel,
					queue,
					bindings,
					() => undefined,
				)

				expect(response).toBe(false)
				expect(logger.error).toHaveBeenCalledWith({
					err: error,
					msg: `Failed to create RabbitMQ channel '${channel}'`,
				})
				expect(mockChannelAssertExchange).not.toHaveBeenCalled()
				expect(mockChannelAssertQueue).not.toHaveBeenCalled()
				expect(mockChannelBindQueue).not.toHaveBeenCalled()
				expect(mockChannelConsume).not.toHaveBeenCalled()
			})

			test("should return when unable to create queue", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const error = new Error("Unable to create queue")
				mockChannelAssertQueue.mockRejectedValue(error)

				const response = await queueClient.consume(
					channel,
					queue,
					bindings,
					() => undefined,
				)

				expect(response).toBe(false)
				expect(mockChannelAssertExchange).toHaveBeenCalled()
				expect(mockChannelAssertQueue).toHaveBeenCalled()
				expect(logger.error).toHaveBeenCalledWith({
					err: error,
					msg: `Failed to create RabbitMQ queue '${queue}'`,
				})
				expect(mockChannelBindQueue).not.toHaveBeenCalled()
				expect(mockChannelConsume).not.toHaveBeenCalled()
			})

			test("should log error message when unable to bind to queue", async () => {
				const queueClient = createQueueClient()
				await queueClient.init()

				const error = new Error("Unable to create queue")
				mockChannelBindQueue
					.mockResolvedValueOnce(true)
					.mockRejectedValueOnce(error)

				const response = await queueClient.consume(
					channel,
					queue,
					bindings,
					() => undefined,
				)

				expect(response).toBe(true)
				expect(mockChannelAssertExchange).toHaveBeenCalled()
				expect(mockChannelAssertQueue).toHaveBeenCalled()
				expect(mockChannelBindQueue).toHaveBeenCalledTimes(2)
				expect(logger.error).toHaveBeenCalledTimes(1)
				expect(logger.error).toHaveBeenCalledWith({
					err: error,
					msg: `Failed to bind 'fastifyTemplate.unitTest.B' to RabbitMQ exchange 'exchangeB' for queue '${queue}'`,
				})
				expect(mockChannelConsume).toHaveBeenCalled()
			})
		})

		test("should consume messages", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			const response = await queueClient.consume(
				channel,
				queue,
				bindings,
				() => undefined,
			)

			expect(response).toBe(true)
			expect(logger.info).toHaveBeenCalledWith(
				`Started consuming RabbitMQ messages on queue '${queue}'`,
			)
			expect(mockChannelConsume).toHaveBeenCalled()
		})

		test("should log error message when unable to consume", async () => {
			const queueClient = createQueueClient()
			await queueClient.init()

			const error = new Error("Unable to create queue")
			mockChannelConsume.mockRejectedValue(error)

			const response = await queueClient.consume(
				channel,
				queue,
				bindings,
				() => undefined,
			)

			expect(response).toBe(false)
			expect(logger.error).toHaveBeenCalledWith({
				err: error,
				msg: `Failed to start consumer on RabbitMQ queue '${queue}'`,
			})
		})
	})
})
