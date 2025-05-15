import amqplib, { Channel } from "amqplib"

import { logger, formatError } from "@/common/logger"

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
		logger.error("Error closing RabbitMQ connection:", formatError(err))

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
	if (typeof connection !== "undefined") return

	const rabbitPort = RABBIT_PORT ?? "5671"
	const connectionUrl = `${RABBIT_TRANSPORT ?? "amqp"}://${RABBIT_USER ?? "guest"}:${RABBIT_PASS ?? "guest"}@${RABBIT_HOST ?? "0.0.0.0"}:${rabbitPort}`

	try {
		connection = await amqplib.connect(connectionUrl)
		logger.info(`RabbitMQ connected on port '${rabbitPort}'`)
	} catch (err) {
		logger.error("Error initializing RabbitMQ:", formatError(err))
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
	await init()

	if (channels.has(channel)) return true

	try {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		channels.set(channel, await connection!.createChannel())
		logger.info("RabbitMQ channel successfully created")
	} catch (err) {
		logger.error("Failed to create RabbitMQ channel:", formatError(err))

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
		logger.error(
			`Failed to create RabbitMQ exchange '${exchange}':`,
			formatError(err),
		)

		return false
	}

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
	if (!(await declareExchange(channel, exchange))) return false

	const locationMessage = `to exchange '${exchange}' with bindingKey '${bindingKey}'`

	try {
		const success = channels
			.get(channel)
			?.publish(exchange, bindingKey, Buffer.from(message))

		if (!success) {
			channels.get(channel)?.once("drain", () => {
				logger.error(
					`Unable to publish RabbitMQ message ${locationMessage}. Drain event received.`,
				)
			})

			return false
		}
	} catch (err) {
		logger.error(
			`Error publishing RabbitMQ message ${locationMessage}:`,
			err instanceof Error ? err.message : String(err),
		)

		await channels
			.get(channel)
			?.close()
			.then(() => {
				logger.debug(`Closed channel '${channel}'`)
			})
			.catch((closeErr: unknown) => {
				logger.warn(
					`Error closing channel '${channel}':`,
					formatError(closeErr),
				)
			})

		channels.delete(channel)

		return false
	}

	logger.info(`Successfully published RabbitMQ message ${locationMessage}`)

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
		logger.error(
			`Failed to create RabbitMQ queue '${queue}':`,
			formatError(err),
		)

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
					`Failed to bind '${Object.values(bindings)[index]}' to RabbitMQ exchange '${Object.keys(bindings)[index]}' for queue '${queue}':`,
					formatError(result.reason),
				)
			}
		})
	})

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
		logger.error(
			`Failed to start consumer on RabbitMQ queue '${queue}':`,
			formatError(err),
		)

		return false
	}

	logger.info(`Started consuming RabbitMQ messages on queue '${queue}'`)

	return true
}

export default {
	close,
	consume,
	declareChannel,
	init,
	publish,
}
