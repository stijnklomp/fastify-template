import { type Channel, type ConsumeMessage } from "amqplib"

import { logger } from "@/common/logger"
import { queueClient } from "@/infrastructure/rabbitMQ"

const processTask = (task: string): unknown => {
	return { originalLength: task.length, processed: true }
}

export const startWorker = async () => {
	logger.info("Starting Worker process")

	const queueName = process.env.WORKER_QUEUE ?? "task_queue"
	const exchange = process.env.WORKER_EXCHANGE ?? "main"
	const bindingKey = process.env.WORKER_BINDING_KEY ?? "task.#"
	const queueDetails = {
		bindingKey,
		channel: "worker",
		exchange,
		queueName,
	}

	try {
		await queueClient.init()

		const handleMessage = async (
			msg: ConsumeMessage | null,
			channel: Channel,
		) => {
			if (msg === null) return

			let content = "UNPARSEABLE"

			try {
				content = msg.content.toString()

				logger.info(
					{ queue: { ...queueDetails, msg: content } },
					"Worker received message",
				)

				const result = processTask(content)

				logger.info({ result }, "Worker processed message")
				channel.ack(msg)
			} catch (err) {
				logger.error(
					{
						err,
						queue: { ...queueDetails, msg: content },
					},
					"Worker failed to process message",
				)

				const dlqPayload = JSON.stringify({
					error: err instanceof Error ? err.message : String(err),
					errorName: err instanceof Error ? err.name : "Unknown",
					failedAt: new Date().toISOString(),
					originalContent: content,
					queueName,
				})

				const dlqPublished = await queueClient.publish(
					"worker",
					"deadLetter",
					`${queueName}.failed`,
					dlqPayload,
				)

				if (!dlqPublished) {
					logger.error(
						{ err, queue: { ...queueDetails, msg: content } },
						"Worker failed to publish to DLQ",
					)
				}

				channel.ack(msg)
			}
		}

		const success = await queueClient.consume(
			"worker",
			queueName,
			{ [exchange]: bindingKey },
			(msg, channel) => {
				void handleMessage(msg, channel)
			},
		)

		if (!success) {
			logger.error(
				{ queue: queueDetails },
				"Worker failed to start consuming",
			)
			process.exit(1)
		}

		logger.info(
			{ queue: queueDetails },
			"Worker is running and waiting for messages",
		)
	} catch (err) {
		logger.error({ err, queue: queueDetails }, "Failed to start Worker")
		process.exit(1)
	}
}

if (process.env.NODE_ENV !== "test") void startWorker()
