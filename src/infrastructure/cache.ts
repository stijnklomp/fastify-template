import { createClient } from "redis"

import { logger, formatError } from "@/common/logger"

let client: ReturnType<typeof createClient> | undefined
const CACHE_PORT = process.env.CACHE_PORT ?? "6379"
const CACHE_HOST = process.env.CACHE_HOST ?? "localhost"
const CACHE_PASSWORD = process.env.CACHE_PASSWORD ?? ""

/**
 * @remarks Exits the process on connection failure.
 */
export const init = async () => {
	if (typeof client !== "undefined") return

	const createdClient = createClient({
		password: CACHE_PASSWORD,
		socket: {
			host: CACHE_HOST,
			port: Number(CACHE_PORT),
		},
	})

	createdClient.on("error", (err: Error) => {
		logger.error("Error initializing cache client:", formatError(err))
		process.exit(1)
	})

	createdClient.on("connect", () => {
		logger.info(`Cache client connected on port '${CACHE_PORT}'`)
	})

	await createdClient.connect()

	client = createdClient
}

/**
 * @remarks Throws if the cache client is not initialized.
 */
const getClient = () => {
	if (typeof client === "undefined")
		throw new Error("Cache client not initialized")

	return client
}

export const get = async (key: string) => getClient().get(key)

export const set = async (key: string, value: string) =>
	getClient().set(key, value)

export const del = async (key: string) => getClient().del(key)

export default {
	del,
	get,
	init,
	set,
}
