import { Channel, connect, Options, ConsumeMessage } from "amqplib"
import { logger } from "@/lib/logger"

const { RABBIT_HOST, RABBIT_USER, RABBIT_PASS, RABBIT_PORT } = process.env

let channel: Channel | undefined

export const init = async () => {
	const CONN_URL = `${process.env.RABBIT_TRANSPORT}://${RABBIT_USER}:${RABBIT_PASS}@${RABBIT_HOST}:${RABBIT_PORT}`

	try {
		const connection = await connect(CONN_URL)
		logger.info(`RabbitMQ connected on port: ${RABBIT_PORT}`)
		channel = await connection.createChannel()

		return channel
	} catch (err) {
		logger.error("Error initializing RabbitMQ: ", err)
		process.exit(1)
	}
}

export const send = async (q: string, payload: Buffer) => {
	if (!channel) return

	await channel.assertQueue(q, { durable: true })
	channel.sendToQueue(q, payload, {
		persistent: true,
		contentType: "application/json",
	})
}

export type ConsumeCallback = (
	channel: Channel,
	payload: ConsumeMessage,
	content: any,
) => unknown

export const consume = async (q: string, cb: ConsumeCallback) => {
	if (!channel) return

	await channel.assertQueue(q, { durable: true })
	await channel.prefetch(1)

	await channel.consume(
		q,
		(payload) => {
			if (!payload) return
			cb(channel!, payload, JSON.parse(payload.content.toString()))
		},
		{ noAck: false },
	)
}

export const close = () => {
	// connection.close()
}

export const createExchange = async (
	exchange: string,
	type: string,
	queue: string,
	routingKey: string,
	options?: Options.AssertQueue,
) => {
	if (!channel) return
	// Create Exchange
	await channel.assertExchange(exchange, type, { durable: true })

	// Create Queue
	await channel.assertQueue(queue, options)

	// Bind Queue to Exchange
	await channel.bindQueue(queue, exchange, routingKey)
}

export const sendToExchange = (
	exchange: string,
	routingKey: string,
	payload: object,
) => {
	if (!channel) return

	channel.publish(
		exchange,
		routingKey,
		Buffer.from(JSON.stringify(payload)),
		{
			persistent: true,
			contentType: "application/json",
		},
	)
}

export default {
	init,
	send,
	consume,
	close,
	createExchange,
	sendToExchange,
}
