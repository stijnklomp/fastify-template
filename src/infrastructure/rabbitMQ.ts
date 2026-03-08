import amqplib, {
	type ChannelModel,
	type Channel,
	type ConsumeMessage,
} from "amqplib"

import { logger, formatError } from "@/common/logger"

const fallbackExchangeForNonRoutedMessages = "nonRouted"
const deadLetterExchange = "deadLetter"

/**
 * Cleanup RabbitMQ connection on application exit/abort.
 */
const cleanupOnExit = (close: () => Promise<void>) => {
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

export type Bindings = Record<string, string>

// export type ConsumeCallback = Parameters<Channel["consume"]>[1]
export type ConsumeCallback = (
	msg: ConsumeMessage | null,
	channel: Channel,
) => void

export const createQueueClient = () => {
	const rabbitDisabled = process.env.RABBIT_DISABLED ?? "false"
	const {
		RABBIT_HOST,
		RABBIT_USER,
		RABBIT_PASSWORD,
		RABBIT_PORT,
		RABBIT_TRANSPORT,
	} = process.env

	let connection: ChannelModel | undefined
	const channels = new Map<string, Channel>()

	/**
	 * @remarks Exits the process on connection failure.
	 */
	const init = async () => {
		if (rabbitDisabled !== "false" || typeof connection !== "undefined")
			return

		const rabbitPort = RABBIT_PORT ?? "5671"
		const connectionUrl = `${RABBIT_TRANSPORT ?? "amqp"}://${RABBIT_USER ?? "guest"}:${RABBIT_PASSWORD ?? "guest"}@${RABBIT_HOST ?? "0.0.0.0"}:${rabbitPort}`

		try {
			connection = await amqplib.connect(connectionUrl)
			logger.info(`RabbitMQ connected on port '${rabbitPort}'`)
		} catch (err) {
			logger.error({
				err: formatError(err),
				msg: "Error initializing RabbitMQ",
			})
			process.exit(1)
		}
	}

	/**
	 * Close RabbitMQ connection.
	 * @remarks Throws if the cache client is not initialized.
	 */
	const close = async () => {
		if (typeof connection === "undefined") return

		try {
			await connection.close()
			logger.info("RabbitMQ connection closed")
		} catch (err) {
			logger.error({
				err: formatError(err),
				msg: "Error closing RabbitMQ connection",
			})

			throw err
		}
	}

	cleanupOnExit(close)

	/**
	 * Add/overwrite a channel to the RabbitMQ singleton channels list.
	 *
	 * *If the RabbitMQ connection is not initialized, it will be initialized first.*
	 *
	 * @remarks Will return `true` if a channel key already exists without overriding.
	 * @param channel Key of the channel.
	 * @returns Channel declared.
	 */
	const declareChannel = async (channel: string) => {
		await init()

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (channels.has(channel)) return channels.get(channel)!

		try {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const newChannel = await connection!.createChannel()

			channels.set(channel, newChannel)
			logger.info("RabbitMQ channel successfully created")

			return newChannel
		} catch (err) {
			logger.error({
				err: formatError(err),
				msg: `Failed to create RabbitMQ channel '${channel}'`,
			})

			return undefined
		}
	}

	/**
	 * @param exchange Name of the exchange. Defaults to `"main"`.
	 * @returns Exchange declared.
	 */
	const declareExchange = async (
		channel: amqplib.Channel,
		exchange = "main",
	) => {
		try {
			await channel.assertExchange(exchange, "topic", {
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
			logger.error({
				err: formatError(err),
				msg: `Failed to create RabbitMQ exchange '${exchange}'`,
			})

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
	const publish = async (
		channel: string,
		exchange: string,
		routingKey: string,
		message: string,
	) => {
		const createdChannel = await declareChannel(channel)

		if (createdChannel === undefined) {
			logger.error({
				msg: `RabbitMQ channel '${channel}' not found`,
			})

			return false
		}

		if (!(await declareExchange(createdChannel, exchange))) return false

		const locationMessage = `to exchange '${exchange}' with routingKey '${routingKey}'`

		try {
			const success = createdChannel.publish(
				exchange,
				routingKey,
				Buffer.from(message),
			)

			if (!success) {
				createdChannel.once("drain", () => {
					logger.error({
						msg: `Unable to publish RabbitMQ message ${locationMessage}. Drain event received.`,
					})
				})

				return false
			}
		} catch (err) {
			logger.error({
				err: formatError(err),
				msg: `Error publishing RabbitMQ message ${locationMessage}`,
			})

			await createdChannel
				.close()
				.then(() => {
					logger.debug(`Closed channel '${channel}'`)
				})
				.catch((closeErr: unknown) => {
					logger.warn({
						err: formatError(closeErr),
						msg: `Error closing channel '${channel}'`,
					})
				})

			channels.delete(channel)

			return false
		}

		logger.info(
			`Successfully published RabbitMQ message ${locationMessage}`,
		)

		return true
	}

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
	 *   'exchangeA': 'binding.key.a',
	 *   'exchangeB': 'binding.key.b'
	 * }
	 * ```
	 * @remarks At least one entry is required in the `bindings` object
	 * @returns Queue declared.
	 */
	const declareQueue = async (
		channel: string,
		queue: string,
		bindings: Bindings = {},
	) => {
		const createdChannel = await declareChannel(channel)

		if (createdChannel === undefined) {
			logger.error({
				msg: `RabbitMQ channel '${channel}' not found`,
			})

			return false
		}

		const exchangeDeclarationResults = await Promise.allSettled(
			Object.keys(bindings).map((source) =>
				declareExchange(createdChannel, source),
			),
		)

		for (const result of exchangeDeclarationResults) {
			if (result.status === "rejected" || !result.value) {
				return false
			}
		}

		try {
			await createdChannel.assertQueue(queue, {
				autoDelete: false,
				deadLetterExchange,
				durable: true,
				exclusive: false,
				messageTtl: 3600000, // 1 hour
			})
		} catch (err) {
			logger.error({
				err: formatError(err),
				msg: `Failed to create RabbitMQ queue '${queue}'`,
			})

			return false
		}

		const entries = Object.entries(bindings)
		const queueBindingResults = await Promise.all(
			entries.map(async ([source, binding]) => {
				try {
					await createdChannel.bindQueue(queue, source, binding)

					return {
						binding,
						source,
						status: "fulfilled",
					}
				} catch (reason) {
					return {
						binding,
						reason,
						source,
						status: "rejected",
					}
				}
			}),
		)

		queueBindingResults.forEach((result) => {
			if (result.status === "rejected") {
				logger.error({
					err: formatError(result.reason),
					msg: `Failed to bind '${result.binding}' to RabbitMQ exchange '${result.source}' for queue '${queue}'`,
				})
			}
		})

		return true
	}

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
	const consume = async (
		channel: string,
		queue: string,
		bindings: Bindings,
		callback: ConsumeCallback,
	) => {
		if (!(await declareQueue(channel, queue, bindings))) return false

		// await channels.get(channel)?.prefetch(1)

		try {
			const usedChannel: Channel | undefined = channels.get(channel)
			await usedChannel?.consume(
				queue,
				(msg) => {
					callback(msg, usedChannel)
				},
				{ noAck: false },
			)
		} catch (err) {
			logger.error({
				err: formatError(err),
				msg: `Failed to start consumer on RabbitMQ queue '${queue}'`,
			})

			return false
		}

		logger.info(`Started consuming RabbitMQ messages on queue '${queue}'`)

		return true
	}

	return {
		close,
		consume,
		declareChannel,
		init,
		publish,
	}
}

export const queueClient = createQueueClient()
