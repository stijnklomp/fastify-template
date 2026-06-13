import { logger, loggerEnv } from "@/common/logger"
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

		const success = await queueClient.consume(
			"worker",
			queueName,
			{ [exchange]: bindingKey },
			(msg, channel) => {
				if (msg === null) return

				const content = msg.content.toString()
				logger.info(
					{ queue: { ...queueDetails, msg: content } },
					"Worker received message",
				)

				try {
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
					channel.nack(msg, false, false)
				}
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

if (loggerEnv !== "test") void startWorker()
