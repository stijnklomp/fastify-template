import { createClient } from "redis"

import { logger } from "@/src/common/logger"

let redisClient: ReturnType<typeof createClient> | undefined

const createClientConnection = async () => {
	const client = createClient({
		password: process.env.REDIS_PASSWORD,
		socket: {
			host: process.env.REDIS_HOST,
			port: Number(process.env.REDIS_PORT),
		},
	})

	client.on("error", (err: Error) => {
		logger.error("Redis client error", err)
		process.exit(1)
	})

	client.on("connect", () =>
		logger.info(
			`Redis client connected on port ${process.env.REDIS_PORT ?? "6379"}`,
		),
	)

	return client.connect()
}

export const init = async () => createClientConnection()

export const getPrimary = () => {
	if (!redisClient) throw new Error("Redis client not initialized")

	return redisClient
}

export default {
	getPrimary,
	init,
}
