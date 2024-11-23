import { getPrimary } from "@/adapters/redis"

export const getClient = () => getPrimary()

export const get = async (key: string) => {
	const redis = getClient()
	const set = await redis.get(key)

	return set
}

export const set = async (key: string, value: string) => {
	const redis = getClient()
	const set = await redis.set(key, value)

	return set
}

export const del = async (key: string) => {
	const redis = getClient()
	const set = await redis.del(key)

	return set
}

export default {
	del,
	get,
	getClient,
	set,
}
