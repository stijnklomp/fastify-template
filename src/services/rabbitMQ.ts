import amqplib, { Channel } from "amqplib"

import { logger } from "@/common/logger"

const fallbackExchangeForNonRoutedMessages = "nonRouted"
const deadLetterExchange = "deadLetter"

let connection: amqplib.ChannelModel | undefined
const channels = new Map<string, amqplib.Channel>()

/**
 * Close RabbitMQ connection.
 * @remarks Throws if the cache client is not initialized.
 */
export const close = async () => {
	if (typeof connection === "undefined") return

	try {
		await connection.close()
		logger.info("RabbitMQ connection closed")
	} catch (err) {
		logger.error("Error closing RabbitMQ connection:", err)

		throw err
	}
}

/**
 * Cleanup RabbitMQ connection on application exit/abort.
 */
const cleanupOnExit = () => {
	process.on("SIGINT", () => {
		close()
			.then(() => {
				process.exit(0)
			})
			.catch(() => {
				process.exit(1)
			})
	})

	process.on("SIGTERM", () => {
		close()
			.then(() => {
				process.exit(0)
			})
			.catch(() => {
				process.exit(1)
			})
	})
}

const { RABBIT_HOST, RABBIT_USER, RABBIT_PASS, RABBIT_PORT, RABBIT_TRANSPORT } =
	process.env

/**
 * @remarks Exits the process on connection failure.
 */
export const init = async () => {
	if (connection !== undefined) return

	const rabbitPort = RABBIT_PORT ?? "5671"
	const connectionUrl = `${RABBIT_TRANSPORT ?? "amqp"}://${RABBIT_USER ?? "guest"}:${RABBIT_PASS ?? "guest"}@${RABBIT_HOST ?? "0.0.0.0"}:${rabbitPort}`

	try {
		connection = await amqplib.connect(connectionUrl)
		logger.info(`RabbitMQ connected on port '${rabbitPort}'`)
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
 * @remarks Will return `true` if a channel key already exists without overriding.
 * @param channel Key of the channel.
 * @returns Channel declared.
 */
export const declareChannel = async (channel: string) => {
	if (typeof connection === "undefined") {
		await init()
	}

	if (channel in channels) return true

	try {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		channels[channel] = await connection!.createChannel()
		logger.info("RabbitMQ channel successfully created")
	} catch (err) {
		logger.error("Failed to create RabbitMQ channel:", err)

		return false
	}

	return true
}

/**
 * @param channel Key of the channel to use.
 * @returns Exchange declared.
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
	} catch (err) {
		logger.error(`Failed to assert exchange'${exchange}':`, err)

		return false
	}

	return true
}

export type Bindings = Record<string, string>

/**
 * @param channel Key of the channel to use.
 * @param bindings Exchanges with binding keys.
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
 * @returns Queue declared.
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
	} catch (err) {
		logger.error(`Failed to assert queue '${queue}':`, err)

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
 * @param channel Key of the channel to use.
 * @returns Publish succeeded.
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
	} catch (err) {
		logger.error(
			`Error publishing RabbitMQ message on channel ${channel}:`,
			err,
		)

		// Close the channel and possibly the connection in case of error
		channels
			.get(channel)
			?.close()
			.catch((closeErr: unknown) => {
				console.error(`Error closing channel ${channel}:`, closeErr)
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
 * @param channel Key of the channel to use.
 * @param bindings Exchanges with binding keys.
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
 * @param callback Callback that gets invoked for each published message. *(Requires acknowledgement)*
 * @returns Successfully consuming.
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
	} catch (err) {
		logger.error(`Failed to start consumer on queue '${queue}':`, err)

		return false
	}

	return true
}

export default {
	close,
	consume,
	declareChannel,
	declareExchange,
	declareQueue,
	init,
	publish,
}
