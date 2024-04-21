import { getPrimary } from "@/adapters/redis"

export const getRedisClient = () => getPrimary()

export const setInRedis = async (key: string, value: string) => {
	const redis = getRedisClient()
	const set = await redis.set(key, value)

	return set
}

export const getFromRedis = async (key: string) => {
	const redis = getRedisClient()
	const set = await redis.get(key)

	return set
}

export const deleteInRedis = async (key: string) => {
	const redis = getRedisClient()
	const set = await redis.del(key)

	return set
}

export default {
	getRedisClient,
	setInRedis,
	getFromRedis,
	deleteInRedis,
}
