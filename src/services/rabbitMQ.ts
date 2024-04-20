import { sendToEvent, subscribe } from "@/adapters/rabbitMQ"

const rabbitMQService = {
	sendToEvent: (payload: object) => {
		const result = sendToEvent(payload)

		return result
	},
	subscribeToEvent: (q: string, listener: Function) => subscribe(q, listener),
}

export default rabbitMQService
