import { createClient } from "redis"

import { logger } from "@/src/common/logger"

let client: ReturnType<typeof createClient> | undefined
const CACHE_PORT = Number(process.env.CACHE_PORT ?? "6379")
const CACHE_HOST = process.env.CACHE_HOST ?? "localhost"
const CACHE_PASSWORD = process.env.CACHE_PASSWORD ?? ""

const createClientConnection = async () => {
	const createdClient = createClient({
		password: CACHE_PASSWORD,
		socket: {
			host: CACHE_HOST,
			port: Number(CACHE_PORT),
		},
	})

	createdClient.on("error", (err: Error) => {
		logger.error("Cache client error", err)
		process.exit(1)
	})

	createdClient.on("connect", () =>
		logger.info(
			`Cache client connected on port ${process.env.CACHE_PORT ?? "6379"}`,
		),
	)

	client = await createdClient.connect()

	return client
}

export const init = async () => createClientConnection()

export const getPrimary = () => {
	if (!client) throw new Error("Cache client not initialized")

	return client
}

export default {
	getPrimary,
	init,
}
