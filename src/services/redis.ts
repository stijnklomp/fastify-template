import { getPrimary } from "@/adapters/redis"

export const getClient = () => getPrimary()

export const get = async (key: string) => {
	const redis = getClient()
	const set = await redis.get(key)

	return set
}

export const set = async (key: string, value: string) => {
	console.log("getPrimary:", getPrimary)
	console.log("getPrimary():", getPrimary())
	const redis = getClient()
	console.log("redis:", redis)
	const set = await redis.set(key, value)

	type Test = ReturnType<typeof getClient>["set"]

	return set
}

export const del = async (key: string) => {
	const redis = getClient()
	const set = await redis.del(key)

	return set
}

export default {
	getClient,
	get,
	set,
	del,
}
