import amqplib, { Channel } from "amqplib"
import { logger } from "@/src/common/logger"

const fallbackExchangeForNonRoutedMessages = "nonRouted"
const deadLetterExchange = "deadLetter"
const { RABBIT_HOST, RABBIT_USER, RABBIT_PASS, RABBIT_PORT } = process.env

let connection: amqplib.Connection | undefined
const channels = new Map<string, amqplib.Channel>()

/**
 * Close RabbitMQ connection.
 * @returns connection closed.
 */
export const close = async () => {
	try {
		if (connection) {
			await connection.close()
			logger.info("RabbitMQ connection closed.")
		}
	} catch (error) {
		logger.error("Error closing RabbitMQ connection:", error)

		return false
	}

	return true
}

/**
 * Cleanup RabbitMQ connection on application exit/abort.
 */
const cleanupOnExit = () => {
	process.on("exit", () => close)
	process.on("SIGINT", () => close)
	process.on("SIGTERM", () => close)
}

/**
 * @remarks exits the process on connection failure.
 */
const init = async () => {
	const rabbitPort = RABBIT_PORT ?? "5671"
	const connectionUrl = `${process.env.RABBIT_TRANSPORT ?? "amqp"}://${RABBIT_USER ?? "guest"}:${RABBIT_PASS ?? "guest"}@${RABBIT_HOST ?? "0.0.0.0"}:${rabbitPort}`

	try {
		connection = await amqplib.connect(connectionUrl)
		logger.info(`RabbitMQ connected on port: ${rabbitPort}`)
	} catch (err) {
		logger.error("Error initializing RabbitMQ:", err)
		process.exit(1)
	}

	cleanupOnExit()
}

/**
 * Add/overwrite a channel to the RabbitMQ singleton channels list.
 *
 * *If the RabbitMQ connection is not initialized, it will be initialized first.*
 *
 * @param channel key of the channel.
 * @returns channel declared.
 */
export const declareChannel = async (channel: string) => {
	if (channels.has(channel)) return true

	if (typeof connection === "undefined") {
		await init()
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		channels[channel] = await connection!.createChannel()
		logger.info("RabbitMQ channel successfully created.")
	} catch (error) {
		logger.error("Failed to create RabbitMQ channel:", error)

		return false
	}

	return true
}

/**
 * @param channel key of the channel to use.
 * @returns exchange declared.
 */
const declareExchange = async (channel: string, exchange = "main") => {
	if (!(await declareChannel(channel))) return false

	try {
		await channels.get(channel)?.assertExchange(exchange, "topic", {
			alternateExchange: fallbackExchangeForNonRoutedMessages,
			arguments: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				"x-message-ttl": 86400000, // 24 hours
			},
			autoDelete: false,
			durable: true,
			internal: false,
		})
	} catch (error) {
		logger.error(`Failed to assert exchange'${exchange}':`, error)

		return false
	}

	return true
}

export type Bindings = Record<string, string>

/**
 * @param channel key of the channel to use.
 * @param bindings exchanges with binding keys.
 *
 * The keys of the object represent the exchange names
 * and the values represent the corresponding binding keys.
 *
 * @example
 * ```ts
 * {
 *   'exchangeA': 'routing.key.a',
 *   'exchangeB': 'routing.key.b'
 * }
 * ```
 * @returns queue declared.
 */
const declareQueue = async (
	channel: string,
	queue: string,
	bindings: Bindings = {},
) => {
	if (!(await declareChannel(channel))) return false

	try {
		await channels.get(channel)?.assertQueue(queue, {
			autoDelete: false,
			deadLetterExchange,
			durable: true,
			exclusive: false,
			messageTtl: 3600000, // 1 hour
		})
	} catch (error) {
		logger.error(`Failed to assert queue '${queue}':`, error)

		return false
	}

	await Promise.allSettled(
		Object.keys(bindings).map((source) =>
			channels.get(channel)?.bindQueue(queue, source, bindings[source]),
		),
	).then((results) => {
		results.forEach((result, index) => {
			if (result.status === "rejected") {
				logger.error(
					`Failed to bind '${Object.values(bindings)[index]}' to queue '${queue}':`,
					result.reason,
				)
			}
		})
	})

	return true
}

/**
 * Publish message.
 *
 * @param channel key of the channel to use.
 * @returns publish succeeded.
 */
export const publish = async (
	channel: string,
	exchange: string,
	bindingKey: string,
	message: string,
) => {
	if (!(await declareExchange(channel))) return false

	try {
		const success = channels
			.get(channel)
			?.publish(exchange, bindingKey, Buffer.from(message))

		if (!success) {
			channels.get(channel)?.once("drain", () => {
				logger.info(
					`Drain event received, resuming publishing RabbitMQ message for channel: ${channel}`,
				)
			})

			return false
		}
	} catch (error) {
		logger.error(
			`Error publishing RabbitMQ message on channel ${channel}:`,
			error,
		)

		// Close the channel and possibly the connection in case of error
		channels
			.get(channel)
			?.close()
			.catch((closeError: unknown) => {
				console.error(`Error closing channel ${channel}:`, closeError)
			})

		channels.delete(channel)

		return false
	}

	return true
}

export type ConsumeCallback = Parameters<Channel["consume"]>[1]

/**
 * Consume messages.
 *
 * @param channel key of the channel to use.
 * @param bindings exchanges with binding keys.
 *
 * The keys of the object represent the exchange names
 * and the values represent the corresponding binding keys.
 *
 * @example
 * ```ts
 * {
 *   'exchangeA': 'routing.key.a',
 *   'exchangeB': 'routing.key.b'
 * }
 * ```
 *
 * @param callback callback that gets invoked for each published message. *(Requires acknowledgement)*
 * @returns successfully consuming.
 */
export const consume = async (
	channel: string,
	queue: string,
	bindings: Bindings,
	callback: ConsumeCallback,
) => {
	if (!(await declareQueue(channel, queue, bindings))) return false

	// await channels.get(channel)?.prefetch(1)

	try {
		await channels.get(channel)?.consume(queue, callback, { noAck: false })
	} catch (error) {
		logger.error(`Failed to start consumer on queue '${queue}':`, error)

		return false
	}

	return true
}
