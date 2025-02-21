import { ConsumeCallback } from "@/src/common/rabbitMQ"
import {
	sendToEvent as sendToEventAdapter,
	subscribe,
} from "@/adapters/rabbitMQ"

export const sendToEvent = (payload: object) => {
	sendToEventAdapter(payload)
}

export const subscribeToEvent = (q: string, listener: ConsumeCallback) =>
	subscribe(q, listener)

export default {
	sendToEvent,
	subscribeToEvent,
}
