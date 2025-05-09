import { getPrimary } from "@/src/common/cache"

export const getClient = () => getPrimary()

export const get = async (key: string) => getClient().get(key)

export const set = async (key: string, value: string) =>
	getClient().set(key, value)

export const del = async (key: string) => getClient().del(key)

export default {
	del,
	get,
	getClient,
	set,
}
