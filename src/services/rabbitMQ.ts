import { ConsumeCallback } from "@/lib/rabbitMQ"
import {
	sendToEvent as sendToEventAdapter,
	subscribe,
} from "@/adapters/rabbitMQ"

export const sendToEvent = (payload: object) => {
	const result = sendToEventAdapter(payload)

	return result
}

export const subscribeToEvent = (q: string, listener: ConsumeCallback) =>
	subscribe(q, listener)

export default {
	sendToEvent,
	subscribeToEvent,
}
