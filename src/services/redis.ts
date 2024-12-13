import { getPrimary } from "@/adapters/redis"

export const getClient = () => getPrimary()

export const get = async (key: string) => {
	const redis = getClient()

	return await redis.get(key)
}

export const set = async (key: string, value: string) => {
	const redis = getClient()

	return await redis.set(key, value)
}

export const del = async (key: string) => {
	const redis = getClient()

	return await redis.del(key)
}

export default {
	del,
	get,
	getClient,
	set,
}
