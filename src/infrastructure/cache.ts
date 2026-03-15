import { createClient } from "redis"

import { logger } from "@/common/logger"

export const createCacheClient = () => {
	let client: ReturnType<typeof createClient> | undefined

	/**
	 * @remarks Exits the process on connection failure.
	 */
	const init = async () => {
		const cacheDisabled = process.env.CACHE_DISABLED ?? "false"

		if (cacheDisabled !== "false" || client) return

		const CACHE_PORT = process.env.CACHE_PORT ?? "6379"
		const CACHE_HOST = process.env.CACHE_HOST ?? "localhost"
		const CACHE_PASSWORD = process.env.CACHE_PASSWORD ?? ""

		const createdClient = createClient({
			password: CACHE_PASSWORD,
			socket: {
				host: CACHE_HOST,
				port: Number(CACHE_PORT),
			},
		})

		createdClient.on("error", (err: Error) => {
			// logger.error("Error initializing cache client:", err
			logger.error(err)
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

	/**
	 * @remarks Throws if the cache client is not initialized.
	 */
	const get = async (key: string) => getClient().get(key)

	/**
	 * @remarks Throws if the cache client is not initialized.
	 */
	const set = async (key: string, value: string) =>
		getClient().set(key, value)

	/**
	 * @remarks Throws if the cache client is not initialized.
	 */
	const del = async (key: string) => getClient().del(key)

	return {
		del,
		get,
		init,
		set,
	}
}

export const cacheClient = createCacheClient()
