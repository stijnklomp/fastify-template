import { EventEmitter } from "events"
import amqplib from "amqplib"

import {
	mockProcessExit,
	restoreEnvVars,
	restoreProcessExit,
	runAsyncHandlers,
} from "@/helper"
import { logger } from "@/common/logger"

jest.mock("amqplib")

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
	let mockClose: jest.MockedFunction<amqplib.ChannelModel["close"]>
	let mockChannelClose: jest.MockedFunction<amqplib.Channel["close"]>
	let mockChannelAssertExchange: jest.MockedFunction<
		amqplib.Channel["assertExchange"]
	>
	let mockChannelAssertQueue: jest.MockedFunction<
		amqplib.Channel["assertQueue"]
	>
	let mockChannelBindQueue: jest.MockedFunction<amqplib.Channel["bindQueue"]>
	let mockChannelPublish: jest.MockedFunction<amqplib.Channel["publish"]>
	let mockChannelOnce: jest.MockedFunction<amqplib.Channel["once"]>
	let mockChannelConsume: jest.MockedFunction<amqplib.Channel["consume"]>
	let mockCreateChannel: jest.MockedFunction<
		amqplib.ChannelModel["createChannel"]
	>
	let mockConnect: jest.MockedFunction<typeof amqplib.connect>

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
		mockClose = jest.fn().mockResolvedValue(undefined)
		mockChannelClose = jest.fn().mockResolvedValue(undefined)
		mockChannelAssertExchange = jest.fn().mockResolvedValue(undefined)
		mockChannelAssertQueue = jest.fn().mockResolvedValue(undefined)
		mockChannelBindQueue = jest.fn().mockResolvedValue(undefined)
		mockChannelPublish = jest.fn().mockReturnValue(true)
		mockChannelOnce = jest.fn(
			(event: string | symbol, cb: (...args: unknown[]) => void) => {
				if (event === "drain") {
					cb()
				}

				return {} as amqplib.Channel
			},
		)
		mockChannelConsume = jest.fn().mockReturnValue(true)
		mockCreateChannel = jest.fn().mockResolvedValue({
			assertExchange: mockChannelAssertExchange,
			assertQueue: mockChannelAssertQueue,
			bindQueue: mockChannelBindQueue,
			close: mockChannelClose,
			consume: mockChannelConsume,
			once: mockChannelOnce,
			publish: mockChannelPublish,
		})
		mockConnect = amqplib.connect as jest.Mock
		mockConnect.mockResolvedValue({
			close: mockClose,
			createChannel: mockCreateChannel,
		} as unknown as amqplib.ChannelModel)
	})

	afterEach(() => {
		jest.clearAllMocks()
		jest.restoreAllMocks()
		process.removeAllListeners("SIGINT")
		process.removeAllListeners("SIGTERM")
	})

	describe("init", () => {
		let onSpy: jest.SpiedFunction<typeof process.on>

		it("should initialize and connect RabbitMQ client", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				onSpy = jest.spyOn(process, "on")

				await isolatedRabbitMQ.init()

				expect(mockConnect).toHaveBeenCalledWith(
					"amqp://guest:guest@0.0.0.0:5671",
				)
				expect(onSpy).toHaveBeenCalledWith(
					"SIGINT",
					expect.any(Function),
				)
				expect(onSpy).toHaveBeenCalledWith(
					"SIGTERM",
					expect.any(Function),
				)
				expect(mockClose).not.toHaveBeenCalled()
			})
		})

		it("should use environment variables when connecting", async () => {
			await jest.isolateModulesAsync(async () => {
				const transport = "mqtt"
				const host = "localhost"
				const user = "admin"
				const password = "a123"
				const port = "1234"
				process.env.RABBIT_TRANSPORT = transport
				process.env.RABBIT_HOST = host
				process.env.RABBIT_USER = user
				process.env.RABBIT_PASS = password
				process.env.RABBIT_PORT = port

				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				await isolatedRabbitMQ.init()

				expect(mockConnect).toHaveBeenCalledWith(
					`${transport}://${user}:${password}@${host}:${port}`,
				)

				restoreEnvVars()
			})
		})

		it("should not create new connection when already initialized", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				await isolatedRabbitMQ.init()
				await isolatedRabbitMQ.init()

				expect(mockConnect).toHaveBeenCalledOnce()
			})
		})

		it("should exit on connection error", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				mockProcessExit()

				const errorMessage = "RabbitMQ username of password invalid"
				mockConnect.mockRejectedValue(new Error(errorMessage))

				await isolatedRabbitMQ.init()

				expect(mockConnect).toHaveBeenCalled()
				expect(logger.error).toHaveBeenCalledWith(
					"Error initializing RabbitMQ:",
					errorMessage,
				)

				restoreProcessExit()
			})
		})

		it("should initialize connection for 'publish' method", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				await expect(
					isolatedRabbitMQ.publish(
						channel,
						exchange,
						routingKey,
						message,
					),
				).resolves.not.toThrow()
				expect(mockConnect).toHaveBeenCalled()
				expect(mockChannelPublish).toHaveBeenCalled()
			})
		})

		it("should initialize connection for 'consume' method", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				await expect(
					isolatedRabbitMQ.consume(
						channel,
						queue,
						bindings,
						() => undefined,
					),
				).resolves.not.toThrow()
				expect(mockConnect).toHaveBeenCalled()
				expect(mockChannelConsume).toHaveBeenCalled()
			})
		})

		it("should initialize connection for 'declareChannel' method", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				await expect(
					isolatedRabbitMQ.declareChannel("channel"),
				).resolves.not.toThrow()
				expect(mockConnect).toHaveBeenCalled()
				expect(mockCreateChannel).toHaveBeenCalled()
			})
		})

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
							"@/infrastructure/rabbitMQ"
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

			it.each(["SIGINT", "SIGTERM"] as const)(
				"should log error message when unable to close connection on %s",
				async (signal) => {
					await jest.isolateModulesAsync(async () => {
						const isolatedRabbitMQ = await import(
							"@/infrastructure/rabbitMQ"
						)

						const errorMessage = "Unable to close connection"
						mockClose.mockRejectedValue(new Error(errorMessage))

						await isolatedRabbitMQ.init()

						processEmitter.emit(signal)

						await runAsyncHandlers()

						expect(onSpy).toHaveBeenCalled()
						expect(mockClose).toHaveBeenCalled()
						expect(logger.error).toHaveBeenCalledWith(
							`Error closing RabbitMQ connection:`,
							errorMessage,
						)
						expect(process.exit).toHaveBeenCalledWith(1)
					})
				},
			)
		})
	})

	describe("declare channel", () => {
		it("should create new channel", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				const response =
					await isolatedRabbitMQ.declareChannel("channelA")

				expect(response).toBe(true)
				expect(mockCreateChannel).toHaveBeenCalled()
			})
		})

		it("should not overwrite/add channel when provided with existing key", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				await isolatedRabbitMQ.declareChannel("channelA")
				const response =
					await isolatedRabbitMQ.declareChannel("channelA")

				expect(response).toBe(true)
				expect(mockCreateChannel).toHaveBeenCalledOnce()
			})
		})

		it("should return false when createChannel throws", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				mockCreateChannel.mockRejectedValueOnce(new Error("Failed"))

				const response =
					await isolatedRabbitMQ.declareChannel("errorChannel")

				expect(response).toBe(false)
			})
		})
	})

	describe("publish", () => {
		describe("declareExchange", () => {
			it("should create exchange", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const response = await isolatedRabbitMQ.publish(
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
			})

			it("should not create exchange when channel failed to create", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const errorMessage = "Unable to create channel"
					mockCreateChannel.mockRejectedValue(new Error(errorMessage))

					const response = await isolatedRabbitMQ.publish(
						channel,
						exchange,
						routingKey,
						message,
					)

					expect(response).toBe(false)
					expect(logger.error).toHaveBeenCalledWith(
						`Failed to create RabbitMQ channel '${channel}':`,
						errorMessage,
					)
					expect(mockChannelAssertExchange).not.toHaveBeenCalled()
					expect(mockChannelPublish).not.toHaveBeenCalled()
				})
			})

			it("should return when unable to create exchange", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const errorMessage = "Unable to assert exchange"
					mockChannelAssertExchange.mockRejectedValue(
						new Error(errorMessage),
					)

					const response = await isolatedRabbitMQ.publish(
						channel,
						exchange,
						routingKey,
						message,
					)

					expect(response).toBe(false)
					expect(mockChannelAssertExchange).toHaveBeenCalled()
					expect(logger.error).toHaveBeenCalledWith(
						`Failed to create RabbitMQ exchange '${exchange}':`,
						errorMessage,
					)
					expect(mockChannelPublish).not.toHaveBeenCalled()
				})
			})
		})

		it("should publish message", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				const response = await isolatedRabbitMQ.publish(
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
		})

		it("should drain channel when publish is unsuccessful", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				mockChannelPublish.mockReturnValue(false)

				const response = await isolatedRabbitMQ.publish(
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
				expect(logger.error).toHaveBeenCalledWith(
					`Unable to publish RabbitMQ message to exchange '${exchange}' with routingKey '${routingKey}'. Drain event received.`,
				)
			})
		})

		it("should close channel when publish failed", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				const errorMessage = "Unable to assert exchange"
				mockChannelPublish.mockImplementation(() => {
					throw new Error(errorMessage)
				})

				const response = await isolatedRabbitMQ.publish(
					channel,
					exchange,
					routingKey,
					message,
				)

				expect(response).toBe(false)
				expect(mockChannelPublish).toHaveBeenCalled()
				expect(logger.error).toHaveBeenCalledWith(
					`Error publishing RabbitMQ message to exchange '${exchange}' with routingKey '${routingKey}':`,
					errorMessage,
				)
				expect(mockChannelClose).toHaveBeenCalled()
				expect(logger.debug).toHaveBeenCalledWith(
					`Closed channel '${channel}'`,
				)
			})
		})

		it("should log debug message when channel failed to close", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				const publishErrorMessage = "Unable to assert exchange"
				mockChannelPublish.mockImplementation(() => {
					throw new Error(publishErrorMessage)
				})
				const closeErrorMessage = "Unable to assert exchange"
				mockChannelClose.mockRejectedValue(new Error(closeErrorMessage))

				const response = await isolatedRabbitMQ.publish(
					channel,
					exchange,
					routingKey,
					message,
				)

				expect(response).toBe(false)
				expect(mockChannelPublish).toHaveBeenCalled()
				expect(logger.error).toHaveBeenCalledWith(
					`Error publishing RabbitMQ message to exchange '${exchange}' with routingKey '${routingKey}':`,
					publishErrorMessage,
				)
				expect(mockChannelClose).toHaveBeenCalled()
				expect(logger.warn).toHaveBeenCalledWith(
					`Error closing channel '${channel}':`,
					closeErrorMessage,
				)
			})
		})
	})

	describe("consume", () => {
		describe("declare queue", () => {
			it("should create exchange", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const response = await isolatedRabbitMQ.consume(
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
			})

			it("should not create queue when exchange failed to create", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const errorMessage = "Unable to create exchange"
					mockChannelAssertExchange.mockRejectedValue(
						new Error(errorMessage),
					)

					const response = await isolatedRabbitMQ.consume(
						channel,
						queue,
						bindings,
						() => undefined,
					)

					expect(response).toBe(false)
					expect(logger.error).toHaveBeenCalledTimes(2)
					expect(logger.error).toHaveBeenNthCalledWith(
						1,
						`Failed to create RabbitMQ exchange '${Object.keys(bindings)[0]}':`,
						errorMessage,
					)
					expect(logger.error).toHaveBeenNthCalledWith(
						2,
						`Failed to create RabbitMQ exchange '${Object.keys(bindings)[1]}':`,
						errorMessage,
					)
					expect(mockChannelAssertExchange).toHaveBeenCalledTimes(2)
					expect(mockChannelAssertQueue).not.toHaveBeenCalled()
					expect(mockChannelBindQueue).not.toHaveBeenCalled()
					expect(mockChannelConsume).not.toHaveBeenCalled()
				})
			})

			it("should create queue", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const response = await isolatedRabbitMQ.consume(
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
			})

			it("should not create queue when channel failed to create", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const errorMessage = "Unable to create channel"
					mockCreateChannel.mockRejectedValue(new Error(errorMessage))

					const response = await isolatedRabbitMQ.consume(
						channel,
						queue,
						bindings,
						() => undefined,
					)

					expect(response).toBe(false)
					expect(logger.error).toHaveBeenCalledWith(
						`Failed to create RabbitMQ channel '${channel}':`,
						errorMessage,
					)
					expect(mockChannelAssertExchange).not.toHaveBeenCalled()
					expect(mockChannelAssertQueue).not.toHaveBeenCalled()
					expect(mockChannelBindQueue).not.toHaveBeenCalled()
					expect(mockChannelConsume).not.toHaveBeenCalled()
				})
			})

			it("should return when unable to create queue", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const errorMessage = "Unable to create queue"
					mockChannelAssertQueue.mockRejectedValue(
						new Error(errorMessage),
					)

					const response = await isolatedRabbitMQ.consume(
						channel,
						queue,
						bindings,
						() => undefined,
					)

					expect(response).toBe(false)
					expect(mockChannelAssertExchange).toHaveBeenCalled()
					expect(mockChannelAssertQueue).toHaveBeenCalled()
					expect(logger.error).toHaveBeenCalledWith(
						`Failed to create RabbitMQ queue '${queue}':`,
						errorMessage,
					)
					expect(mockChannelBindQueue).not.toHaveBeenCalled()
					expect(mockChannelConsume).not.toHaveBeenCalled()
				})
			})

			it("should log error message when unable to bind to queue", async () => {
				await jest.isolateModulesAsync(async () => {
					const isolatedRabbitMQ = await import(
						"@/infrastructure/rabbitMQ"
					)

					const errorMessage = "Unable to create queue"
					mockChannelBindQueue
						.mockResolvedValueOnce(true)
						.mockRejectedValueOnce(new Error(errorMessage))

					const response = await isolatedRabbitMQ.consume(
						channel,
						queue,
						bindings,
						() => undefined,
					)

					expect(response).toBe(true)
					expect(mockChannelAssertExchange).toHaveBeenCalled()
					expect(mockChannelAssertQueue).toHaveBeenCalled()
					expect(mockChannelBindQueue).toHaveBeenCalledTimes(2)
					expect(logger.error).toHaveBeenCalledOnce()
					expect(logger.error).toHaveBeenCalledWith(
						`Failed to bind 'fastifyTemplate.unitTest.B' to RabbitMQ exchange 'exchangeB' for queue '${queue}':`,
						errorMessage,
					)
					expect(mockChannelConsume).toHaveBeenCalled()
				})
			})
		})

		it("should consume messages", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				const response = await isolatedRabbitMQ.consume(
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
		})

		it("should log error message message when unable to consume", async () => {
			await jest.isolateModulesAsync(async () => {
				const isolatedRabbitMQ = await import(
					"@/infrastructure/rabbitMQ"
				)

				const errorMessage = "Unable to create queue"
				mockChannelConsume.mockRejectedValue(new Error(errorMessage))

				const response = await isolatedRabbitMQ.consume(
					channel,
					queue,
					bindings,
					() => undefined,
				)

				expect(response).toBe(false)
				expect(logger.error).toHaveBeenCalledWith(
					`Failed to start consumer on RabbitMQ queue '${queue}':`,
					errorMessage,
				)
			})
		})
	})
})
